import React from "react";
import '../../styles/DiskManagementStyle.css';

export default function DiskManagement() {
    return (
        <div className="disk-management-container">
            <div className="disk-management-title">
                <div className="disk-management-title-text">
                    <span>서버 용량 관리</span>
                </div>
            </div>

            {/* Row 1: IP Address */}
            <div className="disk-management-row">
                <div className="disk-management-cell-label">
                    <span>아이피</span>
                </div>
                <div className="disk-management-cell-content">
                    <span>201.19.11.349</span>
                </div>
            </div>

            {/* Row 2: Total and Remaining Capacity */}
            <div className="disk-management-row">
                <div className="disk-management-cell-label">
                    <span>전체용량</span>
                </div>
                <div className="disk-management-cell-content-small">
                    <span>1.7T</span>
                </div>
                <div className="disk-management-cell-label-second">
                    <span>남은용량</span>
                </div>
                <div className="disk-management-cell-content-small-second">
                    <span>0.2T</span>
                </div>
            </div>

            {/* Row 3: Retention Period and System Status */}
            <div className="disk-management-row">
                <div className="disk-management-cell-label">
                    <span>보존기간</span>
                </div>
                <div className="disk-management-cell-content-small">
                    <span>2년</span>
                </div>
                <div className="disk-management-cell-label-second">
                    <span>시스템 상태</span>
                </div>
                <div className="disk-management-cell-content-small-second">
                    <div className="status-running">실행중</div>
                </div>
            </div>

            {/* Row 4: Execution History Label */}
            <div className="disk-management-row">
                <div className="disk-management-cell-label-full">
                    <span>실행기록</span>
                </div>
            </div>

            {/* Multi-line content area for excution history */}
            <div className="disk-management-multi-content">
                <div className="disk-management-multi-content-inner">
                    <span>[2025-03-25] 삭제실행 [2025-03-25] 1,300파일 삭제 성공</span>
                </div>
            </div>
        </div>
    );
}