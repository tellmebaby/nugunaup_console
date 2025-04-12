import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  message,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="edit-modal">
        <div className="edit-modal-header">
          <h3>확인</h3>
          <button className="modal-close-button" onClick={onCancel}>×</button>
        </div>
        <div className="edit-modal-body">
          <p style={{
            fontFamily: "'42dot Sans', sans-serif",
            fontSize: '14px',
            color: '#333',
            margin: '10px 0'
          }}>
            {message}
          </p>
        </div>
        <div className="edit-modal-footer">
          <button className="modal-cancel-button" onClick={onCancel}>취소</button>
          <button 
            className="modal-save-button" 
            onClick={onConfirm}
            style={{backgroundColor: '#FFE5E5'}}
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;