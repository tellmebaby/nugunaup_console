import React from "react";
import '../../styles/UserDetailStyle.css';

export default function UserDetail() {
  return (
    <div className="user-detail-container">
      {/* 타이틀 */}
      <div className="user-detail-title">
        <div className="user-detail-title-text">
          <span>회원 상세정보</span>
        </div>
      </div>

      {/* 본문 내용 */}
      <div className="user-detail-body">
        {/* 회원명 및 회원번호 */}
        <div className="user-detail-row">
          <div className="user-detail-label">
            <span>회원명</span>
          </div>
          <div className="user-detail-content">
            <span>김춘삼</span>
          </div>
          <div className="user-detail-label-second">
            <span>회원번호</span>
          </div>
          <div className="user-detail-content-second">
            <span>3491</span>
          </div>
        </div>

        {/* 유형 및 회사명 */}
        <div className="user-detail-row">
          <div className="user-detail-label">
            <span>유형</span>
          </div>
          <div className="user-detail-content">
            <span>대표</span>
          </div>
          <div className="user-detail-label-second">
            <span>회사명</span>
          </div>
          <div className="user-detail-content-second">
            <span>춘삼스</span>
          </div>
        </div>

        {/* 그룹 및 단지명 */}
        <div className="user-detail-row">
          <div className="user-detail-label">
            <span>그룹</span>
          </div>
          <div className="user-detail-content">
            <span>서울</span>
          </div>
          <div className="user-detail-label-second">
            <span>단지명</span>
          </div>
          <div className="user-detail-content-second">
            <span>서울중구</span>
          </div>
        </div>

        {/* 전화번호 및 수신여부 */}
        <div className="user-detail-row">
          <div className="user-detail-label">
            <span>전화번호</span>
          </div>
          <div className="user-detail-content">
            <span>010-1234-5678</span>
          </div>
          <div className="user-detail-label-second">
            <span>수신여부</span>
          </div>
          <div className="user-detail-content-second">
            <span className="status-enabled">가능</span>
          </div>
        </div>

        {/* 은행 정보 */}
        <div className="user-detail-row">
          <div className="user-detail-label-wide">
            <span>대한은행</span>
          </div>
          <div className="user-detail-content-wide">
            <span>1234-11-12345678</span>
          </div>
        </div>

        {/* 이메일 */}
        <div className="user-detail-row">
          <div className="user-detail-label-wide">
            <span>이메일</span>
          </div>
          <div className="user-detail-content-wide">
            <span>email@email.com</span>
          </div>
        </div>

        {/* 인증일 */}
        <div className="user-detail-row">
          <div className="user-detail-label-wide">
            <span>인증일</span>
          </div>
          <div className="user-detail-content-wide">
            <span>2025-03-20 09:10:00.00</span>
          </div>
        </div>

        {/* 마지막활동일 */}
        <div className="user-detail-row">
          <div className="user-detail-label-wide">
            <span>마지막활동일</span>
          </div>
          <div className="user-detail-content-wide">
            <span>2025-03-20 09:10:00.00</span>
          </div>
        </div>

        {/* 담당매니저 */}
        <div className="user-detail-row">
          <div className="user-detail-label-wide">
            <span>담당매니저</span>
          </div>
          <div className="user-detail-content-wide">
            <span>admin</span>
          </div>
        </div>

        {/* NOTE 헤더 */}
        <div className="user-detail-row">
          <div className="user-detail-label-full">
            <span>NOTE</span>
          </div>
        </div>

        {/* NOTE 내용 */}
        <div className="user-detail-note">
          <div className="user-detail-note-content">
            <span>레이 매물 통화 결과 낙찰 금액 조정중</span>
          </div>
        </div>

        {/* 저장 정보 및 버튼 */}
        <div className="user-detail-row">
          <div className="user-detail-content-wide">
            <span>2025-03-25 09:10:00.00 저장</span>
          </div>
          <div className="user-detail-save-button">
            <span>저장하기</span>
          </div>
        </div>
      </div>
    </div>
  );
}