import React, { useState, useEffect } from 'react';
import ConfirmModal from './ConfirmModal';

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
  // 모달 상태 추가
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  
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

  // 모달로 삭제 확인하는 핸들러
  const handleRemoveMembersClick = () => {
    setIsConfirmModalOpen(true);
  };
  
  // 확인 모달에서 확인 클릭시
  const handleConfirmRemove = () => {
    setIsConfirmModalOpen(false);
    if (onRemoveMembersFromNote) {
      onRemoveMembersFromNote(); // 이 함수는 이제 confirm()을 호출하지 않아야 함
    }
  };
  
  // 확인 모달에서 취소 클릭시
  const handleCancelRemove = () => {
    setIsConfirmModalOpen(false);
  };

  return (
    <>
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
                  onClick={handleRemoveMembersClick} // confirm() 대신 모달 열기
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

      {/* 확인 모달 컴포넌트 추가 */}
      {isConfirmModalOpen && (
        <ConfirmModal
          isOpen={isConfirmModalOpen}
          message={`선택한 ${selectedCount}명의 사용자를 노트에서 삭제하시겠습니까?`}
          onConfirm={handleConfirmRemove}
          onCancel={handleCancelRemove}
        />
      )}
    </>
  );
};

export default UserListFooter;