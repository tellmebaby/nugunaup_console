"use client";

import { useWidgets } from '../../context/WidgetContext';
import { useAuth } from '../../context/AuthContext';
import { SearchBar, IconButton, UserBadge, DropdownMenu, Logo } from '../ui';
import React, { useState, useRef, useEffect } from 'react';
import '../../styles/HeaderStyle.css';

export default function Header() {
  const { widgets, toggleWidget, resetWidgets, isWidgetAllowed } = useWidgets();
  const { user, logout } = useAuth();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const settingsMenuRef = useRef<HTMLDivElement>(null);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  
  // 위젯 드롭다운 아이템 생성 - 권한 확인 추가
  const dropdownItems = widgets.map(widget => ({
    id: widget.id,
    label: widget.name,
    checked: widget.isVisible,
    disabled: !isWidgetAllowed(widget.id) // 권한 없는 위젯은 비활성화
  }));

  // 로그아웃 처리
  const handleLogout = () => {
    logout();
  };

  // 위젯 설정 초기화
  const handleResetWidgets = () => {
    setShowResetConfirm(true);
    setShowSettingsMenu(false); // 설정 메뉴 닫기
  };

  // 초기화 확인
  const confirmReset = () => {
    resetWidgets();
    setShowResetConfirm(false);
  };

  // 초기화 취소
  const cancelReset = () => {
    setShowResetConfirm(false);
  };
  
  // 설정 메뉴 토글
  const toggleSettingsMenu = () => {
    setShowSettingsMenu(!showSettingsMenu);
  };
  
  // 설정 메뉴 외부 클릭 처리
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        settingsMenuRef.current && 
        !settingsMenuRef.current.contains(event.target as Node) &&
        settingsButtonRef.current &&
        !settingsButtonRef.current.contains(event.target as Node)
      ) {
        setShowSettingsMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 사용자 표시 이름
  const displayName = user?.nsa_id || 'admin';
  
  // 사용자 position (디버깅용)
  const userPosition = user?.position || 'sales';
  console.log('현재 사용자 position:', userPosition);

  return (
    <div className="header-container">
      <header className="header-content">
        {/* 좌측 영역 */}
        <div className="header-left">
          {/* 로고 */}
          <Logo />

          {/* 검색 */}
          <SearchBar placeholder="Search.." />
        </div>

        {/* 우측 영역 */}
        <div className="header-right">
          {/* 위젯 메뉴 */}
          <div className="widget-dropdown-container">
            <DropdownMenu 
              buttonText="WIDGET" 
              headerText="위젯 설정" 
              items={dropdownItems}
              onItemToggle={toggleWidget}
            />
          </div>

          {/* 설정 버튼 및 드롭다운 메뉴 */}
          <div className="settings-dropdown">
            <button
              ref={settingsButtonRef}
              className="control-button"
              onClick={toggleSettingsMenu}
              aria-label="Settings"
            >
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
            
            {/* 설정 드롭다운 메뉴 */}
            {showSettingsMenu && (
              <div 
                ref={settingsMenuRef}
                className="settings-dropdown-menu"
              >
                <div className="settings-dropdown-header">시스템 설정</div>
                <div className="settings-dropdown-items">
                  <div 
                    className="settings-dropdown-item"
                    onClick={handleResetWidgets}
                  >
                    <span className="settings-dropdown-text">위젯 초기화</span>
                  </div>
                  {/* 필요시 추가 메뉴 항목 */}
                </div>
              </div>
            )}
          </div>

          {/* 알림 버튼 */}
          <IconButton ariaLabel="Notifications">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </IconButton>

          {/* 사용자 ID 버튼과 로그아웃 */}
          <UserBadge 
            username={displayName} 
            onClick={handleLogout} 
          />
        </div>
      </header>

      {/* 초기화 확인 모달 */}
      {showResetConfirm && (
        <div className="reset-confirm-overlay">
          <div className="reset-confirm-modal">
            <div className="reset-confirm-title">위젯 설정 초기화</div>
            <div className="reset-confirm-message">
              모든 위젯 설정을 당신의 역할({userPosition})에 맞는 기본 설정으로 되돌리시겠습니까?
            </div>
            <div className="reset-confirm-buttons">
              <button className="reset-cancel-button" onClick={cancelReset}>취소</button>
              <button className="reset-confirm-button" onClick={confirmReset}>초기화</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}