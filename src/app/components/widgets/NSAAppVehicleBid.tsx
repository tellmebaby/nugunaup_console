import React, { useState, useEffect, useCallback } from 'react';
import { getAuthHeaders } from '../../utils/auth';

// API 응답 타입 정의 (실제 API 구조에 맞춤)
interface VehicleBidItem {
  id: number;
  ac_no: number;
  ac_code_id: string;
  ac_car_model: string;
  ac_car_no: string;
  user_id: number;
  user_name: string;
  bid_amount: number;
  total_amount: number;
  status: string;
  commission_fee: number;
  created_at: string;
  disposal_fee: number;
  participation_fee: number;
  storage_fee: number;
  transfer_fee: number;
  updated_at: string;
}

interface ApiResponse {
  data: VehicleBidItem[];
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

export default function NSAAppVehicleBid() {
  const [bidList, setBidList] = useState<VehicleBidItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null); // 상태 업데이트 중인 항목 ID

  // 상태 옵션 정의
  const statusOptions = [
    { value: '확인', label: '확인' },
    { value: '미확인', label: '미확인' }
  ];

  // 편집 가능한 상태인지 확인
  const isEditableStatus = (status: string) => {
    return statusOptions.some(option => option.value === status);
  };

  // 상태 업데이트 함수
  const updateBidStatus = async (id: number, newStatus: string) => {
    try {
      setUpdatingStatus(id);
      
      console.log(`상태 업데이트 요청: ID ${id}, 새 상태: ${newStatus}`);
      
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
      console.log('상태 업데이트 응답:', responseText);
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error('JSON 파싱 오류:', e);
        throw new Error('서버 응답을 파싱할 수 없습니다.');
      }
      
      if (result.status === 'success') {
        // 로컬 상태 업데이트
        setBidList(prevList => 
          prevList.map(bid => 
            bid.id === id 
              ? { ...bid, status: newStatus }
              : bid
          )
        );
        console.log(`ID ${id}의 상태가 '${newStatus}'로 업데이트되었습니다.`);
      } else {
        throw new Error(result.message || '상태 업데이트에 실패했습니다.');
      }
    } catch (error) {
      console.error('상태 업데이트 오류:', error);
      setError('상태 업데이트에 실패했습니다: ' + (error as Error).message);
    } finally {
      setUpdatingStatus(null);
    }
  };

  // 전체 데이터 새로고침 함수
  const refreshData = async () => {
    try {
      console.log('데이터 새로고침 시작');
      setLoading(true);
      setError(null);
      
      // 첫 페이지부터 다시 로드
      const response = await fetchVehicleBids(1);
      setBidList(response.data);
      setHasMore(response.pagination.has_next);
      setPage(2);
      
      console.log('데이터 새로고침 완료');
    } catch (err) {
      setError('데이터 새로고침에 실패했습니다.');
      console.error('새로고침 실패:', err);
    } finally {
      setLoading(false);
    }
  };
  const fetchVehicleBids = async (pageNum: number, limit: number = 10): Promise<ApiResponse> => {
    try {
      console.log(`차량 입찰 데이터 요청: 페이지 ${pageNum}, 한계 ${limit}`);
      
      // 실제 API 호출
      const response = await fetch(`/api/nsa-app-vehicle-bid/list?page=${pageNum}&limit=${limit}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseText = await response.text();
      console.log('API 응답 원본:', responseText);
      
      let data: ApiResponse;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('JSON 파싱 오류:', e);
        throw new Error('서버 응답을 파싱할 수 없습니다.');
      }
      
      console.log('파싱된 데이터:', data);
      
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
      setBidList(response.data);
      setHasMore(response.pagination.has_next);
      setPage(2);
    } catch (err) {
      setError('데이터를 불러오는데 실패했습니다.');
      console.error('초기 데이터 로드 실패:', err);
    } finally {
      setInitialLoading(false);
    }
  }, []);

  // 추가 데이터 로드 (무한스크롤)
  const loadMoreData = useCallback(async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchVehicleBids(page);
      setBidList(prev => [...prev, ...response.data]);
      setHasMore(response.pagination.has_next);
      setPage(prev => prev + 1);
    } catch (err) {
      setError('추가 데이터를 불러오는데 실패했습니다.');
      console.error('추가 데이터 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore]);

  // 스크롤 이벤트 핸들러
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    
    // 스크롤이 하단에 가까워지면 추가 데이터 로드
    if (scrollHeight - scrollTop - clientHeight < 100) {
      loadMoreData();
    }
  }, [loadMoreData]);

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // 상태별 색상 반환 (실제 API 상태값에 맞춤)
  const getStatusColor = (status: string) => {
    switch (status) {
      case '확인':
        return 'text-green-600 bg-green-50';
      case '미확인':
        return 'text-yellow-600 bg-yellow-50';
      case '유찰':
        return 'text-gray-600 bg-gray-50';
      case '낙찰':
        return 'text-blue-600 bg-blue-50';
      case '삭제':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // 상태 텍스트는 API에서 이미 한글로 오므로 그대로 사용
  const getStatusText = (status: string) => {
    return status; // '확인', '미확인' 등 그대로 사용
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ko-KR', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // 금액 포맷팅
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  if (initialLoading) {
    return (
      <div className="h-full w-full bg-white p-4 rounded-lg">
        <div className="vehicle-bid-header-section flex justify-between items-center mb-4 pb-2 border-b">
          <h2 className="font-semibold text-center">NSA 차량 입찰 내역</h2>
          <button
            disabled
            className="vehicle-bid-refresh-btn px-3 py-1 bg-gray-400 text-white text-sm rounded cursor-not-allowed"
          >
            🔄 새로고침
          </button>
        </div>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-white p-4 rounded-lg flex flex-col">
      <div className="vehicle-bid-header-section flex justify-between items-center mb-4 pb-2 border-b">
        <h2 className="font-semibold text-center">NSA 차량 입찰 내역</h2>
        <button
          onClick={refreshData}
          disabled={loading}
          className="vehicle-bid-refresh-btn px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '새로고침 중...' : '🔄 새로고침'}
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
          <button 
            onClick={loadInitialData}
            className="mt-2 text-red-600 text-sm underline hover:no-underline"
          >
            다시 시도
          </button>
        </div>
      )}

      <div 
        className="flex-1 overflow-y-auto space-y-3"
        onScroll={handleScroll}
        style={{ maxHeight: '400px' }}
      >
        {bidList.length === 0 && !initialLoading ? (
          <div className="text-center text-gray-500 py-8">
            등록된 입찰이 없습니다.
          </div>
        ) : (
          bidList.map((bid) => (
            <div 
              key={bid.id} 
              className="vehicle-bid-card bg-white border border-gray-200 rounded-lg p-3 mb-2 shadow-sm hover:shadow-md transition-all duration-200 hover:border-blue-200"
            >
              {/* 첫 번째 줄: ID, 상태, 출품번호, 날짜 */}
              <div className="vehicle-bid-first-row flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
                <div className="vehicle-bid-left-info flex items-center space-x-3">
                  <span className="vehicle-bid-id text-sm font-bold text-gray-800">ID: {bid.id}</span>
                  
                  {/* 상태 선택창 또는 읽기 전용 표시 */}
                  <div className="vehicle-bid-status-wrapper">
                    {isEditableStatus(bid.status) ? (
                      // 편집 가능한 상태 (확인, 미확인)
                      <>
                        <select
                          value={bid.status}
                          onChange={(e) => updateBidStatus(bid.id, e.target.value)}
                          disabled={updatingStatus === bid.id}
                          className={`vehicle-bid-status-select px-2 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer transition-all ${getStatusColor(bid.status)} ${
                            updatingStatus === bid.id 
                              ? 'opacity-50 cursor-not-allowed' 
                              : 'hover:brightness-95'
                          }`}
                        >
                          {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {updatingStatus === bid.id && (
                          <div className="vehicle-bid-status-loading inline-block ml-1">
                            <div className="w-3 h-3 border border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                          </div>
                        )}
                      </>
                    ) : (
                      // 읽기 전용 상태 (유찰, 낙찰, 삭제 등)
                      <span className={`vehicle-bid-status-readonly px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(bid.status)} cursor-default`}>
                        🔒 {bid.status}
                      </span>
                    )}
                  </div>
                  
                  <div className="vehicle-bid-code-inline px-2 py-1 bg-blue-100 rounded border border-blue-300">
                    <span className="vehicle-bid-code-label text-xs text-blue-700">📋</span>
                    <span className="vehicle-bid-code-value text-xs font-bold text-blue-600 ml-1">{bid.ac_code_id}</span>
                  </div>
                </div>
                <div className="vehicle-bid-date text-xs text-gray-400 font-medium">
                  {formatDate(bid.updated_at)}
                </div>
              </div>

              {/* 두 번째 줄: 차량정보, 사용자, 금액 */}
              <div className="vehicle-bid-second-row grid grid-cols-4 gap-3 text-xs">
                {/* 차량 정보 */}
                <div className="vehicle-bid-car-compact col-span-1">
                  <div className="vehicle-bid-car-model text-gray-600 truncate" title={bid.ac_car_model}>
                    🚗 {bid.ac_car_model}
                  </div>
                  {bid.ac_car_no && (
                    <div className="vehicle-bid-car-no text-gray-500 text-xs mt-1">
                      {bid.ac_car_no}
                    </div>
                  )}
                </div>

                {/* 사용자 정보 */}
                <div className="vehicle-bid-user-compact col-span-1">
                  <div className="vehicle-bid-user-name text-green-700 font-semibold">
                    👤 {bid.user_name}
                  </div>
                  <div className="vehicle-bid-user-id text-green-600 text-xs mt-1">
                    ID: {bid.user_id}
                  </div>
                </div>

                {/* 입찰금액 */}
                <div className="vehicle-bid-bid-compact col-span-1 text-right">
                  <div className="vehicle-bid-bid-label text-gray-600">💰 입찰금액</div>
                  <div className="vehicle-bid-bid-value text-blue-600 font-bold text-sm mt-1">
                    {formatAmount(bid.bid_amount)}
                  </div>
                </div>

                {/* 총 금액 */}
                <div className="vehicle-bid-total-compact col-span-1 text-right">
                  <div className="vehicle-bid-total-label text-gray-600">총 금액</div>
                  <div className={`vehicle-bid-total-value font-bold text-base mt-1 ${bid.total_amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatAmount(bid.total_amount)}
                  </div>
                </div>
              </div>
                
              {/* 수수료 세부사항 - 더 컴팩트하게 */}
              <details className="vehicle-bid-details mt-2">
                <summary className="vehicle-bid-summary cursor-pointer text-xs text-gray-600 hover:text-blue-600 transition-colors select-none p-1 bg-gray-50 rounded hover:bg-blue-50 border border-gray-200">
                  <span className="vehicle-bid-summary-content inline-flex items-center">
                    📊 수수료 세부사항
                    <svg className="vehicle-bid-arrow w-3 h-3 ml-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="vehicle-bid-details-content mt-2 p-2 bg-white rounded border border-gray-200">
                  <div className="vehicle-bid-fees-grid grid grid-cols-2 gap-1 text-xs mb-2">
                    <div className="vehicle-bid-fee-item flex justify-between bg-gray-50 p-1 rounded">
                      <span className="vehicle-bid-fee-label text-gray-600">수수료:</span>
                      <span className="vehicle-bid-fee-value font-medium">{formatAmount(bid.commission_fee)}</span>
                    </div>
                    <div className="vehicle-bid-fee-item flex justify-between bg-gray-50 p-1 rounded">
                      <span className="vehicle-bid-fee-label text-gray-600">이전비:</span>
                      <span className="vehicle-bid-fee-value font-medium">{formatAmount(bid.transfer_fee)}</span>
                    </div>
                    <div className="vehicle-bid-fee-item flex justify-between bg-gray-50 p-1 rounded">
                      <span className="vehicle-bid-fee-label text-gray-600">보관료:</span>
                      <span className="vehicle-bid-fee-value font-medium">{formatAmount(bid.storage_fee)}</span>
                    </div>
                    <div className="vehicle-bid-fee-item flex justify-between bg-gray-50 p-1 rounded">
                      <span className="vehicle-bid-fee-label text-gray-600">폐차비:</span>
                      <span className="vehicle-bid-fee-value font-medium">{formatAmount(bid.disposal_fee)}</span>
                    </div>
                  </div>
                  
                  <div className="vehicle-bid-participation-fee flex justify-between bg-red-50 p-1 rounded border border-red-200 mb-2">
                    <span className="vehicle-bid-participation-label text-red-700 font-medium text-xs">참가비:</span>
                    <span className={`vehicle-bid-participation-value font-bold text-xs ${bid.participation_fee < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatAmount(bid.participation_fee)}
                    </span>
                  </div>
                  
                  <div className="vehicle-bid-final-calc border-t border-gray-200 pt-1">
                    <div className="vehicle-bid-final-total flex justify-between items-center bg-green-50 p-1 rounded border border-green-200">
                      <span className="vehicle-bid-final-label text-green-700 font-bold text-xs">최종 총액:</span>
                      <span className={`vehicle-bid-final-value text-sm font-bold ${bid.total_amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatAmount(bid.total_amount)}
                      </span>
                    </div>
                  </div>
                </div>
              </details>
            </div>
          ))
        )}
        
        {loading && (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600">로딩 중...</span>
          </div>
        )}
        
        {!hasMore && bidList.length > 0 && (
          <div className="text-center text-gray-500 py-4 text-sm">
            모든 데이터를 불러왔습니다.
          </div>
        )}
      </div>
      
      <div className="mt-3 pt-3 border-t text-center">
        <div className="text-xs text-gray-500">
          총 {bidList.length}개 항목 표시
        </div>
      </div>
    </div>
  );
}