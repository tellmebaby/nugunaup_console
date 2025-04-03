"use client";

import { useWidgets } from '../../context/WidgetContext';
import { SearchBar, IconButton, UserBadge, DropdownMenu, Logo } from '../ui';
import '../../styles/HeaderStyle.css';

export default function Header() {
  const { widgets, toggleWidget } = useWidgets();
  
  // 위젯 드롭다운 아이템 생성
  const dropdownItems = widgets.map(widget => ({
    id: widget.id,
    label: widget.name,
    checked: widget.isVisible
  }));

  return (
    <div className="header-container">
      <header className="header-content">
        {/* Left section */}
        <div className="header-left">
          {/* Logo */}
          <Logo />

          {/* Search */}
          <SearchBar placeholder="Search.." />
        </div>

        {/* Right section */}
        <div className="header-right">
          {/* Widget Menu */}
          <DropdownMenu 
            buttonText="WIDGET" 
            headerText="Widget Settings" 
            items={dropdownItems}
            onItemToggle={toggleWidget}
          />

          {/* Setting Button */}
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

          {/* Alarm Button */}
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

          {/* User ID Button */}
          <UserBadge username="admin" href="/admin" />
        </div>
      </header>
    </div>
  );
}