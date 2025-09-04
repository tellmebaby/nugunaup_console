'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getAuthHeaders } from '../../utils/auth';

// API base URL for award endpoint
const API_BASE = '/api/proxy';


// 입찰 데이터 타입
interface VehicleBidItem {
  id: number;
  ac_no: number;
  user_id: number;
  bid_amount: number;
  bid_vat_price: number;
  participation_fee: number;
  disposal_fee: number;
  storage_fee: number;
  transfer_fee: number;
  export_order: number;
  commission_fee: number;
  commission_price: number;
  commission_vat: number;
  total_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  user_name: string;
  user_phone: string;
  user_type: string; // "member" | "verified"
  nsa_id: string | null; // 누구나사 ID
}

// 차량별 그룹 타입
interface VehicleGroup {
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
  vehicle_bids: VehicleBidItem[];
  bid_end_date?: string;
  computed_status?: string; // 서버에서 미리 계산된 상태 (예: "진행중", "낙찰자선정"...)
  status_counts?: Record<string, number>; // 서버에서 내려주는 집계
}

interface ApiResponse {
  data: VehicleGroup[];
  pagination: {
    current_page: number;
    has_next: boolean;
    has_prev: boolean;
    limit: number;
    total_count: number;
    total_pages: number;
  };
  sort: {
    sort_by: string;
    sort_order: string;
  };
  status: string;
}

