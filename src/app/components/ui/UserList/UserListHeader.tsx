import React from 'react';

interface UserListHeaderProps {
  onSelectAll: () => void;
  allSelected: boolean;
}

const UserListHeader: React.FC<UserListHeaderProps> = ({
  onSelectAll,
  allSelected
}) => {
  return (
    <div className="user-list-header">
      <div className="user-list-header-cell user-list-checkbox">
        <div 
          className={`user-list-checkbox-control ${allSelected ? 'user-list-checkbox-checked' : ''}`}
          onClick={onSelectAll}
        ></div>
      </div>
      <div className="user-list-header-cell user-list-number">
        <div className="user-list-header-content">
          <span className="user-list-header-text">번호 ▲</span>
        </div>
      </div>
      <div className="user-list-header-cell user-list-name">
        <div className="user-list-header-content">
          <span className="user-list-header-text">이름</span>
        </div>
      </div>
      <div className="user-list-header-cell user-list-group">
        <div className="user-list-header-content">
          <span className="user-list-header-text">그룹</span>
        </div>
      </div>
      <div className="user-list-header-cell user-list-company">
        <div className="user-list-header-content">
          <span className="user-list-header-text">회사명</span>
        </div>
      </div>
      <div className="user-list-header-cell user-list-cert-date">
        <div className="user-list-header-content">
          <span className="user-list-header-text">인증일</span>
        </div>
      </div>
      <div className="user-list-header-cell user-list-last-date">
        <div className="user-list-header-content">
          <span className="user-list-header-text">최근활동일</span>
        </div>
      </div>
      <div className="user-list-header-cell user-list-listings">
        <div className="user-list-header-content">
          <span className="user-list-header-text">출품수</span>
        </div>
      </div>
      <div className="user-list-header-cell user-list-sales">
        <div className="user-list-header-content">
          <span className="user-list-header-text">판매수</span>
        </div>
      </div>
      <div className="user-list-header-cell user-list-status">
        <div className="user-list-header-content">
          <span className="user-list-header-text">수신상태</span>
        </div>
      </div>
    </div>
  );
};

export default UserListHeader;