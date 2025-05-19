"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import '../../styles/ui/UserBadge.css';
import PasswordChangeModal from './PasswordChangeModal';

interface UserBadgeProps {
  username: string;
  href?: string;
  onClick?: () => void;
}

const UserBadge: React.FC<UserBadgeProps> = ({
  username,
  href,
  onClick
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Handle outside clicks
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogout = () => {
    setShowDropdown(false);
    if (onClick) onClick();
  };

  const handleChangePassword = () => {
    setShowDropdown(false);
    setShowPasswordModal(true);
  };

  return (
    <div className="user-badge-container">
      <div className="user-badge" onClick={handleToggleDropdown}>
        <span>{username}</span>
      </div>
      
      {showDropdown && (
        <div ref={dropdownRef} className="user-badge-dropdown">
          <div className="user-badge-dropdown-item" onClick={handleChangePassword}>
            비밀번호 변경
          </div>
          <div className="user-badge-dropdown-item" onClick={handleLogout}>
            로그아웃
          </div>
        </div>
      )}

      {/* 비밀번호 변경 모달 */}
      <PasswordChangeModal 
        isOpen={showPasswordModal} 
        onClose={() => setShowPasswordModal(false)} 
      />
    </div>
  );
};

export default UserBadge;