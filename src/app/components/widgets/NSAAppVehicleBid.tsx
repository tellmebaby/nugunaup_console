'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAuthHeaders } from '../../utils/auth';

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

// 인증중고차 minimum_price 입력/수정/삭제 컴포넌트
function MinimumPriceInput({ bidId, acNo, minimumPrice, onSaved }: { bidId: number, acNo: number, minimumPrice: number | null, onSaved: (price: number|null) => void }) {
  const [editing, setEditing] = useState(minimumPrice == null);
  const [price, setPrice] = useState(minimumPrice ? String(minimumPrice) : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 저장
  const handleSave = async () => {
    if (!price || isNaN(Number(price))) {
      setError('숫자를 입력해주세요');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('https://port-0-nsa-app-api-m6ojom0b30d70444.sel4.cloudtype.app/api/minimum-price/set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ac_no: acNo, minimum_price: Number(price) })
      });
      if (!res.ok) throw new Error('저장 실패');
      onSaved(Number(price));
      setEditing(false);
    } catch (e) {
      setError('저장에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  // 삭제
  const handleDelete = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`https://port-0-nsa-app-api-m6ojom0b30d70444.sel4.cloudtype.app/api/minimum-price/${acNo}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('삭제 실패');
      onSaved(null);
      setEditing(true);
      setPrice('');
    } catch (e) {
      setError('삭제에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  if (!editing && minimumPrice != null) {
    return (
      <div className="my-2 flex items-center gap-2">
        <span className="text-green-700 font-semibold text-xs">최저낙찰가: {minimumPrice.toLocaleString()}원</span>
        <button className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs border border-gray-300 hover:bg-gray-200" onClick={() => setEditing(true)} disabled={loading}>수정</button>
        <button className="px-2 py-0.5 rounded bg-red-100 text-red-600 text-xs border border-red-300 hover:bg-red-200" onClick={handleDelete} disabled={loading}>삭제</button>
      </div>
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

// 차량별 카드 컴포넌트
function VehicleGroupCard({ 
  vehicle, 
  setVehicleList, 
  expandedId, 
  setExpandedId,
  updateBidStatus,
  updatingStatus
}: { 
  vehicle: VehicleGroup;
  setVehicleList: React.Dispatch<React.SetStateAction<VehicleGroup[]>>;
  expandedId: number | null;
  setExpandedId: React.Dispatch<React.SetStateAction<number | null>>;
  updateBidStatus: (id: number, newStatus: string) => Promise<void>;
  updatingStatus: number | null;
}) {
  const isOpen = expandedId === vehicle.ac_no;
  
  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden flex-shrink-0">
      {/* 차량 헤더 - ac_code_id, ac_type만 간단 표기 */}
      <div 
        onClick={() => setExpandedId(isOpen ? null : vehicle.ac_no)}
        className="bg-gradient-to-r from-blue-50 to-white p-3 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all duration-200"
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {/* AC Code */}
            <span className="bg-blue-100 px-2 py-1 rounded text-sm font-bold text-blue-700 border border-blue-300">
              {vehicle.ac_code_id}
            </span>
            
            {/* AC Type */}
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
          </div>
          
          {/* 펼치기 아이콘 */}
          <div className={`transform transition-transform text-gray-400 ${
            isOpen ? 'rotate-180' : ''
          }`}>
            ▼
          </div>
        </div>
      </div>

      {/* 펼침: 차량 정보 + 입찰 데이터들 */}
      {isOpen && (
        <div className="bg-white border-t">
          {/* 차량 상세 정보 */}
          <div className="px-3 py-2 bg-gray-50 border-b">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <div><span className="text-gray-600">차량모델:</span> <span className="font-medium">{vehicle.ac_car_model}</span></div>
              <div><span className="text-gray-600">차량번호:</span> <span className="font-medium">{vehicle.ac_car_no}</span></div>
              <div><span className="text-gray-600">소유자:</span> <span className="font-medium">{vehicle.ac_owner_name}</span></div>
              <div><span className="text-gray-600">연락처:</span> <span className="font-medium">{vehicle.ac_owner_phone}</span></div>
              <div><span className="text-gray-600">판매유형:</span> <span className="font-medium">{vehicle.ac_sell_type}</span></div>
              <div><span className="text-gray-600">희망가격:</span> <span className="font-bold text-blue-600">{formatAmount(vehicle.ac_hope_price)}</span></div>
              {vehicle.minimum_price && (
                <div><span className="text-gray-600">최저낙찰가:</span> <span className="font-bold text-purple-600">{formatAmount(vehicle.minimum_price)}</span></div>
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

// 입찰 데이터 최소화 표기 및 기능 유지
function VehicleBidRow({ 
  bid, 
  vehicle,
  updateBidStatus,
  updatingStatus,
  formatAmount,
  formatDate
}: { 
  bid: VehicleBidItem;
  vehicle: VehicleGroup;
  updateBidStatus: (id: number, newStatus: string) => Promise<void>;
  updatingStatus: number | null;
  formatAmount: (amount: number) => string;
  formatDate: (dateString: string) => string;
}) {
  return (
    <div className="border-b py-2 last:border-b-0">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-800 text-sm">{bid.user_name}</span>
          <span className="text-xs text-gray-500">ID: {bid.user_id}</span>
          
          {/* Status - 미확인일 때만 클릭 가능 */}
          {bid.status === '미확인' ? (
            <button
              onClick={() => updateBidStatus(bid.id, '확인')}
              disabled={updatingStatus === bid.id}
              className="px-2 py-1 rounded text-xs font-medium border bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200 transition-colors disabled:opacity-50"
            >
              {updatingStatus === bid.id ? '업데이트 중...' : '미확인 → 확인'}
            </button>
          ) : (
            <span className="px-2 py-1 rounded text-xs font-medium border bg-green-100 text-green-700 border-green-300">
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

  // 상태 업데이트 함수
  const updateBidStatus = async (id: number, newStatus: string) => {
    try {
      setUpdatingStatus(id);
      
      const response = await fetch('/api/nsa-app-vehicle-bid/status', {
        method: 'PUT',
        headers: getAuthHeaders(),
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
      
      if (result.status === 'success') {
        setVehicleList(prevList =>
          prevList.map(vehicle => ({
            ...vehicle,
            vehicle_bids: vehicle.vehicle_bids.map(bid => 
              bid.id === id ? { ...bid, status: newStatus } : bid
            )
          }))
        );
      } else {
        throw new Error(result.message || '상태 업데이트에 실패했습니다.');
      }
    } catch (error) {
      setError('상태 업데이트에 실패했습니다: ' + (error as Error).message);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const fetchVehicleBids = async (pageNum: number, limit: number = 10): Promise<ApiResponse> => {
    try {
      const response = await fetch(`https://port-0-nsa-app-api-m6ojom0b30d70444.sel4.cloudtype.app/api/nsa-app-vehicle-bid/list?page=${pageNum}&limit=${limit}`, {
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
      console.error('API 호출 실패:', error);
      throw error;
    }
  };

  // 초기 데이터 로드
  const loadInitialData = useCallback(async () => {
    try {
      setInitialLoading(true);
      setError(null);
      
      const response = await fetchVehicleBids(1);
      setVehicleList(response.data);
      setHasMore(response.pagination.has_next);
      setPage(2);
    } catch (err) {
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setInitialLoading(false);
    }
  }, []);

  // 추가 데이터 로드
  const loadMoreData = useCallback(async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchVehicleBids(page);
      setVehicleList(prev => [...prev, ...response.data]);
      setHasMore(response.pagination.has_next);
      setPage(prev => prev + 1);
    } catch (err) {
      setError('추가 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore]);

  // 전체 데이터 새로고침
  const refreshData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchVehicleBids(1);
      setVehicleList(response.data);
      setHasMore(response.pagination.has_next);
      setPage(2);
    } catch (err) {
      setError('데이터 새로고침에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 스크롤 이벤트 핸들러 - 컨테이너 내부 스크롤로 변경
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    
    // 스크롤이 하단 근처에 도달했을 때 (90% 이상)
    if (scrollTop + clientHeight >= scrollHeight * 0.9 && hasMore && !loading) {
      loadMoreData();
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // 기존 window 스크롤 이벤트 제거
  // useEffect(() => {
  //   const handleScroll = () => {
  //     if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || loading) {
  //       return;
  //     }
  //     loadMoreData();
  //   };

  //   window.addEventListener('scroll', handleScroll);
  //   return () => window.removeEventListener('scroll', handleScroll);
  // }, [loadMoreData, loading]);

  if (initialLoading) {
    return (
      <div className="h-32 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && vehicleList.length === 0) {
    return (
      <div className="text-center text-red-500 py-4 text-sm">
        <p>{error}</p>
        <button 
          onClick={refreshData}
          className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-3 h-full flex flex-col">
      <div className="flex justify-between items-center mb-3 flex-shrink-0">
        <h2 className="text-lg font-bold text-gray-800">NSA 차량 입찰 목록</h2>
        <button 
          onClick={refreshData}
          disabled={loading}
          className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 text-xs"
        >
          {loading ? '새로고침 중...' : '새로고침'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-3 text-xs flex-shrink-0">
          {error}
        </div>
      )}

      {vehicleList.length === 0 ? (
        <div className="text-center text-gray-500 py-6 text-sm flex-1 flex items-center justify-center">
          {initialLoading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          ) : (
            '데이터가 없습니다.'
          )}
        </div>
      ) : (
        <div 
          className="flex-1 overflow-y-auto space-y-2 pr-1"
          style={{ maxHeight: '500px' }}
          onScroll={handleScroll}
        >
          {vehicleList.map((vehicle) => (
            <VehicleGroupCard 
              key={vehicle.ac_no} 
              vehicle={vehicle} 
              setVehicleList={setVehicleList}
              expandedId={expandedId}
              setExpandedId={setExpandedId}
              updateBidStatus={updateBidStatus}
              updatingStatus={updatingStatus}
            />
          ))}
          
          {/* 로딩 인디케이터 */}
          {loading && (
            <div className="text-center py-4 flex-shrink-0">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-500 mt-2 text-xs">추가 데이터 로딩 중...</p>
            </div>
          )}
          
          {/* 모든 데이터 로드 완료 메시지 */}
          {!hasMore && vehicleList.length > 0 && (
            <div className="text-center text-gray-500 py-4 text-xs flex-shrink-0 border-t border-gray-200">
              📋 모든 데이터를 불러왔습니다. (총 {vehicleList.length}개 차량)
            </div>
          )}
        </div>
      )}
    </div>
  );
}