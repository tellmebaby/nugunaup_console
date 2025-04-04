"use client";

import { useWidgets } from '../../context/WidgetContext';
import { useAuth } from '../../context/AuthContext';
import { SearchBar, IconButton, UserBadge, DropdownMenu, Logo } from '../ui';
import '../../styles/HeaderStyle.css';

export default function Header() {
  const { widgets, toggleWidget } = useWidgets();
  const { user, logout } = useAuth();
  
  // 위젯 드롭다운 아이템 생성
  const dropdownItems = widgets.map(widget => ({
    id: widget.id,
    label: widget.name,
    checked: widget.isVisible
  }));

  // 로그아웃 처리
  const handleLogout = () => {
    logout();
  };

  // 사용자 표시 이름 - API에서 가져온 username 또는 기본값 'admin'
  const displayName = user?.username || 'admin';

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
          <DropdownMenu 
            buttonText="WIDGET" 
            headerText="Widget Settings" 
            items={dropdownItems}
            onItemToggle={toggleWidget}
          />

          {/* 설정 버튼 */}
          <IconButton ariaLabel="Settings">
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
          </IconButton>

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
    </div>
  );
}