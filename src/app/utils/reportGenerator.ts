// reportGenerator.ts
// Reusable report generation utility.
// - buildReportPayload(vehicle, type): builds server payload
// - createReportHtml(vehicle, type): creates simple HTML report
// - downloadReportUsingVehicle(vehicle, type): tries client-side PDF generation, falls back to server POST
// - downloadReportAndTrigger(vehicle, type): performs download (creates blob URL and clicks link)

import { getAuthHeaders } from './auth';
import { renderReportTemplate } from './reportTemplates';

type Vehicle = any;

export function buildReportPayload(vehicle: Vehicle, reportType: 'winner' | 'seller') {
	return {
		ac_no: vehicle.ac_no,
		ac_code_id: vehicle.ac_code_id,
		ac_car_model: vehicle.ac_car_model,
		ac_car_no: vehicle.ac_car_no,
		ac_type: vehicle.ac_type,
		ac_owner_name: vehicle.ac_owner_name,
		ac_owner_phone: vehicle.ac_owner_phone,
		ac_hope_price: vehicle.ac_hope_price,
		minimum_price: vehicle.minimum_price,
		bid_end_date: vehicle.bid_end_date,
		vehicle_bid_count: vehicle.vehicle_bid_count,
		status_counts: vehicle.status_counts,
		vehicle_bids: vehicle.vehicle_bids,
		report_type: reportType
	};
}

export function createReportHtml(vehicle: Vehicle, reportType: 'winner' | 'seller') {
	return renderReportTemplate(vehicle, reportType);
}

export async function tryClientPdfFromHtml(html: string) {
	// dynamic imports: cast to any to avoid TS compile-time dependency on types
	try {
		const jspdfModule: any = await import('jspdf');
		const html2canvas: any = await import('html2canvas');

		const jsPDF = jspdfModule.jsPDF || jspdfModule.default || jspdfModule;

		// create invisible iframe to render HTML for consistent styles
		const iframe = document.createElement('iframe');
		iframe.style.position = 'fixed';
		iframe.style.left = '-9999px';
		iframe.style.width = '210mm'; // A4 폭
		iframe.style.height = '297mm'; // A4 높이
		iframe.style.border = 'none';
		iframe.style.background = '#ffffff';
		document.body.appendChild(iframe);
		const doc = iframe.contentDocument || iframe.contentWindow?.document;
		if (!doc) throw new Error('iframe 생성 실패');
		doc.open();
		doc.write(html);
		doc.close();

		// iframe이 완전히 로드될 때까지 대기
		await new Promise(resolve => setTimeout(resolve, 100));

		const element = doc.body as HTMLElement;
		
		// 실제 렌더링된 크기 확인
		const rect = element.getBoundingClientRect();
		const actualWidth = Math.max(rect.width, 595);
		const actualHeight = Math.max(rect.height, 842);
		
		const canvas = await html2canvas(element, { 
			scale: 2,
			width: actualWidth,
			height: actualHeight,
			useCORS: true,
			allowTaint: false,
			backgroundColor: '#ffffff',
			removeContainer: true,
			logging: false,
			foreignObjectRendering: true
		});
		const imgData = canvas.toDataURL('image/jpeg', 0.95); // JPEG로 압축

		const pdf = new jsPDF({ 
			unit: 'pt', 
			format: 'a4',
			orientation: 'portrait'
		});
		
		// A4 크기: 595 x 842 pts
		// 캔버스 크기에 맞춰 이미지 스케일링
		const pdfWidth = 595;
		const pdfHeight = 842;
		const canvasRatio = canvas.width / canvas.height;
		const pdfRatio = pdfWidth / pdfHeight;
		
		let imgWidth = pdfWidth;
		let imgHeight = pdfHeight;
		
		// 비율 유지하면서 PDF에 맞춤
		if (canvasRatio > pdfRatio) {
			imgHeight = pdfWidth / canvasRatio;
		} else {
			imgWidth = pdfHeight * canvasRatio;
		}
		
		// 중앙 정렬
		const xOffset = (pdfWidth - imgWidth) / 2;
		const yOffset = (pdfHeight - imgHeight) / 2;
		
		pdf.addImage(imgData, 'JPEG', xOffset, yOffset, imgWidth, imgHeight);

		const blob = pdf.output('blob');

		setTimeout(() => { try { document.body.removeChild(iframe); } catch {} }, 500);

		return blob;
	} catch (e) {
		throw e;
	}
}

export async function downloadReportUsingVehicle(vehicle: Vehicle, reportType: 'winner' | 'seller') {
	const html = createReportHtml(vehicle, reportType);
	const safeName = `${reportType === 'winner' ? '낙찰정산서' : '출품정산서'}_${vehicle.ac_no}_${new Date().toISOString().slice(0,10)}`.replace(/[\\/:"*?<>|]+/g, '_');

	// 클라이언트에서만 PDF 생성 시도
	try {
		const blob = await tryClientPdfFromHtml(html);
		return { blob, filename: safeName + '.pdf' };
	} catch (e) {
		// PDF 생성 실패시 HTML 파일로 폴백
		const htmlBlob = new Blob([html], { type: 'text/html;charset=utf-8' });
		return { blob: htmlBlob, filename: safeName + '.html' };
	}
}

export async function downloadReportAndTrigger(vehicle: Vehicle, reportType: 'winner' | 'seller') {
	const { blob, filename } = await downloadReportUsingVehicle(vehicle, reportType);
	const url = window.URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	setTimeout(() => {
		try { window.URL.revokeObjectURL(url); } catch {}
		if (a.parentNode) a.parentNode.removeChild(a);
	}, 1000);
}
