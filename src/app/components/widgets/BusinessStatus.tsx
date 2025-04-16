import React, { useState, useEffect } from 'react';
import '../../styles/BusinessStatusStyle.css';
import { getAuthHeaders } from '../../utils/auth';

// API 응답 타입 정의
interface BusinessMetricsResponse {
  data: {
    active_users: number;
    commission: number;
    monthly_sum_new_user: number;
    monthly_sum_successful_bids: number;
    monthly_sum_total_listings: number;
    new_user: number;
    pre_day_active_users: number;
    pre_day_user: number;
    reward_amount: number;
    successful_bids: number;
    timestamp: string;
    total_commission: number;
    total_listings: number;
    total_reward_amount: number;
    total_sum_successful_bids: number;
    total_user: number;
    total_winning_bid: number;
  };
  message: string;
  status: string;
}

// 개발용 샘플 데이터 (API 호출 실패 시)
const sampleData = {
  active_users: 32,
  commission: 0.0,
  monthly_sum_new_user: 280,
  monthly_sum_successful_bids: 289,
  monthly_sum_total_listings: 840,
  new_user: 51,
  pre_day_active_users: 12,
  pre_day_user: 25,
  reward_amount: 0.6,
  successful_bids: 39,
  timestamp: "2025-04-12 01:15:27",
  total_commission: 6.5,
  total_listings: 400,
  total_reward_amount: 2.2,
  total_sum_successful_bids: 75,
  total_user: 3500,
  total_winning_bid: 3.2
};

// 억 단위로 통화 포맷팅 (한국식)
const formatBillion = (value: number): string => {
  return `${(value).toFixed(3)}억원`;
};

// 숫자에 콤마 추가
const formatNumber = (value: number): string => {
  return value.toLocaleString('ko-KR');
};

