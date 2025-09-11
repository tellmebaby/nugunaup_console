// reactPdfTemplate.tsx
// @react-pdf/renderer를 사용한 전문적인 PDF 템플릿

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// 스타일 정의
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 10,
    fontSize: 8,
    fontFamily: 'Helvetica',
  },
  container: {
    border: '3px solid #1F3A93',
    borderTopWidth: 6,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    padding: 0,
    height: '100%',
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    color: '#1F3A93',
    marginTop: 15,
    marginBottom: 10,
    letterSpacing: 2,
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  senderInfo: {
    width: '50%',
    padding: 10,
    fontSize: 8,
  },
  senderText: {
    marginBottom: 5,
  },
  supplierInfo: {
    width: '50%',
    border: '1px solid #000000',
    flexDirection: 'row',
  },
  supplierVertical: {
    width: 12,
    borderRight: '1px solid #000000',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 5,
  },
  supplierVerticalText: {
    fontSize: 8,
    textAlign: 'center',
  },
  supplierLabels: {
    width: 65,
    borderRight: '1px solid #000000',
  },
  supplierLabelCell: {
    height: 18.8,
    borderBottom: '1px solid #000000',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 8,
  },
  supplierValues: {
    flex: 1,
  },
  supplierValueRow: {
    height: 18.8,
    borderBottom: '1px solid #000000',
    flexDirection: 'row',
  },
  supplierValueCell: {
    flex: 1,
    borderRight: '1px solid #000000',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 8,
    textAlign: 'center',
    paddingHorizontal: 2,
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 9,
    marginBottom: 2,
    paddingLeft: 2,
  },
  table: {
    border: '1px solid #000000',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #000000',
  },
  tableCell: {
    flex: 1,
    borderRight: '1px solid #000000',
    padding: 5,
    fontSize: 10,
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 28,
  },
  tableCellHighlight: {
    backgroundColor: '#FFD04E',
  },
  tableCellSmall: {
    fontSize: 8,
  },
  radioGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  radio: {
    width: 6,
    height: 6,
    borderRadius: 3,
    border: '1px solid #000000',
  },
  radioChecked: {
    backgroundColor: '#1DC3FF',
  },
  radioText: {
    fontSize: 8,
  },
  bottomNotice: {
    border: '1px solid #000000',
    padding: 10,
    marginTop: 'auto',
  },
  bottomText: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 5,
  },
  bottomSmallText: {
    fontSize: 8,
    textAlign: 'center',
    lineHeight: 1.3,
  },
  rightAlign: {
    textAlign: 'right',
    paddingRight: 5,
  },
});

type Vehicle = any;

interface ReportDocumentProps {
  vehicle: Vehicle;
  reportType: 'winner' | 'seller';
}

