import React from 'react';

interface UserListFooterProps {
  selectedCount: number;
  totalCount: number;
  onBulkStatusChange: () => void;
  isUpdatingStatus: boolean;
  // 새로 추가된 prop

  onAddMembersToNote?: () => void;
}

const UserListFooter: React.FC<UserListFooterProps> = ({
  selectedCount,
  totalCount,
  onBulkStatusChange,
  isUpdatingStatus,

  onAddMembersToNote,
}) => {
  return (
    <div className="user-list-footer">
      <div className="user-list-footer-left">
        {selectedCount > 0 && (
          <>
            <button 
              className="user-list-bulk-action-button"
              onClick={onBulkStatusChange}
              disabled={isUpdatingStatus}
            >
              {isUpdatingStatus ? '처리중...' : '수신상태 일괄변경'}
            </button>

            {onAddMembersToNote && (
              <button 
                className="user-list-bulk-action-button"
                onClick={onAddMembersToNote}
                disabled={isUpdatingStatus}
              >
                노트에 멤버 추가
              </button>
              )}
          </>
        )}        
      </div>
      <div className="user-list-footer-right">
        <span className="user-list-footer-text">{selectedCount} Selected</span>
        <span className="user-list-footer-text">{totalCount} Searching</span>
      </div>
    </div>
  );
};

export default UserListFooter;