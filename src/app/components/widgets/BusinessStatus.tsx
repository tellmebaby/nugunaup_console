import React from 'react';
import '../../styles/BusinessStatusStyle.css';

export default function BusinessStatus() {
  return (
    <div className="business-status-container">
      {/* Title */}
      <div className="business-status-title">
        <div className="business-status-title-text">
          <span>누구나업 현황</span>
        </div>
      </div>

      {/* Table Rows */}
      {/* Row 1: Total Users */}
      <div className="business-status-row">
        <div className="business-status-cell-label">
          <span>전체 사용자</span>
        </div>
        <div className="business-status-cell-content-full">
          <span>3,500명 (전일대비 + 25명)</span>
        </div>
      </div>

      {/* Row 2: New Members */}
      <div className="business-status-row">
        <div className="business-status-cell-label">
          <span className="text-width-35">신규회원</span>
        </div>
        <div className="business-status-cell-content-half">
          <span>금일 51명</span>
        </div>
        <div className="business-status-cell-content-half">
          <span>당월 누적 280명</span>
        </div>
      </div>

      {/* Row 3: Active Users */}
      <div className="business-status-row">
        <div className="business-status-cell-label">
          <span className="text-width-26">접속자</span>
        </div>
        <div className="business-status-cell-content-half">
          <span>금일 32명</span>
        </div>
        <div className="business-status-cell-content-half">
          <span>당월 누적 430명</span>
        </div>
      </div>

      {/* Row 4: Listed Properties */}
      <div className="business-status-row">
        <div className="business-status-cell-label">
          <span className="text-width-26">매물건</span>
        </div>
        <div className="business-status-cell-content-half">
          <span className="text-width-103">금일 400건</span>
        </div>
        <div className="business-status-cell-content-half">
          <span className="text-width-103">당월 누적 840건</span>
        </div>
      </div>

      {/* Row 5: Successful Bids */}
      <div className="business-status-row">
        <div className="business-status-cell-label">
          <span className="text-width-26">낙찰건</span>
        </div>
        <div className="business-status-cell-content-half">
          <span>금일 39건</span>
        </div>
        <div className="business-status-cell-content-half">
          <span>당월 누적 289건</span>
        </div>
      </div>

      {/* Row 6: Bid Amount */}
      <div className="business-status-row">
        <div className="business-status-cell-label">
          <span className="text-width-26">낙찰액</span>
        </div>
        <div className="business-status-cell-content-half">
          <span className="text-width-103">당월 32억원</span>
        </div>
        <div className="business-status-cell-content-half">
          <span className="text-width-103">누적 75억원</span>
        </div>
      </div>

      {/* Row 7: Rewards */}
      <div className="business-status-row">
        <div className="business-status-cell-label">
          <span className="text-width-26">리워드</span>
        </div>
        <div className="business-status-cell-content-half">
          <span className="text-width-103">당월 0.6억원</span>
        </div>
        <div className="business-status-cell-content-half">
          <span className="text-width-103">누적 2.2억원</span>
        </div>
      </div>

      {/* Row 8: Fees */}
      <div className="business-status-row">
        <div className="business-status-cell-label">
          <span className="text-width-26">수수료</span>
        </div>
        <div className="business-status-cell-content-half">
          <span className="text-width-103">당월 1.5억원</span>
        </div>
        <div className="business-status-cell-content-half">
          <span className="text-width-103">누적 6.5억원</span>
        </div>
      </div>
    </div>
  );
}