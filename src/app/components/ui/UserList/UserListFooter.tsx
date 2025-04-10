import React, { useEffect } from 'react';

interface UserListFooterProps {
  selectedCount: number;
  totalCount: number;
  onBulkStatusChange: () => void;
  isUpdatingStatus: boolean;
  isNoteMemberView?: boolean; // 멤버 보기 모드인지 여부
  onAddMembersToNote?: () => void;
  onRemoveMembersFromNote?: () => void; // 멤버 삭제 함수 추가
}

const UserListFooter: React.FC<UserListFooterProps> = ({
  selectedCount,
  totalCount,
  onBulkStatusChange,
  isUpdatingStatus,
  isNoteMemberView = false,
  onAddMembersToNote,
  onRemoveMembersFromNote,
}) => {
  // props 모니터링을 위한 useEffect 추가
  useEffect(() => {
    console.log('UserListFooter props 변경됨:');
    console.log('- isNoteMemberView:', isNoteMemberView);
    console.log('- onAddMembersToNote 존재 여부:', !!onAddMembersToNote);
    console.log('- onRemoveMembersFromNote 존재 여부:', !!onRemoveMembersFromNote);
  }, [isNoteMemberView, onAddMembersToNote, onRemoveMembersFromNote]);

  // 어떤 버튼을 표시할지 결정하는 로직을 명확하게
  const showRemoveButton = isNoteMemberView && !!onRemoveMembersFromNote;
  const showAddButton = !showRemoveButton && !!onAddMembersToNote;

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

            {/* 조건부 렌더링: 명시적 변수 사용 */}
            {showRemoveButton && (
              <button 
                className="user-list-bulk-action-button"
                onClick={onRemoveMembersFromNote}
                disabled={isUpdatingStatus}
                style={{backgroundColor: '#FFE5E5'}}
              >
                노트에서 멤버 삭제
              </button>
            )}
            
            {showAddButton && (
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
      
      {/* 개발 중 디버그용 데이터 표시 */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ 
          position: 'absolute', 
          bottom: '-20px', 
          left: '10px', 
          background: '#f0f0f0', 
          padding: '2px 5px', 
          border: '1px solid #ccc', 
          fontSize: '9px',
          zIndex: 100
        }}>
          isNoteMemberView: {String(isNoteMemberView)} | 
          showRemoveButton: {String(showRemoveButton)} | 
          showAddButton: {String(showAddButton)}
        </div>
      )}
    </div>
  );
};

export default UserListFooter;