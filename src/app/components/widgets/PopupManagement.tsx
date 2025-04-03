import React from "react";
import '../../styles/PopupManagementStyle.css';

export default function PopupManagement() {
    return (
        <div className="popup-management-container">
            {/* Title */}
            <div className="popup-management-title">
                <div className="popup-management-title-text">
                    <span>팝업 관리</span>
                </div>
            </div>

            {/* Row 1: File Name and Upload */}
            <div className="popup-management-row">
                <div className="popup-management-cell-label">
                    <span>파일명</span>
                </div>
                <div className="popup-management-cell-content">
                    <span>popup.png</span>
                </div>
                <div className="popup-management-cell-action">
                    <span>업로드</span>
                </div>
            </div>

            {/* Row 2: Modification Date */}
            <div className="popup-management-row">
                <div className="popup-management-cell-label">
                    <span>수정일</span>
                </div>
                <div className="popup-management-cell-content-full">
                    <span>2025-03-25 16:40:00.00</span>
                </div>
            </div>

            {/* Row 3: Member Cancellation */}
            <div className="popup-management-row">
                <div className="popup-management-cell-label-full">
                    <span>열람 취소 회원</span>
                </div>
            </div>

            {/* Multi-line content area */}
            <div className="popup-management-multi-content">
                <div className="popup-management-multi-content-inner">
                    <span>11,12,13,15</span>
                </div>
            </div>

            {/* Row 4: Save Info and Button */}
            <div className="popup-management-row-save">
                <div className="popup-management-cell-info">
                    <span>2025-03-25 09:10:00.00 저장</span>
                </div>
                <div className="popup-management-cell-save">
                    <span>저장하기</span>
                </div>
            </div>
        </div>
    );
}