export default function BusinessStatus() {
  const [metrics, setMetrics] = useState<BusinessMetricsResponse['data'] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        
        // 새로운 API 엔드포인트 사용
        const response = await fetch('/api/statistics/real-time', {
          method: 'GET',
          headers: getAuthHeaders()
        });

        if (!response.ok) {
          throw new Error(`API 요청 실패: ${response.status}`);
        }

        const data: BusinessMetricsResponse = await response.json();
        
        if (data.status === 'success' && data.data) {
          setMetrics(data.data);
          
          // 타임스탬프 저장
          if (data.data.timestamp) {
            setTimestamp(data.data.timestamp);
          }
        } else {
          throw new Error(data.message || '메트릭 데이터 가져오기 실패');
        }
      } catch (err) {
        console.error('비즈니스 메트릭 가져오기 실패:', err);
        // 개발 환경에서는 샘플 데이터로 폴백
        if (process.env.NODE_ENV === 'development') {
          console.log('개발용 샘플 데이터 사용');
          setMetrics(sampleData as any);
          setTimestamp(null);
        } else {
          setError((err as Error).message || '비즈니스 메트릭 로드 실패');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();

    // 5분마다 새로고침하는 인터벌 설정
    const intervalId = setInterval(fetchMetrics, 5 * 60 * 1000);
    
    // 컴포넌트 언마운트 시 정리
    return () => clearInterval(intervalId);
  }, []);

  // 검색 트리거 함수
  const triggerSearch = (searchTerm: string) => {
    // 커스텀 이벤트 생성 및 발생
    const searchEvent = new CustomEvent('search-users', { 
      detail: searchTerm 
    });
    console.log('검색 이벤트 발생:', searchTerm);
    window.dispatchEvent(searchEvent);
  };

  // 로딩 상태 렌더링
  if (loading && !metrics) {
    return (
      <div className="business-status-container">
        <div className="business-status-title">
          <div className="business-status-title-text">
            <span>누구나업 현황</span>
          </div>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: 'calc(100% - 30px)' 
        }}>
          <span style={{ fontSize: '12px', color: '#666' }}>로딩 중...</span>
        </div>
      </div>
    );
  }

  // 에러 상태 렌더링
  if (error && !metrics) {
    return (
      <div className="business-status-container">
        <div className="business-status-title">
          <div className="business-status-title-text">
            <span>누구나업 현황</span>
          </div>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: 'calc(100% - 30px)',
          padding: '0 10px',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '12px', color: '#FF0000' }}>데이터를 불러올 수 없습니다</span>
        </div>
      </div>
    );
  }

  return (
    <div className="business-status-container">
      {/* 제목 */}
      <div className="business-status-title">
        <div className="business-status-title-text">
          <span>누구나업 현황</span>
        </div>
      </div>

      <div className="business-status-content">
        {/* 행 1: 전체 사용자 */}
        <div className="business-status-row">
          <div 
            className="business-status-cell-label"
            onClick={() => triggerSearch("전체사용자")}
            style={{ cursor: 'pointer' }}
            title="전체사용자 검색하기"
          >
            <span>전체 사용자</span>
          </div>
          <div className="business-status-cell-content-full">
            <span>
              {metrics ? 
                `${formatNumber(metrics.total_user)}명 (전일대비 ${metrics.pre_day_user >= 0 ? '+ ' : '- '}${formatNumber(Math.abs(metrics.pre_day_user))}명)` : 
                "로딩 중..."}
            </span>
          </div>
        </div>

        {/* 행 2: 신규회원 */}
        <div className="business-status-row">
          <div 
            className="business-status-cell-label"
            onClick={() => triggerSearch("오늘신규회원")}
            style={{ cursor: 'pointer' }}
            title="오늘신규회원 검색하기"
          >
            <span className="text-width-35">신규회원</span>
          </div>
          <div className="business-status-cell-content-half">
            <span>
              {metrics ? 
                `금일 ${formatNumber(metrics.new_user)}명` : 
                "로딩 중..."}
            </span>
          </div>
          <div className="business-status-cell-content-half">
            <span>
              {metrics ? 
                `당월 누적 ${formatNumber(metrics.monthly_sum_new_user)}명` : 
                "데이터 없음"}
            </span>
          </div>
        </div>

        {/* 행 3: 접속자 */}
        <div className="business-status-row">
          <div className="business-status-cell-label">
            <span className="text-width-26">접속자</span>
          </div>
          <div className="business-status-cell-content-half">
            <span>
              {metrics ? 
                `금일 ${formatNumber(metrics.active_users)}명` : 
                "로딩 중..."}
            </span>
          </div>
          <div className="business-status-cell-content-half">
            <span>
              {metrics ? 
                `전일대비 ${metrics.pre_day_active_users}%` : 
                "데이터 없음"}
            </span>
          </div>
        </div>

        {/* 행 4: 매물건 */}
        <div className="business-status-row">
          <div className="business-status-cell-label">
            <span className="text-width-26">매물건</span>
          </div>
          <div className="business-status-cell-content-half">
            <span className="text-width-103">
              {metrics ? 
                `금일 ${formatNumber(metrics.total_listings)}건` : 
                "로딩 중..."}
            </span>
          </div>
          <div className="business-status-cell-content-half">
            <span className="text-width-103">
              {metrics ? 
                `당월 누적 ${formatNumber(metrics.monthly_sum_total_listings)}건` : 
                "데이터 없음"}
            </span>
          </div>
        </div>

        {/* 행 5: 낙찰건 */}
        <div className="business-status-row">
          <div className="business-status-cell-label">
            <span className="text-width-26">낙찰건</span>
          </div>
          <div className="business-status-cell-content-half">
            <span>
              {metrics ? 
                `금일 ${formatNumber(metrics.successful_bids)}건` : 
                "로딩 중..."}
            </span>
          </div>
          <div className="business-status-cell-content-half">
            <span>
              {metrics ? 
                `당월 누적 ${formatNumber(metrics.monthly_sum_successful_bids)}건` : 
                "데이터 없음"}
            </span>
          </div>
        </div>

        {/* 행 6: 낙찰액 */}
        <div className="business-status-row">
          <div className="business-status-cell-label">
            <span className="text-width-26">낙찰액</span>
          </div>
          <div className="business-status-cell-content-half">
            <span className="text-width-103">
              {metrics ? 
                `금일 ${formatBillion(metrics.total_winning_bid)}` : 
                "로딩 중..."}
            </span>
          </div>
          <div className="business-status-cell-content-half">
            <span className="text-width-103">
              {metrics ? 
                `누적 ${formatBillion(metrics.total_sum_successful_bids)}` : 
                "데이터 없음"}
            </span>
          </div>
        </div>

        {/* 행 7: 리워드 */}
        <div className="business-status-row">
          <div className="business-status-cell-label">
            <span className="text-width-26">리워드</span>
          </div>
          <div className="business-status-cell-content-half">
            <span className="text-width-103">
              {metrics ? 
                `금일 ${formatBillion(metrics.reward_amount)}` : 
                "로딩 중..."}
            </span>
          </div>
          <div className="business-status-cell-content-half">
            <span className="text-width-103">
              {metrics ? 
                `누적 ${formatBillion(metrics.total_reward_amount)}` : 
                "데이터 없음"}
            </span>
          </div>
        </div>

        {/* 행 8: 수수료 */}
        <div className="business-status-row">
          <div className="business-status-cell-label">
            <span className="text-width-26">수수료</span>
          </div>
          <div className="business-status-cell-content-half">
            <span className="text-width-103">
              {metrics ? 
                `금일 ${formatBillion(metrics.commission)}` : 
                "로딩 중..."}
            </span>
          </div>
          <div className="business-status-cell-content-half">
            <span className="text-width-103">
              {metrics ? 
                `누적 ${formatBillion(metrics.total_commission)}` : 
                "데이터 없음"}
            </span>
          </div>
        </div>
      </div>

      {/* 푸터: 마지막 업데이트 시간 */}
      <div className="business-status-footer">
        <span className="business-status-footer-text">
          {timestamp ? 
            `마지막 업데이트: ${timestamp}` : 
            metrics && sampleData !== metrics ? 
              `마지막 업데이트: ${new Date().toLocaleString('ko-KR')}` : 
              "샘플 데이터"}
        </span>
      </div>
    </div>
  );
}