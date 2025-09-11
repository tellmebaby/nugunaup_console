import * as React from 'react';
import { pdf } from '@react-pdf/renderer';
import { ReportDocument } from './reactPdfTemplate';

type Vehicle = any;

/**
 * Render the ReportDocument (react-pdf) to a Blob.
 * Returns a Blob containing the PDF.
 */
export async function generatePdfBlob(vehicle: Vehicle, reportType: 'winner' | 'seller') {
  // Create the React element for the document
  const element = React.createElement(ReportDocument, { vehicle, reportType });

  // `pdf()` expects a React element; some TS setups complain about exact types, so cast to any
  const doc = pdf((element as unknown) as any);

  const blob = await doc.toBlob();
  return blob;
}

/**
 * Convenience helper: generate the PDF and trigger download in browser.
 */
export async function downloadReportUsingReactPdf(vehicle: Vehicle, reportType: 'winner' | 'seller') {
  const blob = await generatePdfBlob(vehicle, reportType);
  const fileName = `${reportType === 'winner' ? '낙찰정산서' : '출품정산서'}-${vehicle.ac_no || vehicle.ac_code_id || 'report'}.pdf`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke after a short delay to ensure the download started
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default {
  generatePdfBlob,
  downloadReportUsingReactPdf,
};
