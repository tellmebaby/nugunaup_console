import React, { useState, useRef, useEffect } from 'react';
import '../../styles/ui/SubscriptionModal.css';

interface SubscriptionModalProps {
  isOpen: boolean;
  userCount: number;
  currentStatus: 'Y' | 'N';
  onClose: () => void;
  onConfirm: (note: string) => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  userCount,
  currentStatus,
  onClose,
  onConfirm
}) => {
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 모달이 열릴 때 입력 필드에 포커스
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // 모달 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  const handleSubmit = () => {
    if (note.trim().length === 0) {
      setError('변경 이유를 입력해주세요.');
      return;
    }
    
    onConfirm(note);
    setNote('');
    setError('');
  };

  if (!isOpen) return null;

  const newStatus = currentStatus === 'Y' ? 'N' : 'Y';
  const statusText = currentStatus === 'Y' ? '수신 가능' : '수신 불가';
  const newStatusText = newStatus === 'Y' ? '수신 가능' : '수신 불가';

  return (
    <div className="modal-overlay">
      <div className="subscription-modal" ref={modalRef}>
        <div className="modal-header">
          <h3>수신상태 변경</h3>
          <button className="modal-close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="modal-info">
            <p>
              {userCount > 1 
                ? `선택한 ${userCount}명의 사용자 수신상태를 '${newStatusText}'로 변경합니다.` 
                : `선택한 사용자의 수신상태를 '${statusText}'에서 '${newStatusText}'로 변경합니다.`}
            </p>
          </div>
          
          <div className="modal-input-group">
            <label htmlFor="note-input">변경 이유</label>
            <textarea 
              id="note-input"
              className={`modal-textarea ${error ? 'modal-textarea-error' : ''}`}
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                if (e.target.value.trim().length > 0) {
                  setError('');
                }
              }}
              placeholder="수신상태 변경 이유를 입력해주세요"
              ref={inputRef}
            />
            {error && <div className="modal-error">{error}</div>}
          </div>
        </div>
        
        <div className="modal-footer">
          <button 
            className="modal-cancel-button" 
            onClick={onClose}
          >
            취소
          </button>
          <button 
            className="modal-confirm-button" 
            onClick={handleSubmit}
          >
            변경하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;