export const ReportDocument: React.FC<ReportDocumentProps> = ({ vehicle, reportType }) => {
  const title = reportType === 'winner' ? '낙찰정산서' : '출품정산서';
  
  // 낙찰자 정보
  const winner = (vehicle.vehicle_bids || []).find((b: any) => b.status === '낙찰');
  const bidAmount = winner?.bid_amount || 0;
  const winnerName = winner?.user_name || '';
  const winnerPhone = winner?.user_phone || '';

  const currentDate = new Date();
  const formattedDate = `${currentDate.getFullYear()}년 ${String(currentDate.getMonth() + 1).padStart(2, '0')}월 ${String(currentDate.getDate()).padStart(2, '0')}일`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          {/* 제목 */}
          <Text style={styles.title}>낙 찰 정 산 서</Text>
          
          {/* 상단 정보 */}
          <View style={styles.headerRow}>
            <View style={styles.senderInfo}>
              <Text style={styles.senderText}>[경공매일 : {formattedDate} ]</Text>
              <Text style={styles.senderText}>수신 : {winnerName} 귀하</Text>
              <Text style={styles.senderText}>발신 : (주)벧엘코리아</Text>
            </View>
            
            <View style={styles.supplierInfo}>
              <View style={styles.supplierVertical}>
                <Text style={styles.supplierVerticalText}>공</Text>
                <Text style={styles.supplierVerticalText}>급</Text>
                <Text style={styles.supplierVerticalText}>자</Text>
              </View>
              
              <View style={styles.supplierLabels}>
                <View style={styles.supplierLabelCell}>
                  <Text>등록번호</Text>
                </View>
                <View style={styles.supplierLabelCell}>
                  <Text>업 체 명</Text>
                </View>
                <View style={styles.supplierLabelCell}>
                  <Text>주 소</Text>
                </View>
                <View style={styles.supplierLabelCell}>
                  <Text>사업자 번호</Text>
                </View>
                <View style={styles.supplierLabelCell}>
                  <Text>전 화</Text>
                </View>
              </View>
              
              <View style={styles.supplierValues}>
                <View style={styles.supplierValueRow}>
                  <View style={styles.supplierValueCell}>
                    <Text>237-87-02062</Text>
                  </View>
                  <View style={styles.supplierValueCell}>
                    <Text>대 표 자</Text>
                  </View>
                  <View style={styles.supplierValueCell}>
                    <Text>조 성 훈 (인)</Text>
                  </View>
                </View>
                <View style={styles.supplierValueRow}>
                  <View style={[styles.supplierValueCell, { borderRight: 0 }]}>
                    <Text>(주)벧엘코리아</Text>
                  </View>
                </View>
                <View style={styles.supplierValueRow}>
                  <View style={[styles.supplierValueCell, { borderRight: 0, fontSize: 7 }]}>
                    <Text>인천광역시 서구 염곡로464번길 30, 1동 1001호(가정동, 벨라미 루원)</Text>
                  </View>
                </View>
                <View style={styles.supplierValueRow}>
                  <View style={styles.supplierValueCell}>
                    <Text>239-87-02062</Text>
                  </View>
                  <View style={styles.supplierValueCell}>
                    <Text>종 목</Text>
                  </View>
                  <View style={styles.supplierValueCell}>
                    <Text>전자상거래 중개업</Text>
                  </View>
                </View>
                <View style={styles.supplierValueRow}>
                  <View style={styles.supplierValueCell}>
                    <Text>1644-7525</Text>
                  </View>
                  <View style={styles.supplierValueCell}>
                    <Text>팩 스</Text>
                  </View>
                  <View style={styles.supplierValueCell}>
                    <Text>032-833-2901</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* 차량 정보 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>차량(출품번호 : {vehicle.ac_code_id || vehicle.ac_no})</Text>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <View style={styles.tableCell}>
                  <Text>차량번호</Text>
                </View>
                <View style={[styles.tableCell, styles.tableCellHighlight]}>
                  <Text>{vehicle.ac_car_no || ''}</Text>
                </View>
                <View style={styles.tableCell}>
                  <Text>모델명</Text>
                </View>
                <View style={[styles.tableCell, styles.tableCellHighlight]}>
                  <Text>{vehicle.ac_car_model || ''}</Text>
                </View>
              </View>
              <View style={styles.tableRow}>
                <View style={styles.tableCell}>
                  <Text>차대번호</Text>
                </View>
                <View style={[styles.tableCell, styles.tableCellHighlight]}>
                  <Text>{vehicle.vin_code || ''}</Text>
                </View>
                <View style={styles.tableCell}>
                  <Text>연식</Text>
                </View>
                <View style={[styles.tableCell, styles.tableCellHighlight]}>
                  <Text>{vehicle.car_year || ''}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* 낙찰자 정보 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>낙찰자</Text>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <View style={styles.tableCell}>
                  <Text>업체명</Text>
                </View>
                <View style={styles.tableCell}>
                  <Text>{winnerName}</Text>
                </View>
                <View style={styles.tableCell}>
                  <Text>사업자번호</Text>
                </View>
                <View style={styles.tableCell}>
                  <Text>-</Text>
                </View>
              </View>
              <View style={styles.tableRow}>
                <View style={styles.tableCell}>
                  <Text>업태</Text>
                </View>
                <View style={styles.tableCell}>
                  <Text>-</Text>
                </View>
                <View style={styles.tableCell}>
                  <Text>종목</Text>
                </View>
                <View style={styles.tableCell}>
                  <Text>-</Text>
                </View>
              </View>
              <View style={styles.tableRow}>
                <View style={styles.tableCell}>
                  <Text>사업장 주소</Text>
                </View>
                <View style={[styles.tableCell, { flex: 3 }]}>
                  <Text>-</Text>
                </View>
              </View>
            </View>
          </View>

          {/* 낙찰자 입고지 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>낙찰자 입고지</Text>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <View style={styles.tableCell}>
                  <Text>담당자</Text>
                </View>
                <View style={styles.tableCell}>
                  <Text>{winnerName}</Text>
                </View>
                <View style={styles.tableCell}>
                  <Text>연락처</Text>
                </View>
                <View style={styles.tableCell}>
                  <Text>{winnerPhone}</Text>
                </View>
              </View>
              <View style={styles.tableRow}>
                <View style={styles.tableCell}>
                  <Text>입고지 주소</Text>
                </View>
                <View style={[styles.tableCell, { flex: 3 }]}>
                  <Text>-</Text>
                </View>
              </View>
            </View>
          </View>

          {/* 낙찰 정산 내역 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>낙찰 정산 내역</Text>
            
            {/* 1.비용내역 */}
            <View style={[styles.table, { marginBottom: 8 }]}>
              <View style={styles.tableRow}>
                <View style={[styles.tableCell, { flex: 1 }]}>
                  <Text>1.비용내역{'\n'}(자동차 대금/부품)</Text>
                </View>
                <View style={{ flex: 3 }}>
                  <View style={styles.tableRow}>
                    <View style={styles.tableCell}>
                      <Text>낙찰금액 (입찰가)</Text>
                    </View>
                    <View style={[styles.tableCell, styles.rightAlign, { flex: 2 }]}>
                      <Text>{bidAmount.toLocaleString()}원</Text>
                    </View>
                  </View>
                  <View style={styles.tableRow}>
                    <View style={styles.tableCell}>
                      <Text>부가세</Text>
                    </View>
                    <View style={styles.tableCell}>
                      <View style={styles.radioGroup}>
                        <View style={[styles.radio, styles.radioChecked]} />
                        <Text style={styles.radioText}>부가세포함</Text>
                        <View style={styles.radio} />
                        <Text style={styles.radioText}>부가세별도</Text>
                      </View>
                    </View>
                    <View style={[styles.tableCell, styles.rightAlign]}>
                      <Text>0원</Text>
                    </View>
                  </View>
                  <View style={styles.tableRow}>
                    <View style={[styles.tableCell, { flex: 2 }]}>
                      <Text>합 계</Text>
                    </View>
                    <View style={[styles.tableCell, styles.rightAlign]}>
                      <Text>{bidAmount.toLocaleString()}원</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* 2.비용내역 */}
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <View style={[styles.tableCell, { flex: 1 }]}>
                  <Text>2.비용내역</Text>
                </View>
                <View style={{ flex: 3 }}>
                  <View style={styles.tableRow}>
                    <View style={styles.tableCell}>
                      <Text>낙찰수수료</Text>
                    </View>
                    <View style={[styles.tableCell, styles.rightAlign, { flex: 2 }]}>
                      <Text>0원</Text>
                    </View>
                  </View>
                  <View style={styles.tableRow}>
                    <View style={styles.tableCell}>
                      <Text>낙찰수수료 부가세</Text>
                    </View>
                    <View style={[styles.tableCell, styles.rightAlign, { flex: 2 }]}>
                      <Text>0원</Text>
                    </View>
                  </View>
                  <View style={styles.tableRow}>
                    <View style={styles.tableCell}>
                      <Text>폐차 말소 위탁</Text>
                    </View>
                    <View style={[styles.tableCell, styles.tableCellSmall]}>
                      <Text>150,000원 적용</Text>
                    </View>
                    <View style={[styles.tableCell, styles.rightAlign]}>
                      <Text>0원</Text>
                    </View>
                  </View>
                  <View style={styles.tableRow}>
                    <View style={styles.tableCell}>
                      <Text>매입 이전비</Text>
                    </View>
                    <View style={[styles.tableCell, styles.tableCellSmall]}>
                      <Text>(VAT포함)</Text>
                    </View>
                    <View style={[styles.tableCell, styles.rightAlign]}>
                      <Text>0원</Text>
                    </View>
                  </View>
                  <View style={styles.tableRow}>
                    <View style={styles.tableCell}>
                      <Text>취등록세</Text>
                    </View>
                    <View style={[styles.tableCell, styles.tableCellSmall]}>
                      <Text>(2,860만원 이상 취등록세 발생)</Text>
                    </View>
                    <View style={[styles.tableCell, styles.rightAlign]}>
                      <Text>0원</Text>
                    </View>
                  </View>
                  <View style={styles.tableRow}>
                    <View style={styles.tableCell}>
                      <Text>신규번호판(영업용 적용)</Text>
                    </View>
                    <View style={[styles.tableCell, styles.tableCellSmall]}>
                      <Text>(VAT포함)</Text>
                    </View>
                    <View style={[styles.tableCell, styles.rightAlign]}>
                      <Text>0원</Text>
                    </View>
                  </View>
                  <View style={styles.tableRow}>
                    <View style={styles.tableCell}>
                      <Text>비용(보관&견인비)</Text>
                    </View>
                    <View style={[styles.tableCell, styles.tableCellSmall]}>
                      <Text>(VAT포함)</Text>
                    </View>
                    <View style={[styles.tableCell, styles.rightAlign]}>
                      <Text>0원</Text>
                    </View>
                  </View>
                  <View style={styles.tableRow}>
                    <View style={[styles.tableCell, { flex: 2 }]}>
                      <Text>합 계</Text>
                    </View>
                    <View style={[styles.tableCell, styles.rightAlign]}>
                      <Text>541,368원</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* 입금 계좌 안내 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>입금 계좌 안내</Text>
            
            {/* 3.입금계좌 */}
            <View style={[styles.table, { marginBottom: 8 }]}>
              <View style={styles.tableRow}>
                <View style={[styles.tableCell, { flex: 1 }]}>
                  <Text>3.입금계좌</Text>
                </View>
                <View style={{ flex: 3 }}>
                  <View style={styles.tableRow}>
                    <View style={styles.tableCell}>
                      <Text>은행명</Text>
                    </View>
                    <View style={[styles.tableCell, styles.tableCellSmall]}>
                      <Text>계좌번호</Text>
                    </View>
                    <View style={styles.tableCell}>
                      <Text>예금주</Text>
                    </View>
                  </View>
                  <View style={styles.tableRow}>
                    <View style={[styles.tableCell, styles.tableCellHighlight]}>
                      <Text>신한은행</Text>
                    </View>
                    <View style={[styles.tableCell, styles.tableCellHighlight, styles.tableCellSmall]}>
                      <Text>140-013-396220</Text>
                    </View>
                    <View style={[styles.tableCell, styles.tableCellHighlight]}>
                      <Text>(주)벧엘코리아</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* 납입 총금액 */}
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <View style={[styles.tableCell, styles.tableCellHighlight, styles.tableCellSmall, { flex: 3 }]}>
                  <Text>납입 총금액 (1+2)</Text>
                </View>
                <View style={[styles.tableCell, styles.tableCellHighlight, styles.rightAlign]}>
                  <Text>{(bidAmount + 541368).toLocaleString()}원</Text>
                </View>
              </View>
            </View>
          </View>

          {/* 하단 안내 */}
          <View style={styles.bottomNotice}>
            <Text style={styles.bottomText}>낙찰정산서를 받으신 후, 익일까지 차량을 출고해 주셔야 합니다.</Text>
            <Text style={styles.bottomText}>이후 차량 출고 시, [추가 보관비 및 업무처리비용]으로 일일 30,000원씩 추가됩니다.</Text>
            <Text style={styles.bottomSmallText}>위의 귀사(와) 하에서 의뢰하신 차량에 대한 정산서를 제출합니다. 입금진행시 필히 차량번호 또는 출품번호로 입금진행해 주시기 바랍니다 자동차 입고지 주소확인 바립니다. 상기 차량은 (주) 벧엘 코리아 누가나사 경공매로 낙찰되었음을 증명 합니다.</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
