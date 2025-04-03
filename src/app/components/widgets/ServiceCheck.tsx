import React from "react";
import '../../styles/ServiceCheckStyle.css';

export default function ServiceCheck() {
    return (
        <div className="service-check-container">
            <div className="service-check-title">
                <div className="service-check-title-text">
                    <span>서비스점검 설정</span>
                </div>
            </div>

            {/* Table Rows */}
            {/* Row 1: File Name */}
            <div className="service-check-row">
                <div className="service-check-cell-label">
                    <span>파일명</span>
                </div>
                <div className="service-check-cell-content">
                    <span>caution.png</span>
                </div>
                <div className="service-check-cell-action">
                    <span>업로드</span>
                </div>
            </div>

            {/* Row 2: Modification Date */}
            <div className="service-check-row">
                <div className="service-check-cell-label">
                    <span>수정일</span>
                </div>
                <div className="service-check-cell-content-full">
                    <span>2025-03-25 16:40:00.00</span>
                </div>
            </div>

            {/* Row 3: Maintenance Start */}
            <div className="service-check-row">
                <div className="service-check-cell-label">
                    <span>점검 시작</span>
                </div>
                <div className="service-check-cell-content-full">
                    <span>2025-04-01 08:30:00.00</span>
                </div>
            </div>

            {/* Row 4: Maintenance End */}
            <div className="service-check-row">
                <div className="service-check-cell-label">
                    <span>점검 종료</span>
                </div>
                <div className="service-check-cell-content-full">
                    <span>2025-04-01 10:30:00.00</span>
                </div>
            </div>

            {/* Row 5: Current Status */}
            <div className="service-check-row">
                <div className="service-check-cell-label">
                    <span>현재 상태</span>
                </div>
                <div className="service-check-cell-content-full">
                    <div className="status-active">서비스중</div>
                </div>
            </div>
        </div>
    );
}