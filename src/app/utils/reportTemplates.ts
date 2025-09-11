// reportTemplates.ts
// index.html과 index.css 스타일을 참조한 낙찰정산서 템플릿

interface VehicleData {
  ac_no: number;
  ac_code_id: string;
  ac_car_model: string;
  ac_car_no: string;
  ac_type: string;
  ac_owner_name: string;
  ac_owner_phone: string;
  ac_sell_type: string;
  ac_dealer_danji_name: string;
  ac_deler_firm_name: string | null;
  ac_hope_price: number;
  minimum_price: number | null;
  vehicle_bid_count: number;
  vehicle_bids: any[];
  // optional API-provided fields
  ac_car_make_no?: string;
  ac_car_make_year?: string;
  // report meta
  reportDate?: string;
  recipient?: string;
}

export const renderReportTemplate = (vehicle: VehicleData, reportType: 'winner' | 'seller'): string => {
  // allow caller to override report date (e.g. use bid.updated_at)
  const currentDate = vehicle.reportDate ?? new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\./g, '-').replace(/-$/, '');

  // 낙찰자 정보 - API에서 받아온 첫 번째 bid 사용
  const winnerBid = vehicle.vehicle_bids?.[0];

  // API에서 받아온 비용 데이터 직접 사용
  const bidAmount = winnerBid?.bid_amount ?? 0;
  const vat = winnerBid?.bid_vat_price ?? 0;
  const totalAmount = bidAmount + vat;

  const commissionFee = winnerBid?.commission_price ?? 0;
  const commissionVat = winnerBid?.commission_vat ?? 0;
  const disposalFee = winnerBid?.disposal_fee ?? 0;
  const transferFee = winnerBid?.transfer_fee ?? 0;
  const acquisitionTax = winnerBid?.acquisition_tax ?? 0;
  const plateNumberFee = 0; // 신규번호판은 항상 0
  const storageFee = winnerBid?.storage_fee ?? 0;

  const totalCost2 = commissionFee + commissionVat + disposalFee + transferFee +
                     acquisitionTax + plateNumberFee + storageFee;

  const finalTotal = winnerBid?.total_amount ?? 0;

  return `
<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>낙찰정산서</title>
  <style>
    /* 기본 스타일 */
    * {
        box-sizing: border-box;
    }

    html {
        width: 100%;
        height: 100%;
    }

    body {
        margin: 0;
        padding: 10px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans KR', sans-serif;
        font-size: 11px;
        color: #000;
        background: #fff;
        line-height: 1.2;
        width: 100%;
        min-width: 100%;
        box-sizing: border-box;
    }

    .container {
        width: 100%;
        max-width: none;
        margin: 0;
        padding: 0;
        min-width: 100%;
    }

    /* 제목 */
    h1 {
        text-align: center;
        font-size: 18px;
        font-weight: bold;
        margin: 20px 0;
    }

    /* 테이블 기본 스타일 */
    .main-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 10px;
        table-layout: fixed;
    }

    .main-table td {
        border: 0.5px solid #000;
        padding: 6px 8px;
        vertical-align: top;
        word-wrap: break-word;
    }

    /* 헤더 정보 */
    .header-info {
        padding: 6px;
        line-height: 1.3;
        width: 35%;
        font-size: 10px;
    }

    .supplier-label {
        text-align: center;
        vertical-align: middle;
        font-weight: bold;
        width: 18px;
        font-size: 12px;
        line-height: 1.2;
        padding: 6px 2px;
        white-space: nowrap;
    }

    /* 라벨 스타일 */
    .label {
        background-color: #f5f5f5;
        text-align: center;
        font-weight: bold;
        white-space: nowrap;
        width: 15%;
        font-size: 10px;
    }

    /* 섹션 헤더 */
    .section-header {
        background-color: #e0e0e0;
        text-align: center;
        font-weight: bold;
        padding: 6px;
        font-size: 11px;
    }

    /* 비용 섹션 */
    .cost-section {
        text-align: center;
        vertical-align: middle;
        font-weight: bold;
        background-color: #f5f5f5;
        width: 18%;
        font-size: 10px;
    }

    /* 금액 */
    .amount {
        text-align: right;
        font-weight: bold;
    }

    /* 스페이서 */
    .spacer {
        height: 10px;
        border: none;
        background: none;
    }

    /* 총금액 */
    .total-label {
        text-align: center;
        font-weight: bold;
        background-color: #f0f0f0;
    }

    .total-amount {
        text-align: right;
        font-weight: bold;
        font-size: 14px;
        background-color: #f0f0f0;
    }

    /* 안내사항 */
    .notice {
        background-color: #fff3cd;
        border: 1px solid #ffeaa7;
        padding: 10px;
        margin: 10px 0;
        border-radius: 3px;
    }

    .notice .warning {
        margin: 5px 0;
        color: #856404;
    }

    /* 푸터 */
    .footer {
        background-color: #f8f9fa;
        border: 1px solid #dee2e6;
        padding: 10px;
        margin: 10px 0;
        border-radius: 3px;
    }

    .footer p {
        margin: 5px 0;
        line-height: 1.4;
    }

    /* PDF 최적화 */
    @media print {
        body { 
            padding: 0; 
            margin: 0;
        }
        .container { 
            max-width: none;
            width: 100%;
            padding: 5px;
        }
        .main-table {
            width: 100%;
        }
    }

    /* 페이지 전체 사용 */
    @page {
        size: A4;
        margin: 10mm;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>낙찰정산서</h1>
    
    <!-- 공급자 정보 -->
    <table class="main-table">
      <tr>
        <td rowspan="5" class="header-info">
          ▪ [경공매일: ${currentDate}]<br>
          ▪ 수신: ${vehicle.recipient || '[수신자 없음]'}<br>
          ▪ 발신: ㈜벧엘코리아
        </td>
        <td rowspan="5" class="supplier-label" style="vertical-align: middle; padding-left: 8px; padding-right: 8px;">공<br>급<br>자</td>
        <td class="label">등록번호</td>
        <td colspan="4">239-87-02062</td>
      </tr>
      <tr>
        <td class="label">업 체 명</td>
        <td colspan="2">(주)벧엘코리아</td>
        <td class="label">대 표 자</td>
        <td>조 성 훈</td>
      </tr>
      <tr>
        <td class="label">주 소</td>
        <td colspan="4">인천 서구 염곡로464번길 30, 1동 1001호 (벨라미)</td>
      </tr>
      <tr>
        <td class="label">사업자 번호</td>
        <td colspan="2">239-87-02062</td>
        <td class="label">종 목</td>
        <td>전자상거래 중개업</td>
      </tr>
      <tr>
        <td class="label">전 화</td>
        <td colspan="2">1644-7525</td>
        <td class="label">팩 스</td>
        <td>032-833-2901</td>
      </tr>
    </table>

    <!-- 차량 정보 -->
    <table class="main-table">
      <tr><td colspan="6" class="section-header">차량 (출품번호: ${vehicle.ac_code_id})</td></tr>
      <tr>
        <td class="label">차량번호</td>
        <td>${vehicle.ac_car_no}</td>
        <td colspan="2" class="label">모델명</td>
        <td colspan="2">${vehicle.ac_car_model}</td>
      </tr>
      <tr>
        <td class="label">차대번호</td>
        <td>${vehicle.ac_car_make_no || ''}</td>
        <td colspan="2" class="label">연식</td>
        <td colspan="2">${vehicle.ac_car_make_year || ''}</td>
      </tr>
    </table>

    <!-- 낙찰자 정보 -->
    <table class="main-table">
      <tr><td colspan="6" class="section-header">낙찰자</td></tr>
      <tr>
        <td class="label">업체명</td>
        <td>${winnerBid?.user_name || ''}</td>
        <td colspan="2" class="label">사업자번호</td>
        <td colspan="2">${winnerBid?.businessNumber || ''}</td>
      </tr>
      <tr>
        <td class="label">업태</td>
        <td>${winnerBid?.businessType || ''}</td>
        <td colspan="2" class="label">종목</td>
        <td colspan="2">${winnerBid?.businessItem || ''}</td>
      </tr>
      <tr>
        <td class="label">사업장주소</td>
        <td colspan="5">${winnerBid?.address || ''}</td>
      </tr>
    </table>

    <!-- 낙찰자 입고지 -->
    <table class="main-table">
      <tr><td colspan="6" class="section-header">낙찰자 입고지</td></tr>
      <tr>
        <td class="label">담당자</td>
        <td>${winnerBid?.user_name || ''}</td>
        <td colspan="2" class="label">연락처</td>
        <td colspan="2">${winnerBid?.user_phone || ''}</td>
      </tr>
      <tr>
        <td class="label">입고지주소</td>
        <td colspan="5"></td>
      </tr>
    </table>

    <!-- 낙찰 정산 내역 -->
    <table class="main-table">
      <tr><td colspan="6" class="section-header">낙찰 정산 내역</td></tr>
      <tr>
        <td rowspan="3" class="cost-section">1.비용내역<br>(자동차 대금/부품)</td>
        <td class="label">낙찰금액(입찰가)</td>
        <td colspan="2"></td>
        <td colspan="2" class="amount">${bidAmount.toLocaleString()}원</td>
      </tr>
      <tr>
        <td class="label">부가세</td>
        <td colspan="2">부가세포함</td>
        <td colspan="2" class="amount">${vat.toLocaleString()}원</td>
      </tr>
      <tr>
        <td colspan="3" class="label">합 계</td>
        <td colspan="2" class="amount">${totalAmount.toLocaleString()}원</td>
      </tr>
      <tr><td colspan="6" class="spacer"></td></tr>
      <tr>
        <td rowspan="8" class="cost-section">2.비용내역</td>
        <td class="label">낙찰수수료</td>
        <td colspan="2"></td>
        <td colspan="2" class="amount">${commissionFee.toLocaleString()}원</td>
      </tr>
      <tr>
        <td class="label">낙찰수수료 부가세</td>
        <td colspan="2"></td>
        <td colspan="2" class="amount">${commissionVat.toLocaleString()}원</td>
      </tr>
      <tr>
        <td class="label">폐차 말소 위탁</td>
        <td colspan="2"></td>
        <td colspan="2" class="amount">${disposalFee.toLocaleString()}원</td>
      </tr>
      <tr>
        <td class="label">매입 이전비</td>
        <td colspan="2"></td>
        <td colspan="2" class="amount">${transferFee.toLocaleString()}원</td>
      </tr>
      <tr>
        <td class="label">취등록세</td>
        <td colspan="2"></td>
        <td colspan="2" class="amount">${acquisitionTax.toLocaleString()}원</td>
      </tr>
      <tr>
        <td class="label">신규번호판(영업용 적용)</td>
        <td colspan="2"></td>
        <td colspan="2" class="amount">${plateNumberFee.toLocaleString()}원</td>
      </tr>
      <tr>
        <td class="label">비용(보관&견인비)</td>
        <td colspan="2"></td>
        <td colspan="2" class="amount">${storageFee.toLocaleString()}원</td>
      </tr>
      <tr>
        <td colspan="3" class="label">합 계</td>
        <td colspan="2" class="amount">${totalCost2.toLocaleString()}원</td>
      </tr>
    </table>

    <!-- 입금계좌안내 -->
    <table class="main-table">
      <tr><td colspan="6" class="section-header">입금계좌안내</td></tr>
      <tr>
        <td></td>
        <td class="label">은행명</td>
        <td colspan="2" class="label">계좌번호</td>
        <td colspan="2" class="label">예금주</td>
      </tr>
      <tr>
        <td></td>
        <td>신한은행</td>
        <td colspan="2">140-013-396220</td>
        <td colspan="2">㈜벧엘코리아</td>
      </tr>
    </table>

    <!-- 총금액 -->
    <table class="main-table">
      <tr>
        <td colspan="4" class="total-label">납입금 총금액(1 + 2 비용)</td>
        <td colspan="2" class="total-amount">${finalTotal.toLocaleString()}원</td>
      </tr>
    </table>

    <!-- 안내사항 -->
    <div class="notice">
      <p class="warning">낙찰정산서를 받으신 후, 익일까지 차량을 출고해 주셔야 합니다.</p>
      <p class="warning">이후 차량 출고 시, [추가 보관비 및 업무처리비용]으로 <strong>일일 30,000원씩</strong> 추가됩니다.</p>
    </div>

    <div class="footer">
      <p>위의 귀사(하)에서 의뢰하신 차량에 대한 정산서를 제출합니다.</p>
      <p><strong>▶▶ 입금진행시 필히 차량번호 또는 출품번호로 입금진행해 주시기 바랍니다. ◀◀</strong></p>
      <p><strong>▶▶ 자동차 입고지 주소 확인 바랍니다. ◀◀</strong></p>
      <p>▶▶ 상기 차량은 ㈜벧엘코리아 누구나사 경공매로 낙찰되었음을 증명합니다. ◀◀</p>
    </div>
  </div>
</body>
</html>
  `;
};

