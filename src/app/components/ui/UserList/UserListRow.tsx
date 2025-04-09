import React from 'react';
import { User } from './types';

interface UserListRowProps {
  user: User;
  onToggleSelect: (id: number) => void;
  onStatusClick: (userId: number, currentStatus: 'Y' | 'N') => void;
  forwardedRef?: React.Ref<HTMLDivElement>;
}

const UserListRow: React.FC<UserListRowProps> = ({
  user,
  onToggleSelect,
  onStatusClick,
  forwardedRef
}) => {
  // NULL 값을 대시(-)로 표시하는 함수
  const formatField = (value: string | number | null | undefined): string => {
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    return String(value);
  };

  return (
    <div 
      className="user-list-row"
      ref={forwardedRef}
    >
      <div className="user-list-cell user-list-checkbox">
        <div 
          className={`user-list-checkbox-control ${user.selected ? 'user-list-checkbox-checked' : ''}`}
          onClick={() => onToggleSelect(user.id)}
        ></div>
      </div>
      <div className="user-list-cell user-list-number">
        <div className="user-list-cell-content">
          <span className="user-list-cell-text">{user.id}</span>
        </div>
      </div>
      <div className="user-list-cell user-list-name">
        <div className="user-list-cell-content">
          <span className="user-list-cell-text">{user.real_name}</span>
        </div>
      </div>
      <div className="user-list-cell user-list-group">
        <div className="user-list-cell-content">
          <span className="user-list-cell-text">{formatField(user.member_type)}</span>
        </div>
      </div>
      <div className="user-list-cell user-list-company">
        <div className="user-list-cell-content">
          <span className="user-list-cell-text">{formatField(user.company_name)}</span>
        </div>
      </div>
      <div className="user-list-cell user-list-cert-date">
        <div className="user-list-cell-content">
          <span className="user-list-cell-text">
            {user.verified_date ? user.verified_date.split(' ')[0] : '-'}
          </span>
        </div>
      </div>
      <div className="user-list-cell user-list-last-date">
        <div className="user-list-cell-content">
          <span className="user-list-cell-text">
            {user.last_modified ? user.last_modified.split(' ')[0] : '-'}
          </span>
        </div>
      </div>
      <div className="user-list-cell user-list-listings">
        <div className="user-list-cell-content">
          <span className="user-list-cell-text">{formatField(user.entry_count)}</span>
        </div>
      </div>
      <div className="user-list-cell user-list-sales">
        <div className="user-list-cell-content">
          <span className="user-list-cell-text">{formatField(user.sold_count)}</span>
        </div>
      </div>
      <div 
        className="user-list-cell user-list-status" 
        onClick={() => onStatusClick(user.id, user.is_received)}
      >
        <div className={`user-list-cell-content ${user.status === 'enabled' ? 'user-list-status-enabled' : 'user-list-status-disabled'}`}>
          <span className="user-list-cell-text user-list-status-clickable">{user.is_received === 'Y' ? '가능' : '불가'}</span>
        </div>
      </div>
    </div>
  );
};

export default UserListRow;