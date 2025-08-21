// src/app/components/widgets/Widget2-4.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { getAuthHeaders } from '../../utils/auth';

// 입찰 데이터 타입 정의
interface BidData {
  ac_code_id: string;
  ac_no: number;
  at_no: number;
  bank_account: string | null;
  bank_name: string | null;
  bank_owner_nm: string | null;
  bid_price: number;
  bid_type: string;
  commission_price: string;
  destroy_order: string;
  destroy_order_at: string;
  expire_date: string | null;
  export_order: string;
  export_order_at: string;
  input_bank_account: string | null;
  input_bank_name: string | null;
  input_bank_owner_nm: string | null;
  move_order_price: string;
  new_tag_price: string | null;
  overwrite_buy_price: string | null;
  overwrite_buy_vat_price: string | null;
  overwrite_price: string | null;
  overwrite_price_order: string | null;
  overwrite_vat_price: string | null;
  reg_date: string;
  sell_type: string;
  status: string;
  succ_price: string;
  total_price: string;
  trans_price: string | null;
  user_id: string;
  vat_price: string;
}

// API 응답 타입
interface BidListResponse {
  data: BidData[];
  pagination: {
    current_page: number;
    has_next: boolean;
    has_prev: boolean;
    per_page: number;
    total_count: number;
    total_pages: number;
  };
  status: string;
}

export default function Widget2_4() {
  const [bidList, setBidList] = useState<BidData[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // API 데이터 가져오기
  const fetchBidData = async (pageNum: number): Promise<BidListResponse> => {
    try {
      const response = await fetch(
        `/api/nsa-app-test-bid-list?page=${pageNum}&per_page=20`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          }
        }
      );

      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API 요청 오류:', error);
      throw error;
    }
  };

  // 초기 데이터 로드
  const loadInitialData = useCallback(async () => {
    try {
      setInitialLoading(true);
      setError(null);
      
      // 새로고침 시 기존 데이터 초기화
      setBidList([]);
      setPage(1);
      setHasMore(true);
      
      const response = await fetchBidData(1);
      
      if (response.status === 'success') {
        setBidList(response.data || []);
        setHasMore(response.pagination?.has_next || false);
        setPage(2);
      } else {
        throw new Error('데이터 로드 실패');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '입찰 데이터를 불러오는데 실패했습니다.';
      setError(errorMessage);
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
      
      const response = await fetchBidData(page);
      
      if (response.status === 'success') {
        setBidList(prev => [...prev, ...(response.data || [])]);
        setHasMore(response.pagination?.has_next || false);
        setPage(prev => prev + 1);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '추가 데이터를 불러오는데 실패했습니다.';
      setError(errorMessage);
      console.error('추가 데이터 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore]);

  // 스크롤 이벤트 핸들러
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    
    // 스크롤이 하단에 가까워지면 추가 데이터 로드 (100px 여유)
    if (scrollHeight - scrollTop - clientHeight < 100 && hasMore && !loading) {
      loadMoreData();
    }
  }, [loadMoreData, hasMore, loading]);

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // 상태별 색상 반환
  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'WAIT':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'SUCCESS':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'FAIL':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // 상태 텍스트 변환
  const getStatusText = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'WAIT':
        return '대기';
      case 'SUCCESS':
        return '성공';
      case 'FAIL':
        return '실패';
      default:
        return status || '알 수 없음';
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      return date.toLocaleDateString('ko-KR', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString.slice(5, 16); // YYYY-MM-DD HH:mm 형태로 자르기
    }
  };

  // 금액 포맷팅
  const formatAmount = (amount: number | string) => {
    if (!amount && amount !== 0) return '0원';
    
    try {
      const numAmount = typeof amount === 'string' ? 
        parseInt(amount.replace(/[^0-9]/g, '')) : 
        amount;
      
      if (isNaN(numAmount)) return '0원';
      
      return new Intl.NumberFormat('ko-KR').format(numAmount) + '원';
    } catch {
      return '0원';
    }
  };

  // 로딩 중 표시
  if (initialLoading) {
    return (
      <div className="w-full bg-white p-4 rounded-lg shadow-sm border" style={{ height: '500px' }}>
        <div className="flex items-center justify-center border-b pb-3 mb-4">
          <h2 className="text-lg font-semibold text-gray-800">개발용 누구나사 입찰내역</h2>
        </div>
        <div className="flex justify-center items-center h-40">
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="text-sm text-gray-500">데이터를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border flex flex-col" style={{ height: '500px' }}>
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-lg font-semibold text-gray-800">개발용 누구나사 입찰내역</h2>
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-500">
            총 {bidList.length}건
          </div>
          <button
            onClick={loadInitialData}
            disabled={initialLoading}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md border border-blue-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="새로고침"
          >
            <svg 
              className={`w-4 h-4 ${initialLoading ? 'animate-spin' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
            <span>새로고침</span>
          </button>
        </div>
      </div>
      
      {/* 에러 표시 */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex justify-between items-start">
            <p className="text-red-600 text-sm">{error}</p>
            <button 
              onClick={loadInitialData}
              className="ml-2 text-red-600 text-sm underline hover:no-underline flex-shrink-0"
            >
              다시 시도
            </button>
          </div>
        </div>
      )}

      {/* 콘텐츠 영역 */}
      <div 
        className="flex-1 overflow-y-auto p-4"
        onScroll={handleScroll}
      >
        <div className="flex flex-col space-y-3">
          {bidList.length === 0 && !initialLoading ? (
            <div className="text-center text-gray-500 py-12">
              <div className="text-4xl mb-3">📋</div>
              <p>등록된 입찰이 없습니다.</p>
            </div>
          ) : (
            bidList.map((bid, index) => (
              <div 
                key={`${bid.ac_code_id}-${bid.ac_no}-${index}`}
                className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 cursor-pointer"
              >
                {/* 첫 번째 줄: 코드, 상태, 입찰타입, 날짜 */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      {bid.ac_code_id}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(bid.status)}`}>
                      {getStatusText(bid.status)}
                    </span>
                    <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded border border-purple-200">
                      {bid.bid_type || '미분류'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 font-medium">
                    {formatDate(bid.reg_date)}
                  </div>
                </div>

                {/* 세로 정렬된 정보 */}
                <div className="flex flex-col space-y-2 text-sm">
                  {/* 사용자 정보 */}
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                    <span className="text-xs text-gray-500 font-medium">👤 사용자</span>
                    <span className="font-semibold text-gray-800" title={bid.user_id}>
                      {bid.user_id}
                    </span>
                  </div>

                  {/* 입찰금액 */}
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                    <span className="text-xs text-gray-500 font-medium">💰 입찰금액</span>
                    <span className="font-bold text-blue-600">
                      {formatAmount(bid.bid_price)}
                    </span>
                  </div>

                  {/* 총 금액 */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">💎 총 금액</span>
                    <span className="font-bold text-green-600">
                      {formatAmount(bid.total_price)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* 로딩 인디케이터 */}
          {loading && (
            <div className="flex justify-center py-6">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                <span className="text-sm text-gray-500">추가 데이터 로딩중...</span>
              </div>
            </div>
          )}

          {/* 더 이상 데이터가 없을 때 */}
          {!hasMore && bidList.length > 0 && !loading && (
            <div className="text-center text-gray-400 text-sm py-4 border-t">
              <span className="bg-gray-100 px-3 py-1 rounded-full">
                모든 데이터를 불러왔습니다
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}