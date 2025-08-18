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

  // API 호출 함수
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
        <h2 className="font-semibold mb-4 text-center border-b pb-2">NSA 차량 입찰 내역</h2>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-white p-4 rounded-lg flex flex-col">
      <h2 className="font-semibold mb-4 text-center border-b pb-2">NSA 차량 입찰 내역</h2>
      
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
              className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-700">ID: {bid.id}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bid.status)}`}>
                    {getStatusText(bid.status)}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {formatDate(bid.updated_at)}
                </div>
              </div>

              {/* 차량 정보 섹션 */}
              <div className="mb-3 p-2 bg-gray-50 rounded">
                <div className="grid grid-cols-1 gap-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">출품번호:</span>
                    <span className="font-medium text-blue-600">{bid.ac_code_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">차량모델:</span>
                    <span className="font-medium">{bid.ac_car_model}</span>
                  </div>
                  {bid.ac_car_no && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">등록번호:</span>
                      <span className="font-medium">{bid.ac_car_no}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 사용자 정보 섹션 */}
              <div className="mb-3 p-2 bg-blue-50 rounded">
                <div className="grid grid-cols-1 gap-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">사용자:</span>
                    <span className="font-medium">{bid.user_name} (ID: {bid.user_id})</span>
                  </div>
                </div>
              </div>
              
              {/* 금액 정보 섹션 */}
              <div className="grid grid-cols-1 gap-2 text-sm mb-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">입찰금액:</span>
                  <span className="font-medium text-blue-600">{formatAmount(bid.bid_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">총 금액:</span>
                  <span className={`font-bold text-lg ${bid.total_amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatAmount(bid.total_amount)}
                  </span>
                </div>
              </div>
                
              {/* 수수료 세부사항 (접기/펼치기) */}
              <details className="mt-2">
                <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700 select-none">
                  💰 수수료 세부사항 보기
                </summary>
                <div className="mt-2 p-2 bg-gray-50 rounded border-l-4 border-gray-300">
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>수수료:</span>
                      <span>{formatAmount(bid.commission_fee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>참가비:</span>
                      <span className={bid.participation_fee < 0 ? 'text-red-600' : ''}>{formatAmount(bid.participation_fee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>이전비:</span>
                      <span>{formatAmount(bid.transfer_fee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>보관료:</span>
                      <span>{formatAmount(bid.storage_fee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>폐차비:</span>
                      <span>{formatAmount(bid.disposal_fee)}</span>
                    </div>
                    <hr className="my-1"/>
                    <div className="flex justify-between font-medium">
                      <span>입찰금액:</span>
                      <span className="text-blue-600">{formatAmount(bid.bid_amount)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-sm">
                      <span>최종 총액:</span>
                      <span className={bid.total_amount >= 0 ? 'text-green-600' : 'text-red-600'}>
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