// 남은 시간 계산 함수
const getTimeRemaining = (endDate: string) => {
  const deadline = new Date(endDate.replace(' ', 'T'));
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();
  
  if (diff <= 0) {
    return '00:00:00';
  }
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// 인증중고차 minimum_price 입력/수정/삭제 컴포넌트
function MinimumPriceInput({ bidId, acNo, minimumPrice, onSaved }: { bidId: number, acNo: number, minimumPrice: number | null, onSaved: (price: number|null) => void }) {
  const [editing, setEditing] = useState(minimumPrice == null);
  const [price, setPrice] = useState(minimumPrice ? minimumPrice.toString() : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

 const handleSave = async () => {
    if (!price.trim()) {
      setError('가격을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        ac_no: acNo,
        minimum_price: parseInt(price, 10)
      };

      const response = await fetch(`/api/minimum-price-set`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      let result: any = null;
      try {
        result = text ? JSON.parse(text) : null;
      } catch {
        // 서버가 JSON이 아닌 단순 텍스트를 반환할 수 있음
        result = { message: text || '' };
      }

      const ok = (
        (result && (result.status === 'success' || result.success === true)) ||
        (result && result.message && /성공/.test(result.message)) ||
        /성공/.test(text)
      );

      if (ok) {
        onSaved(parseInt(price, 10));
        setEditing(false);
        setError(null);
      } else {
        throw new Error(result?.message || '저장에 실패했습니다.');
      }
    } catch (error) {
      setError('저장에 실패했습니다: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/minimum-price-delete/${acNo}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      let result: any = null;
      try {
        result = text ? JSON.parse(text) : null;
      } catch {
        result = { message: text || '' };
      }

      const ok = (
        (result && (result.status === 'success' || result.success === true)) ||
        (result && result.message && /삭제|성공/.test(result.message)) ||
        /삭제|성공/.test(text)
      );

      if (ok) {
        onSaved(null);
        setEditing(true);
        setPrice('');
        setError(null);
      } else {
        throw new Error(result?.message || '삭제에 실패했습니다.');
      }
    } catch (error) {
      setError('삭제에 실패했습니다: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!editing && minimumPrice) {
    return (
      <>
        <div className="my-2 flex items-center gap-2">
          <span className="text-xs text-gray-600">최저낙찰가: </span>
          <span className="font-bold text-purple-600 text-xs">
            {new Intl.NumberFormat('ko-KR').format(minimumPrice)}원
          </span>
          <button className="px-2 py-0.5 rounded bg-blue-100 text-blue-600 text-xs border border-blue-300 hover:bg-blue-200" onClick={() => setEditing(true)} disabled={loading}>수정</button>
          <button className="px-2 py-0.5 rounded bg-red-100 text-red-600 text-xs border border-red-300 hover:bg-red-200" onClick={handleDelete} disabled={loading}>삭제</button>
        </div>
      </>
    );
  }
  return (
    <div className="my-2 flex items-center gap-2">
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={price}
        onChange={e => setPrice(e.target.value.replace(/[^0-9]/g, ''))}
        className="px-2 py-1 border rounded text-xs w-32 border-green-500 focus:outline-none"
        placeholder="최저낙찰가 입력"
        disabled={loading}
      />
      <span className="text-xs text-gray-600">원</span>
      <button className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs border border-green-300 hover:bg-green-200" onClick={handleSave} disabled={loading}>저장</button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

// 매물 상태 계산 함수
const getVehicleStatus = (vehicle: VehicleGroup) => {
  // 1) 서버에서 미리 계산된 상태가 있으면 우선 사용
  if (vehicle.computed_status) {
    const cs = vehicle.computed_status;
    switch (cs) {
      case '진행중':
        return { status: '진행중', color: 'bg-blue-100 text-blue-700 border-blue-300' };
      case '낙찰자선정':
        return { status: '낙찰자선정', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' };
      case '낙찰':
        return { status: '낙찰', color: 'bg-green-100 text-green-700 border-green-300' };
      case '유찰':
        return { status: '유찰', color: 'bg-gray-100 text-gray-700 border-gray-300' };
      default:
        return { status: cs, color: 'bg-gray-100 text-gray-700 border-gray-300' };
      }
  }

  // 2) 서버에서 counts를 준다면 집계로 판단
  if (vehicle.status_counts) {
    const counts = vehicle.status_counts;
    const total = Object.values(counts).reduce((s, v) => s + (v || 0), 0) || vehicle.vehicle_bid_count || 0;
    const winning = counts['낙찰'] || 0;
    const confirmed = counts['확인'] || 0;
    const failed = counts['유찰'] || 0;

    if (winning > 0 ) {
      return { status: '낙찰', color: 'bg-green-100 text-green-700 border-green-300' };
    }
    if (confirmed > 0) {
      return { status: '낙찰자선정', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' };
    }
    if (failed > 0 && total > 0 && failed === total) {
      return { status: '유찰', color: 'bg-gray-100 text-gray-700 border-gray-300' };
    }
    // else 폴백하여 마감시간 기준으로 판단
  }

  // 3) 기존 로컬 마감시간 기반 판단 (폴백)
  if (!vehicle.bid_end_date) {
    return { status: '진행중', color: 'bg-blue-100 text-blue-700 border-blue-300' };
  }
  const deadline = new Date(vehicle.bid_end_date.replace(' ', 'T'));
  const now = new Date();
  if (now < deadline) {
    return { status: '진행중', color: 'bg-blue-100 text-blue-700 border-blue-300' };
  }
  const bids = vehicle.vehicle_bids;
  if (bids.length === 0) {
    return { status: '유찰', color: 'bg-gray-100 text-gray-700 border-gray-300' };
  }
  const hasConfirmed = bids.some(bid => bid.status === '확인');
  const hasWinning = bids.some(bid => bid.status === '낙찰');
  const allFailed = bids.every(bid => bid.status === '유찰');
  if (hasWinning) {
    return { status: '낙찰', color: 'bg-green-100 text-green-700 border-green-300' };
  }
  if (hasConfirmed) {
    return { status: '낙찰자선정', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' };
  }
  if (allFailed) {
    return { status: '유찰', color: 'bg-gray-100 text-gray-700 border-gray-300' };
  }
  return { status: '검토중', color: 'bg-orange-100 text-orange-700 border-orange-300' };
};

// 동적 상태 표시 컴포넌트
function DynamicStatusBadge({ vehicle }: { vehicle: VehicleGroup }) {
  const [showTimer, setShowTimer] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('00:00:00');
  const [expired, setExpired] = useState(false);
  
  useEffect(() => {
    // 리셋
    setExpired(false);
    setShowTimer(false);

    // 진행중 상태이고 마감시간이 있는 경우에만 타이머 작동
    const vehicleStatus = getVehicleStatus(vehicle);
    if (vehicleStatus.status !== '진행중' || !vehicle.bid_end_date) {
      return;
    }

    // 초기 시간 설정
    setTimeRemaining(getTimeRemaining(vehicle.bid_end_date));

    // 1초마다 시간 업데이트; 시간이 모두 소진되면 expired로 전환하고 인터벌 중지
    const interval = setInterval(() => {
      const rem = getTimeRemaining(vehicle.bid_end_date!);
      setTimeRemaining(rem);
      if (rem === '00:00:00') {
        setExpired(true);
        clearInterval(interval);
        return;
      }
      setShowTimer(prev => !prev);
    }, 1000);

    // 만약 초기값이 이미 만료라면 즉시 expired 설정
    if (getTimeRemaining(vehicle.bid_end_date) === '00:00:00') {
      setExpired(true);
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [vehicle.bid_end_date, vehicle]);
  
  const vehicleStatus = getVehicleStatus(vehicle);
  // 진행중이 아니거나 마감시간이 없으면 기본 상태만 표시
  if (vehicleStatus.status !== '진행중' || !vehicle.bid_end_date) {
    return (
      <span className={`px-2 py-1 rounded text-xs font-bold border ${vehicleStatus.color}`}>
        {vehicleStatus.status}
      </span>
    );
  }

  // 남은 시간이 모두 소진되면 낙찰자선정으로 표기
  if (expired) {
    return (
      <span className={`px-2 py-1 rounded text-xs font-bold border bg-yellow-100 text-yellow-700 border-yellow-300`}>
        낙찰자선정
      </span>
    );
  }

  return (
    <span className={`px-2 py-1 rounded text-xs font-bold border ${vehicleStatus.color}`}>
      {showTimer ? timeRemaining : '진행중'}
    </span>
  );
}

// 차량별 카드 컴포넌트
function VehicleGroupCard({ 
  vehicle, 
  setVehicleList, 
  expandedId, 
  setExpandedId,
  updateBidStatus,
  selectWinner,
  updatingStatus
}: { 
  vehicle: VehicleGroup;
  setVehicleList: React.Dispatch<React.SetStateAction<VehicleGroup[]>>;
  expandedId: number | null;
  setExpandedId: React.Dispatch<React.SetStateAction<number | null>>;
  updateBidStatus: (id: number, newStatus: string) => Promise<void>;
  selectWinner: (winnerId: number, acNo: number) => Promise<void>;
  updatingStatus: number | null;
}) {
  const isOpen = expandedId === vehicle.ac_no;

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  const formatDate = (dateString: string): string => {
    // bid_end_date 같은 "YYYY-MM-DD HH:mm:ss" 포맷을 그대로 표시하거나 로컬 포맷으로 변환
    try {
      if (!dateString) return '';
      const d = new Date(dateString.replace(' ', 'T'));
      return d.toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateString;
    }
  };

  // 상세 페이지 URL 결정
  const detailUrl = (() => {
    if (vehicle.ac_type === '인증중고차') {
      // return `https://www.nugunasa.com/page/bidding_car_certified_detail.php?ac_no=${vehicle.ac_no}`;
      return `https://www.nugunasa.com/adm/auction_car_ajax_detail_pop.php?ac_no=${vehicle.ac_no}`;
    }
    if (vehicle.ac_type === '수출차경공매') {
      // return `https://www.nugunasa.com/page/bidding_car_export_detail.php?ac_no=${vehicle.ac_no}`;
      return `https://www.nugunasa.com/adm/auction_car_ajax_detail_pop.php?ac_no=${vehicle.ac_no}`;
    }
    // return `https://www.nugunasa.com/page/bidding_car_exident_detail.php?ac_no=${vehicle.ac_no}`;
    return `https://www.nugunasa.com/adm/auction_car_ajax_detail_pop.php?ac_no=${vehicle.ac_no}`;
  })();

  return (
    <div className="border rounded-lg mb-2 shadow-sm">
      <div
        className="flex justify-between items-center px-3 py-2 cursor-pointer hover:bg-blue-50"
        onClick={() => setExpandedId(isOpen ? null : vehicle.ac_no)}
      >
        <div className="flex items-center space-x-3">
          {/* 동적 매물 상태 */}
          <DynamicStatusBadge vehicle={vehicle} />

          {/* AC Code (새창으로 열기, 카드 토글 이벤트 방해 안함) */}
          <a
            href={detailUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e: React.MouseEvent<HTMLAnchorElement>) => e.stopPropagation()}
            className="bg-blue-100 px-2 py-1 rounded text-sm font-bold text-blue-700 border border-blue-300 hover:bg-blue-200 inline-block"
          >
            {vehicle.ac_code_id}
          </a>

          {/* AC Type 배지 */}
          <span className={`px-2 py-1 rounded text-sm font-semibold border ${
            vehicle.ac_type === '인증중고차' 
              ? 'bg-green-100 text-green-700 border-green-300'
              : vehicle.ac_type === '사고차경공매'
              ? 'bg-red-100 text-red-700 border-red-300'
              : vehicle.ac_type === '수출차경공매'
              ? 'bg-purple-100 text-purple-700 border-purple-300'
              : 'bg-gray-100 text-gray-700 border-gray-300'
          }`}>
            {vehicle.ac_type}
          </span>

          {/* 입찰 개수 */}
          <span className="text-xs text-gray-500">
            입찰 {vehicle.vehicle_bid_count}건
          </span>

          <span className="text-xs text-gray-500">
            {(() => {
              // vehicle.vehicle_bids 중 가장 최근 updated_at을 찾아 표시 (없으면 건수로 폴백)
              if (!vehicle.vehicle_bids || vehicle.vehicle_bids.length === 0) {
                return `마지막 업데이트 ${vehicle.vehicle_bid_count}건`;
              }
              try {
                const latest = vehicle.vehicle_bids.reduce((prev, curr) => {
                  const pd = new Date(prev.updated_at.replace(' ', 'T'));
                  const cd = new Date(curr.updated_at.replace(' ', 'T'));
                  return pd > cd ? prev : curr;
                });
                const latestStr = formatDate(latest.updated_at);
                return `마지막 업데이트 ${latestStr}`;
              } catch {
                return `마지막 업데이트 ${vehicle.vehicle_bid_count}건`;
              }
            })()}
          </span>


        </div>

        {/* 펼치기 아이콘 */}
        <div className={`transform transition-transform text-gray-400 ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </div>
      </div>

      {isOpen && (
        <div className="bg-white border-t">
          {/* 차량 상세 정보 */}
          <div className="px-3 py-2 bg-gray-50 border-b">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <div>
                <span className="text-gray-600">차량모델:</span>{' '}
                <span className="font-medium text-gray-600">{vehicle.ac_car_model}</span>
              </div>
              <div>
                <span className="text-gray-600">차량번호:</span>{' '}
                <span className="font-medium text-gray-600">{vehicle.ac_car_no}</span>
              </div>
              <div>
                <span className="text-gray-600">소유자:</span>{' '}
                <span className="font-medium text-gray-600">{vehicle.ac_owner_name}</span>
              </div>
              <div>
                <span className="text-gray-600">연락처:</span>{' '}
                <span className="font-medium text-gray-600">{vehicle.ac_owner_phone}</span>
              </div>
              <div>
                <span className="text-gray-600">판매자유형:</span>{' '}
                <span className="font-medium text-gray-600">{vehicle.ac_sell_type}</span>
              </div>
              <div>
                <span className="text-gray-600">희망가격:</span>{' '}
                <span className="font-bold text-blue-600">{formatAmount(vehicle.ac_hope_price * 10000)}</span>
              </div>

              {vehicle.minimum_price != null && (
                <div>
                  <span className="text-gray-600">최저낙찰가:</span>{' '}
                  <span className="font-bold text-purple-600">{formatAmount(vehicle.minimum_price)}</span>
                </div>
              )}

              {vehicle.bid_end_date && (
                <div>
                  <span className="text-gray-600">마감시간:</span>{' '}
                  <span className="font-medium text-gray-800">{formatDate(vehicle.bid_end_date)}</span>
                </div>
              )}

              <div>
                <span className="text-gray-600">딜러단지:</span>{' '}
                <span className="font-medium text-gray-600">{vehicle.ac_dealer_danji_name}</span>
              </div>

              {vehicle.ac_deler_firm_name && (
                <div>
                  <span className="text-gray-600">딜러업체:</span>{' '}
                  <span className="font-medium text-gray-600">{vehicle.ac_deler_firm_name}</span>
                </div>
              )}
            </div>
          </div>

          {/* 최저낙찰가 입력 (인증중고차만) */}
          {vehicle.ac_type === '인증중고차' && (
            <div className="px-3 py-2 bg-yellow-50 border-b">
              <MinimumPriceInput
                bidId={0}
                acNo={vehicle.ac_no}
                minimumPrice={vehicle.minimum_price}
                onSaved={price => {
                  setVehicleList(prev => prev.map(v => v.ac_no === vehicle.ac_no ? { ...v, minimum_price: price } : v));
                }}
              />
            </div>
          )}

          {/* 입찰 데이터들 최소화 표기 */}
          <div className="px-3 pb-3">
            {vehicle.vehicle_bids.length === 0 ? (
              <div className="text-gray-400 text-sm py-2">입찰 데이터 없음</div>
            ) : (
              vehicle.vehicle_bids.map(bid => (
                <VehicleBidRow
                  key={bid.id}
                  bid={bid}
                  vehicle={vehicle}
                  updateBidStatus={updateBidStatus}
                  selectWinner={selectWinner}
                  updatingStatus={updatingStatus}
                  formatAmount={formatAmount}
                  formatDate={formatDate}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// VehicleBidRow 컴포넌트에서 status 표시 부분을 수정

function VehicleBidRow({ 
  bid, 
  vehicle,
  updateBidStatus,
  selectWinner,
  updatingStatus,
  formatAmount,
  formatDate
}: { 
  bid: VehicleBidItem;
  vehicle: VehicleGroup;
  updateBidStatus: (id: number, newStatus: string) => Promise<void>;
  selectWinner: (winnerId: number, acNo: number) => Promise<void>;
  updatingStatus: number | null;
  formatAmount: (amount: number) => string;
  formatDate: (dateString: string) => string;
}) {
  // 차량의 현재 상태 확인
  const vehicleStatus = getVehicleStatus(vehicle);
  const isWinnerSelection = vehicleStatus.status === '낙찰자선정';
  
  return (
    <div className="border-b py-2 last:border-b-0">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-800 text-sm">{bid.user_name}</span>
          <span className="text-xs text-gray-500">ID: {bid.user_id}</span>
          <span className="text-xs text-gray-500">📞 {bid.user_phone}</span>
          
          {/* 회원 타입 표시 */}
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            bid.user_type === 'verified' 
              ? 'bg-blue-100 text-blue-700 border border-blue-300' 
              : 'bg-gray-100 text-gray-700 border border-gray-300'
          }`}>
            {bid.user_type === 'verified' ? '인증회원' : '일반회원'}
          </span>
          
          {/* 누구나사 ID 표시 (인증회원만) */}
          {bid.user_type === 'verified' && bid.nsa_id && (
            <span className="text-xs text-blue-600 font-medium">누구나사 ID: {bid.nsa_id}</span>
          )}
          
          {/* Status 관리 UI */}
          {bid.status === '미확인' ? (
            // 기존: 미확인 → 확인 버튼
            <button
              onClick={() => updateBidStatus(bid.id, '확인')}
              disabled={updatingStatus === bid.id}
              className="px-2 py-1 rounded text-xs font-medium border bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200 transition-colors disabled:opacity-50"
            >
              {updatingStatus === bid.id ? '업데이트 중...' : '미확인 → 확인'}
            </button>
          ) : isWinnerSelection && bid.status === '확인' ? (
            // 새로운: 낙찰자선정 상태에서 확인 → 낙찰/유찰 선택
            <div className="flex items-center gap-1">
              <span className="px-2 py-1 rounded text-xs font-medium border bg-yellow-100 text-yellow-700 border-yellow-300">
                확인완료
              </span>
              <button
                onClick={() => selectWinner(bid.id, vehicle.ac_no)}
                disabled={updatingStatus === bid.id}
                className="px-2 py-1 rounded text-xs font-medium border bg-green-100 text-green-700 border-green-300 hover:bg-green-200 transition-colors disabled:opacity-50"
              >
                {updatingStatus === bid.id ? '처리중...' : '낙찰'}
              </button>
              <button
                onClick={() => updateBidStatus(bid.id, '유찰')}
                disabled={updatingStatus === bid.id}
                className="px-2 py-1 rounded text-xs font-medium border bg-red-100 text-red-700 border-red-300 hover:bg-red-200 transition-colors disabled:opacity-50"
              >
                {updatingStatus === bid.id ? '처리중...' : '유찰'}
              </button>
                {/* 버튼 오른쪽에 작은 안내 문구 추가 */}
              <span className="text-xs text-gray-500 ml-2 hidden sm:inline">
                입찰금액을 확인하시고 확정하세요
              </span>
            </div>
          ) : (
            // 기존: 다른 상태들 (확인, 낙찰, 유찰 등) - 읽기 전용
            <span className={`px-2 py-1 rounded text-xs font-medium border ${
              bid.status === '확인' 
                ? 'bg-blue-100 text-blue-700 border-blue-300'
                : bid.status === '낙찰'
                ? 'bg-green-100 text-green-700 border-green-300'
                : bid.status === '유찰'
                ? 'bg-red-100 text-red-700 border-red-300'
                : 'bg-gray-100 text-gray-700 border-gray-300'
            }`}>
              {bid.status}
            </span>
          )}
        </div>
        
        <div className="text-right">
          <div className="text-sm font-bold text-blue-600">{formatAmount(bid.bid_amount)}</div>
          <div className="text-xs text-gray-500">{formatDate(bid.updated_at)}</div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
        <div>총결제: <span className={`font-medium ${bid.total_amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatAmount(bid.total_amount)}</span></div>
        <div>수수료: <span className="font-medium">{formatAmount(bid.commission_fee)}</span></div>
        <div>참가비: <span className="font-medium">{formatAmount(bid.participation_fee)}</span></div>
      </div>
    </div>
  );
}

export default function NSAAppVehicleBid() {
  const [vehicleList, setVehicleList] = useState<VehicleGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  
  // 확장된 카드 상태
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // 진행중(및 낙찰자선정) 보기 토글
  const [showOngoingOnly, setShowOngoingOnly] = useState<boolean>(false);

  // 표시할 리스트 (토글에 따라 필터)
  const displayedList: VehicleGroup[] = useMemo(() => {
    return vehicleList.filter(v => {
      if (!showOngoingOnly) return true;
      const s = getVehicleStatus(v).status;
      return s === '진행중' || s === '낙찰자선정';
    });
  }, [vehicleList, showOngoingOnly]);

  // 낙찰자 선택 함수 (같은 차량의 다른 입찰들을 유찰로 변경)
  const selectWinner = async (winnerId: number, acNo: number) => {
    // 낙관적 업데이트 + 서버 호출
    const prevList = vehicleList;
    try {
      setUpdatingStatus(winnerId);

      const targetVehicle = vehicleList.find(v => v.ac_no === acNo);
      if (!targetVehicle) throw new Error('차량을 찾을 수 없습니다.');
      const targetBid = targetVehicle.vehicle_bids.find(b => b.id === winnerId);
      if (!targetBid) throw new Error('선택한 입찰을 찾을 수 없습니다.');

      const winner_user_id = targetBid.user_id;

      // 낙관적 UI 업데이트
      setVehicleList(prev => prev.map(v => v.ac_no === acNo ? ({
        ...v,
        vehicle_bids: v.vehicle_bids.map(b => ({ ...b, status: b.id === winnerId ? '낙찰' : '유찰' }))
      }) : v));

      const idempotency_key = `${Date.now()}-${Math.random().toString(36).slice(2,9)}`;

      const response = await fetch(`/api/vehicle-award/${acNo}`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ winner_id: winner_user_id, idempotency_key })
      });

      if (!response.ok) throw new Error(`낙찰자 선택 실패: ${response.status}`);

      const responseText = await response.text();
      let result;
      try { result = JSON.parse(responseText); } catch { throw new Error('서버 응답을 파싱할 수 없습니다.'); }

      const ok = (result && (result.status === 'success' || result.success === true)) || (result && result.message && /성공/.test(result.message));
      if (ok) {
        if (result.vehicle) {
          setVehicleList(prev => prev.map(v => v.ac_no === acNo ? result.vehicle : v));
        }
      } else {
        throw new Error(result?.message || '낙찰자 선택에 실패했습니다.');
      }
    } catch (error) {
      // 롤백
      setVehicleList(prevList);
      setError('낙찰자 선택에 실패했습니다: ' + (error as Error).message);
    } finally {
      setUpdatingStatus(null);
    }
  };

  // 상태 업데이트 함수 (기존 단일 입찰 상태 변경용)
  const updateBidStatus = async (id: number, newStatus: string) => {
    try {
      setUpdatingStatus(id);
      
      const response = await fetch(`/api/vehicle-bid-status`, {
        method: 'PUT',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: id,
          status: newStatus
        })
      });
      
      if (!response.ok) {
        throw new Error(`상태 업데이트 실패: ${response.status}`);
      }
      
      const responseText = await response.text();
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        throw new Error('서버 응답을 파싱할 수 없습니다.');
      }
      
      const ok = (result && (result.status === 'success' || result.success === true)) || (result && result.message && /성공/.test(result.message));
      if (ok) {
        setVehicleList(prevList =>
          prevList.map(vehicle => ({
            ...vehicle,
            vehicle_bids: vehicle.vehicle_bids.map(bid => 
              bid.id === id ? { ...bid, status: newStatus } : bid
            )
          }))
        );

        // 미확인 → 확인 상태 변경 시 추가 API 호출
        if (newStatus === '확인') {
          try {
            const targetBid = vehicleList.flatMap(v => v.vehicle_bids).find(b => b.id === id);
            if (targetBid) {
              const actionTradePayload = {
                ac_no: targetBid.ac_no,
                bid_amount: targetBid.bid_amount,
                user_id: `nsa-${targetBid.user_id}`,
                participation_fee: -300000
              };

              const actionTradeResponse = await fetch(`/api/action-trade`, {
                method: 'POST',
                headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
                body: JSON.stringify(actionTradePayload)
              });

              if (!actionTradeResponse.ok) {
                console.warn('action-trade API 호출 실패:', actionTradeResponse.status);
              } else {
                const actionTradeText = await actionTradeResponse.text();
                try {
                  const actionTradeResult = JSON.parse(actionTradeText);
                  const actionOk = (actionTradeResult && (actionTradeResult.status === 'success' || actionTradeResult.success === true)) || 
                                   (actionTradeResult && actionTradeResult.message && /성공/.test(actionTradeResult.message));
                  if (!actionOk) {
                    console.warn('action-trade API 응답 실패:', actionTradeResult?.message);
                  }
                } catch (e) {
                  console.warn('action-trade API 응답 파싱 실패');
                }
              }
            }
          } catch (actionTradeError) {
            console.warn('action-trade API 호출 중 오류:', (actionTradeError as Error).message);
          }
        }
      } else {
        throw new Error(result?.message || '상태 업데이트에 실패했습니다.');
      }
    } catch (error) {
      setError('상태 업데이트에 실패했습니다: ' + (error as Error).message);
    } finally {
      setUpdatingStatus(null);
    }
  };

  // 통합된 API 요청 함수
  const fetchVehicleBids = async (pageNum: number, limit: number = 10): Promise<ApiResponse> => {
    try {
      const response = await fetch(`/api/vehicle-bid-list?page=${pageNum}&limit=${limit}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseText = await response.text();
      let data: ApiResponse;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error('서버 응답을 파싱할 수 없습니다.');
      }
      
      if (data.status !== 'success') {
        throw new Error('API 요청이 실패했습니다.');
      }
      
      return data;
    } catch (error) {
      throw new Error('데이터를 가져오는데 실패했습니다: ' + (error as Error).message);
    }
  };

  // 통합된 데이터 로드 함수
  const loadVehicleBids = useCallback(async (pageNum: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await fetchVehicleBids(pageNum);
      
      if (pageNum === 1) {
        setVehicleList(data.data);
      } else {
        setVehicleList(prev => [...prev, ...data.data]);
      }
      
      setHasMore(data.pagination.has_next);
      setPage(pageNum);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
      if (pageNum === 1) {
        setInitialLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadVehicleBids(1);
  }, [loadVehicleBids]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadVehicleBids(page + 1);
    }
  };

  const handleRefresh = () => {
    setPage(1);
    setHasMore(true);
    loadVehicleBids(1);
  };

  if (initialLoading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="text-center text-gray-500">데이터를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow h-96 flex flex-col">
      <div className="flex items-center justify-between mb-4 bg-white z-10">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-bold text-gray-800">NSA App 차량입찰 관리</h3>
          <div className="flex items-center text-sm text-gray-600">
            <button
              type="button"
              role="switch"
              aria-checked={showOngoingOnly}
              onClick={(e: React.MouseEvent) => { e.stopPropagation(); setShowOngoingOnly(prev => !prev); }}
              className={`ml-2 inline-flex items-center w-10 h-5 rounded-full p-1 cursor-pointer transition-colors ${
                showOngoingOnly ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block w-4 h-4 bg-white rounded-full transform transition-transform ${showOngoingOnly ? 'translate-x-4' : ''}`} />
            </button>
            <button type="button" onClick={(e) => { e.stopPropagation(); setShowOngoingOnly(prev => !prev); }} className="ml-2 text-sm text-gray-600">
              진행중 입찰만 보기
            </button>
          </div>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={loading}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 text-sm"
        >
          새로고침
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-2">
          {displayedList.map(vehicle => (
            <VehicleGroupCard 
              key={vehicle.ac_no} 
              vehicle={vehicle}
              setVehicleList={setVehicleList}
              expandedId={expandedId}
              setExpandedId={setExpandedId}
              updateBidStatus={updateBidStatus}
              selectWinner={selectWinner}
              updatingStatus={updatingStatus}
            />
          ))}
        </div>

        {displayedList.length === 0 && !loading && (
          <div className="text-center text-gray-500 py-8">
            입찰 데이터가 없습니다.
          </div>
        )}

        {hasMore && (
          <div className="text-center mt-4">
            <button 
              onClick={handleLoadMore}
              disabled={loading}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
            >
              {loading ? '불러오는 중...' : '더 보기'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}