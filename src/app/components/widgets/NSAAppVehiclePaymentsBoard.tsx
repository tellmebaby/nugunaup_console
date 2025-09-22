'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getAuthHeaders } from '../../utils/auth';

// API 베이스 URL (차량입찰관리와 동일)
const API_BASE = '/api/proxy';

// 입찰참여비 데이터 타입
interface VehicleBidPayment {
  id: number;
  vehicle_bid_id: number;
  user_id: number;
  amount: number;
  status: string; // '입금확인중', '입금확인', '환불대기', '환불완료', '삭제'
  payment_method: string;
  payment_info: string | null;
  created_at: string;
  updated_at: string;
  // 조인된 데이터
  ac_no: number;
  vehicle_bid_amount: number;
  vehicle_bid_status: string;
  user_name: string;
  user_phone: string;
  user_type: string;
}

interface ApiResponse {
  status: string;
  data: VehicleBidPayment[];
  pagination: {
    current_page: number;
    limit: number;
    total_count: number;
    total_pages: number;
  };
}

export default function NSAAppVehiclePaymentsBoard() {
  const [payments, setPayments] = useState<VehicleBidPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [refundOnly, setRefundOnly] = useState(false);

  // 데이터 fetch 함수
  const fetchPayments = async (pageNum: number, limit: number = 20): Promise<ApiResponse> => {
    try {
      console.log('[페이먼트리스트 요청]', { pageNum, limit });
      const response = await fetch(`/api/vehicle-payments?page=${pageNum}&limit=${limit}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      console.log('[페이먼트리스트 응답]', response.status, response.statusText);
      const responseText = await response.text();
      console.log('[페이먼트리스트 응답본문]', responseText);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      let data: ApiResponse;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('[페이먼트리스트 응답 파싱 실패]', responseText);
        throw new Error('서버 응답을 파싱할 수 없습니다.');
      }
      if (data.status !== 'success') {
        console.error('[페이먼트리스트 결과 실패]', data);
        throw new Error('API 요청이 실패했습니다.');
      }
      return data;
    } catch (error) {
      console.error('[페이먼트리스트 에러]', error);
      throw new Error('데이터를 가져오는데 실패했습니다: ' + (error as Error).message);
    }
  };

  // 데이터 로드 함수
  const loadPayments = useCallback(async (pageNum: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await fetchPayments(pageNum);
      
      if (pageNum === 1) {
        setPayments(data.data);
      } else {
        setPayments(prev => [...prev, ...data.data]);
      }
      
      setHasMore(data.pagination.current_page < data.pagination.total_pages);
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

  // 상태 업데이트 함수
  const updatePaymentStatus = async (id: number, newStatus: string) => {
    try {
      setUpdatingStatus(id);
      // 기존 프록시 경로 호출 주석 처리
      // const response = await fetch(`/api/vehicle-payments-update/${id}`, {...})
      // 외부 API로 직접 요청
      console.log('[결제상태변경 요청 - 외부 API 직접]', { id, newStatus });
      const response = await fetch(
        `https://port-0-nsa-app-api-m6ojom0b30d70444.sel4.cloudtype.app/api/nsa-app-vehicle-bid/payments/${id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        }
      );
      console.log('[결제상태변경 응답]', response.status, response.statusText);
      const responseText = await response.text();
      console.log('[결제상태변경 응답본문]', responseText);
      if (!response.ok) {
        console.error('[결제상태변경 실패]', response.status, responseText);
        throw new Error(`상태 업데이트 실패: ${response.status}`);
      }
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error('[결제상태변경 응답 파싱 실패]', responseText);
        throw new Error('서버 응답을 파싱할 수 없습니다.');
      }
      const ok = (result && (result.status === 'success' || result.success === true)) || (result && result.message && /성공/.test(result.message));
      if (ok) {
        setPayments(prevList =>
          prevList.map(payment => 
            payment.id === id ? { ...payment, status: newStatus } : payment
          )
        );
      } else {
        console.error('[결제상태변경 결과 실패]', result);
        throw new Error(result?.message || '상태 업데이트에 실패했습니다.');
      }
    } catch (error) {
      setError('상태 업데이트에 실패했습니다: ' + (error as Error).message);
    } finally {
      setUpdatingStatus(null);
    }
  };

  // 무한 스크롤 핸들러
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadPayments(page + 1);
    }
  };

  // 새로고침 핸들러
  const handleRefresh = () => {
    setPage(1);
    setHasMore(true);
    loadPayments(1);
  };

  // 금액 포맷팅
  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string): string => {
    try {
      if (!dateString) return '';
      const d = new Date(dateString.replace(' ', 'T'));
      return d.toLocaleString('ko-KR', { 
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

  // 상태별 스타일
  const getStatusStyle = (status: string) => {
    switch (status) {
      case '입금확인중':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case '입금확인':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case '환불대기':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case '환불완료':
        return 'bg-green-100 text-green-700 border-green-300';
      case '삭제':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadPayments(1);
  }, [loadPayments]);

  if (initialLoading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="text-center text-gray-500">데이터를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow max-h-96 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-gray-800">입찰참여비관리</h3>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
            <div className="relative">
              <input
                type="checkbox"
                checked={refundOnly}
                onChange={() => setRefundOnly(v => !v)}
                className="sr-only peer"
              />
              <div className={refundOnly ? 'w-11 h-6 rounded-full bg-blue-500 transition-colors' : 'w-11 h-6 rounded-full bg-gray-300 transition-colors'} />
              <div className={refundOnly ? 'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transform translate-x-5 transition-transform' : 'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transform translate-x-0 transition-transform'} />
            </div>
            <span>환불대기만 보기</span>
          </label>
        </div>

        <button 
          onClick={handleRefresh}
          disabled={loading}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 text-sm"
        >
          새로고침
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        {(
          refundOnly ? payments.filter(p => p.status === '환불대기') : payments
        ).map(payment => (
          <div key={payment.id} className="border rounded-lg p-3 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-800 text-sm">{payment.user_name}</span>
                <span className="text-xs text-gray-500">ID: {payment.user_id}</span>
                <span className="text-xs text-gray-500">📞 {payment.user_phone}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  payment.user_type === 'verified' 
                    ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                    : 'bg-gray-100 text-gray-700 border border-gray-300'
                }`}>
                  {payment.user_type === 'verified' ? '인증회원' : '일반회원'}
                </span>
              </div>
              
              <div className="text-right">
                <div className="text-sm font-bold text-blue-600">{formatAmount(50000)}</div>
                <div className="text-xs text-gray-500">{formatDate(payment.updated_at)}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
              <div>매물번호: <span className="font-medium">{payment.ac_no}</span></div>
              <div>입찰금액: <span className="font-medium">{formatAmount(payment.vehicle_bid_amount)}</span></div>
              <div>결제방법: <span className="font-medium">{payment.payment_method}</span></div>
              <div>입찰상태: <span className="font-medium">{payment.vehicle_bid_status}</span></div>
            </div>

            <div className="flex items-center justify-between">
              {payment.status === '환불대기' ? (
                <button
                  onClick={() => updatePaymentStatus(payment.id, '환불완료')}
                  disabled={updatingStatus === payment.id}
                  className="px-2 py-1 rounded text-xs font-medium border bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200 transition-colors disabled:opacity-50"
                >
                  {updatingStatus === payment.id ? '처리중...' : '환불대기 → 환불완료'}
                </button>
              ) : (
                <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusStyle(payment.status)}`}>
                  {payment.status}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {payments.length === 0 && !loading && (
        <div className="text-center text-gray-500 py-8">
          입찰참여비 데이터가 없습니다.
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
  );
}
