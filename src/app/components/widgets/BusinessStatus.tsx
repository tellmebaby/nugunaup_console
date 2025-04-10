import React, { useState, useEffect } from 'react';
import '../../styles/BusinessStatusStyle.css';
import { getAuthHeaders } from '../../utils/auth';

// API 응답 타입 정의
interface BusinessMetricsResponse {
  data: {
    latest: {
      date: string;
      timestamp: string;
      day: number;
      month: number;
      year: number;
      quarter: number;
    };
    metrics: {
      total_users: {
        current: number;
        prev_day: number;
        prev_day_diff: number;
      };
      new_users: {
        current: number;
        monthly_sums: Array<{ sum: string }>;
      };
      active_users: {
        current: number;
        prev_day_diff_percent: number;
      };
      total_listings: {
        current: number;
        monthly_sums: Array<{ sum: string }>;
      };
      successful_bids: {
        current: number;
        monthly_sums: Array<{ sum: string }>;
      };
      total_bid_amount: {
        current: number;
        monthly_sums: Array<{ sum: number }>;
        total_sum: number;
      };
      total_reward_amount: {
        current: number;
        total_sum: number;
      };
      total_commission: {
        current: number;
        total_sum: number;
      };
    };
  };
  status: string;
  message: string;
}

// 개발용 샘플 데이터 (API 호출 실패 시)
const sampleData = {
  total_users: {
    current: 3500,
    prev_day: 25,
    prev_day_diff: 25,
  },
  new_users: {
    current: 51,
    monthly_sums: [{ sum: "280" }],
  },
  active_users: {
    current: 32,
    prev_day_diff_percent: 12,
  },
  total_listings: {
    current: 400,
    monthly_sums: [{ sum: "840" }],
  },
  successful_bids: {
    current: 39,
    monthly_sums: [{ sum: "289" }],
  },
  total_bid_amount: {
    current: 320000000,
    monthly_sums: [{ sum: 320000000 }],
    total_sum: 7500000000,
  },
  total_reward_amount: {
    current: 60000000,
    total_sum: 220000000,
  },
  total_commission: {
    current: 150000000,
    total_sum: 650000000,
  },
};

// 억 단위로 통화 포맷팅 (한국식)
const formatBillion = (value: number): string => {
  return `${(value / 100000000).toFixed(1)}억원`;
};

// 숫자에 콤마 추가
const formatNumber = (value: number): string => {
  return value.toLocaleString('ko-KR');
};

export default function BusinessStatus() {
  const [metrics, setMetrics] = useState<BusinessMetricsResponse['data']['metrics'] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [latestTimestamp, setLatestTimestamp] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        
        // 기존 rewrite 규칙을 사용하여 API 요청
        const response = await fetch('/api/metrics/detailed', {
          method: 'GET',
          headers: getAuthHeaders()
        });

        if (!response.ok) {
          throw new Error(`API 요청 실패: ${response.status}`);
        }

        const data: BusinessMetricsResponse = await response.json();
        
        if (data.status === 'success' && data.data && data.data.metrics) {
          setMetrics(data.data.metrics);
          
          // 최신 타임스탬프 저장
          if (data.data.latest && data.data.latest.timestamp) {
            setLatestTimestamp(data.data.latest.timestamp);
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
          setLatestTimestamp(null);
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
          <div className="business-status-cell-label">
            <span>전체 사용자</span>
          </div>
          <div className="business-status-cell-content-full">
            <span>
              {metrics ? 
                `${formatNumber(metrics.total_users.current)}명 (전일대비 + ${formatNumber(metrics.total_users.prev_day)}명)` : 
                "로딩 중..."}
            </span>
          </div>
        </div>

        {/* 행 2: 신규회원 */}
        <div className="business-status-row">
          <div className="business-status-cell-label">
            <span className="text-width-35">신규회원</span>
          </div>
          <div className="business-status-cell-content-half">
            <span>
              {metrics ? 
                `금일 ${formatNumber(metrics.new_users.current)}명` : 
                "로딩 중..."}
            </span>
          </div>
          <div className="business-status-cell-content-half">
            <span>
              {metrics && metrics.new_users.monthly_sums && metrics.new_users.monthly_sums.length > 0 ? 
                `당월 누적 ${formatNumber(Number(metrics.new_users.monthly_sums[0].sum))}명` : 
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
                `금일 ${formatNumber(metrics.active_users.current)}명` : 
                "로딩 중..."}
            </span>
          </div>
          <div className="business-status-cell-content-half">
            <span>
              {metrics ? 
                `전일대비 ${metrics.active_users.prev_day_diff_percent}%` : 
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
                `금일 ${formatNumber(metrics.total_listings.current)}건` : 
                "로딩 중..."}
            </span>
          </div>
          <div className="business-status-cell-content-half">
            <span className="text-width-103">
              {metrics && metrics.total_listings.monthly_sums && metrics.total_listings.monthly_sums.length > 0 ? 
                `당월 누적 ${formatNumber(Number(metrics.total_listings.monthly_sums[0].sum))}건` : 
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
                `금일 ${formatNumber(metrics.successful_bids.current)}건` : 
                "로딩 중..."}
            </span>
          </div>
          <div className="business-status-cell-content-half">
            <span>
              {metrics && metrics.successful_bids.monthly_sums && metrics.successful_bids.monthly_sums.length > 0 ? 
                `당월 누적 ${formatNumber(Number(metrics.successful_bids.monthly_sums[0].sum))}건` : 
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
                `금일 ${formatBillion(metrics.total_bid_amount.current)}` : 
                "로딩 중..."}
            </span>
          </div>
          <div className="business-status-cell-content-half">
            <span className="text-width-103">
              {metrics ? 
                `누적 ${formatBillion(metrics.total_bid_amount.total_sum)}` : 
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
                `금일 ${formatBillion(metrics.total_reward_amount.current)}` : 
                "로딩 중..."}
            </span>
          </div>
          <div className="business-status-cell-content-half">
            <span className="text-width-103">
              {metrics ? 
                `누적 ${formatBillion(metrics.total_reward_amount.total_sum)}` : 
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
                `금일 ${formatBillion(metrics.total_commission.current)}` : 
                "로딩 중..."}
            </span>
          </div>
          <div className="business-status-cell-content-half">
            <span className="text-width-103">
              {metrics ? 
                `누적 ${formatBillion(metrics.total_commission.total_sum)}` : 
                "데이터 없음"}
            </span>
          </div>
        </div>
      </div>

      {/* 푸터: 마지막 업데이트 시간 */}
      <div className="business-status-footer">
        <span className="business-status-footer-text">
          {latestTimestamp ? 
            `마지막 업데이트: ${latestTimestamp}` : 
            metrics && sampleData !== metrics ? 
              `마지막 업데이트: ${new Date().toLocaleString('ko-KR')}` : 
              "샘플 데이터"}
        </span>
      </div>
    </div>
  );
}