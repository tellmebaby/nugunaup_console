import React from 'react';

interface UserListFooterProps {
  selectedCount: number;
  totalCount: number;
  onBulkStatusChange: () => void;
  isUpdatingStatus: boolean;
}

const UserListFooter: React.FC<UserListFooterProps> = ({
  selectedCount,
  totalCount,
  onBulkStatusChange,
  isUpdatingStatus
}) => {
  return (
    <div className="user-list-footer">
      {selectedCount > 0 && (
        <button 
          className="user-list-bulk-action-button"
          onClick={onBulkStatusChange}
          disabled={isUpdatingStatus}
        >
          {isUpdatingStatus ? '처리중...' : '수신상태 일괄변경'}
        </button>
      )}
      <div className="user-list-footer-right">
        <span className="user-list-footer-text">{selectedCount} Selected</span>
        <span className="user-list-footer-text">{totalCount} Searching</span>
      </div>
    </div>
  );
};

export default UserListFooter;