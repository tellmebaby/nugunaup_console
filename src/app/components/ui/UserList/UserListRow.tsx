import React from 'react';
import { User } from './types';

interface UserListRowProps {
  user: User;
  onToggleSelect: (id: number) => void;
  onStatusClick: (userId: number, currentStatus: 'Y' | 'N') => void;
  forwardedRef?: React.Ref<HTMLDivElement>;
  onRowClick?: (userId: number) => void;
}

const UserListRow: React.FC<UserListRowProps> = ({
  user,
  onToggleSelect,
  onStatusClick,
  forwardedRef,
  onRowClick
}) => {
  // NULL 값을 대시(-)로 표시하는 함수
  const formatField = (value: string | number | null | undefined): string => {
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    return String(value);
  };

  // 행 클릭 핸들러 - 체크박스 영역을 제외하고 실행됨
  const handleRowClick = () => {
    if (onRowClick) {
      onRowClick(user.id);
    }
  };

  return (
    <div 
      className="user-list-row"
      ref={forwardedRef}
      onClick={handleRowClick} // 행 클릭 핸들러 연결
      style={{ cursor: 'pointer' }}
    >
      {/* 체크박스 셀 - 상위 행 클릭 이벤트와 독립적으로 작동 */}
      <div 
        className="user-list-cell user-list-checkbox"
        onClick={(e) => {
          e.stopPropagation(); // 이벤트 버블링 중지 - 행 클릭 이벤트가 실행되지 않음
          onToggleSelect(user.id);
        }}
      >
        <div 
          className={`user-list-checkbox-control ${user.selected ? 'user-list-checkbox-checked' : ''}`}
        ></div>
      </div>

      {/* 나머지 셀들 */}
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
      <div className="user-list-cell user-list-nickname">
        <div className="user-list-cell-content">
          <span className="user-list-cell-text">{formatField(user.nickname)}</span>
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
        onClick={(e) => {
          e.stopPropagation(); // 행 클릭 이벤트 중지
          onStatusClick(user.id, user.is_received);
        }}
      >
        <div className={`user-list-cell-content ${user.status === 'enabled' ? 'user-list-status-enabled' : 'user-list-status-disabled'}`}>
          <span className="user-list-cell-text user-list-status-clickable">{user.is_received === 'Y' ? '가능' : '불가'}</span>
        </div>
      </div>
    </div>
  );
};

export default UserListRow;