// 비동기 헬퍼 — vehicle_bid id 로 API 호출해서 템플릿을 생성
export const renderReportTemplateByBidId = async (bidId: number, reportType: 'winner' | 'seller' = 'winner'): Promise<string> => {
  const url = `https://port-0-nsa-app-api-m6ojom0b30d70444.sel4.cloudtype.app/api/winning/${bidId}`;
  
  console.log('API 호출 시작:', url);
  
  try {
    const res = await fetch(url, { 
      method: 'GET', 
      headers: { 
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      } 
    });
    
    console.log('API 응답 상태:', res.status, res.statusText);
    
    if (!res.ok) {
      console.error(`API 요청 실패: ${res.status} ${res.statusText}`);
      throw new Error(`API 요청 실패: ${res.status}`);
    }
    
    const json = await res.json();
    console.log('API 응답 전체:', json);

    const bid = json?.data?.bid;
    const car = json?.data?.car;
    const user = json?.data?.user;
    const calc = json?.data?.calculatedCosts;
    const actionTrade = json?.data?.actionTrade;

    console.log('API Response Debug:', {
      bidUpdatedAt: bid?.updated_at,
      userName: user?.name,
      userPhone: user?.phone,
      carModel: car?.ac_car_model,
      bidAmount: calc?.bid_amount
    });

    // vehicle 객체를 기존 renderReportTemplate과 호환되게 구성
    const vehicle: VehicleData = {
      ac_no: car?.ac_no || bid?.ac_no || 0,
      ac_code_id: car?.ac_code_id || '',
      ac_car_model: car?.ac_car_model || '',
      ac_car_no: car?.ac_car_no || '',
      ac_type: car?.ac_type || '',
      ac_owner_name: user?.name || '',
      ac_owner_phone: user?.phone || '',
      ac_sell_type: actionTrade?.sell_type || '',
      ac_dealer_danji_name: '',
      ac_deler_firm_name: null,
      ac_hope_price: calc?.bid_amount || bid?.bid_amount || 0,
      minimum_price: null,
      vehicle_bid_count: 1,
      vehicle_bids: [
        {
          id: bid?.id,
          user_name: user?.name,
          user_phone: user?.phone,
          bid_amount: calc?.bid_amount || bid?.bid_amount || 0,
          bid_vat_price: calc?.bid_vat_price || 0,
          status: bid?.status || '낙찰',
          commission_price: calc?.commission_price || 0,
          commission_vat: calc?.commission_vat || 0,
          disposal_fee: calc?.disposal_fee || 0,
          transfer_fee: calc?.transfer_fee || 0,
          acquisition_tax: calc?.acquisition_tax || 0,
          storage_fee: calc?.storage_fee || 0,
          total_amount: calc?.total_amount || 0,
          // user_type이 member일 때는 빈 값으로 처리 (현재 API에서 member 상세정보 미제공)
          businessNumber: user?.user_type === 'member' ? '' : '',
          businessType: user?.user_type === 'member' ? '' : '',
          businessItem: user?.user_type === 'member' ? '' : '',
          address: user?.user_type === 'member' ? '' : ''
        }
      ],
      // 추가 API 필드
      ac_car_make_no: car?.ac_car_make_no || '',
      ac_car_make_year: car?.ac_car_make_year || '',
      // reportDate와 recipient를 직접 설정
      reportDate: bid?.updated_at ? new Date(bid.updated_at).toLocaleDateString('ko-KR', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      }).replace(/\./g, '-').replace(/-$/, '') : undefined,
      recipient: user?.name || ''
    };

    return renderReportTemplate(vehicle, reportType);
  } catch (err) {
    console.error('renderReportTemplateByBidId 전체 에러:', err);
    console.error('에러 상세:', {
      message: err instanceof Error ? err.message : '알 수 없는 에러',
      stack: err instanceof Error ? err.stack : undefined,
      url: url
    });
    
    // 실패 시 에러 정보가 포함된 기본 템플릿 반환
    return renderReportTemplate({
      ac_no: 0,
      ac_code_id: `ERROR-${bidId}`,
      ac_car_model: `API 호출 실패: ${err instanceof Error ? err.message : '알 수 없는 에러'}`,
      ac_car_no: '',
      ac_type: '',
      ac_owner_name: '',
      ac_owner_phone: '',
      ac_sell_type: '',
      ac_dealer_danji_name: '',
      ac_deler_firm_name: null,
      ac_hope_price: 0,
      minimum_price: null,
      vehicle_bid_count: 0,
      vehicle_bids: [],
      ac_car_make_no: '',
      ac_car_make_year: '',
      reportDate: new Date().toLocaleDateString('ko-KR').replace(/\./g, '-').replace(/-$/, ''),
      recipient: `API 에러 - ${bidId}`
    }, reportType);
  }
};

// API 데이터를 직접 받아서 템플릿 생성하는 함수 (API 호출 문제 시 대안)
export const renderReportTemplateWithData = (apiData: any, reportType: 'winner' | 'seller' = 'winner'): string => {
  console.log('직접 데이터로 템플릿 생성:', apiData);
  
  const bid = apiData?.data?.bid;
  const car = apiData?.data?.car;
  const user = apiData?.data?.user;
  const calc = apiData?.data?.calculatedCosts;
  const actionTrade = apiData?.data?.actionTrade;

  const vehicle: VehicleData = {
    ac_no: car?.ac_no || bid?.ac_no || 0,
    ac_code_id: car?.ac_code_id || '',
    ac_car_model: car?.ac_car_model || '',
    ac_car_no: car?.ac_car_no || '',
    ac_type: car?.ac_type || '',
    ac_owner_name: user?.name || '',
    ac_owner_phone: user?.phone || '',
    ac_sell_type: actionTrade?.sell_type || '',
    ac_dealer_danji_name: '',
    ac_deler_firm_name: null,
    ac_hope_price: calc?.bid_amount || bid?.bid_amount || 0,
    minimum_price: null,
    vehicle_bid_count: 1,
    vehicle_bids: [
      {
        id: bid?.id,
        user_name: user?.name,
        user_phone: user?.phone,
        bid_amount: calc?.bid_amount || bid?.bid_amount || 0,
        bid_vat_price: calc?.bid_vat_price || 0,
        status: bid?.status || '낙찰',
        commission_price: calc?.commission_price || 0,
        commission_vat: calc?.commission_vat || 0,
        disposal_fee: calc?.disposal_fee || 0,
        transfer_fee: calc?.transfer_fee || 0,
        acquisition_tax: calc?.acquisition_tax || 0,
        storage_fee: calc?.storage_fee || 0,
        total_amount: calc?.total_amount || 0,
        businessNumber: user?.user_type === 'member' ? '' : '',
        businessType: user?.user_type === 'member' ? '' : '',
        businessItem: user?.user_type === 'member' ? '' : '',
        address: user?.user_type === 'member' ? '' : ''
      }
    ],
    ac_car_make_no: car?.ac_car_make_no || '',
    ac_car_make_year: car?.ac_car_make_year || '',
    reportDate: bid?.updated_at ? new Date(bid.updated_at).toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    }).replace(/\./g, '-').replace(/-$/, '') : undefined,
    recipient: user?.name || ''
  };

  return renderReportTemplate(vehicle, reportType);
};