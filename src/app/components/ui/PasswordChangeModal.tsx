// src/app/components/ui/PasswordChangeModal.tsx
"use client";

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/ui/PasswordChangeModal.css';

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [step, setStep] = useState<'current' | 'new'>('current');
  const [isLoading, setIsLoading] = useState(false);

  // 모달이 닫힐 때 상태 초기화
  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    setMessage(null);
    setStep('current');
    onClose();
  };

  // 현재 비밀번호 확인
  const verifyCurrentPassword = async () => {
    if (!currentPassword) {
      setError('현재 비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 여기서는 간단히 다음 단계로 넘어가도록 구현
      // 실제로는 백엔드에서 비밀번호 확인 API가 있으면 더 좋습니다
      setStep('new');
    } catch (err) {
      setError('현재 비밀번호를 확인할 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 비밀번호 변경 요청
  const changePassword = async () => {
    // 입력 유효성 검사
    if (!newPassword) {
      setError('새 비밀번호를 입력해주세요.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
      return;
    }

    // 비밀번호 복잡성 검사 (예: 최소 8자)
    if (newPassword.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (!user?.id) {
        throw new Error('사용자 정보를 찾을 수 없습니다.');
      }

      const response = await fetch('/api/nup/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          user_id: user.id,
          current_password: currentPassword,
          new_password: newPassword
        })
      });

      // 응답 확인
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '비밀번호 변경에 실패했습니다.');
      }

      setMessage('비밀번호가 성공적으로 변경되었습니다.');
      
      // 3초 후 모달 닫기
      setTimeout(() => {
        handleClose();
      }, 3000);
    } catch (err) {
      setError((err as Error).message || '비밀번호 변경 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 모달이 열려있지 않으면 아무것도 렌더링하지 않음
  if (!isOpen) return null;

  return (
    <div className="password-modal-overlay">
      <div className="password-modal">
        <div className="password-modal-header">
          <h3>비밀번호 변경</h3>
          <button 
            className="password-modal-close" 
            onClick={handleClose}
          >
            ×
          </button>
        </div>
        
        <div className="password-modal-body">
          {step === 'current' ? (
            <div className="password-modal-input-group">
              <label htmlFor="current-password">현재 비밀번호</label>
              <input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="password-modal-input"
                placeholder="현재 비밀번호를 입력하세요"
                disabled={isLoading}
              />
            </div>
          ) : (
            <>
              <div className="password-modal-input-group">
                <label htmlFor="new-password">새 비밀번호</label>
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="password-modal-input"
                  placeholder="새 비밀번호를 입력하세요"
                  disabled={isLoading}
                />
              </div>
              <div className="password-modal-input-group">
                <label htmlFor="confirm-password">비밀번호 확인</label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="password-modal-input"
                  placeholder="새 비밀번호를 다시 입력하세요"
                  disabled={isLoading}
                />
              </div>
            </>
          )}
          
          {error && <div className="password-modal-error">{error}</div>}
          {message && <div className="password-modal-success">{message}</div>}
        </div>
        
        <div className="password-modal-footer">
          <button 
            className="password-modal-cancel" 
            onClick={handleClose}
            disabled={isLoading}
          >
            취소
          </button>
          <button 
            className="password-modal-submit" 
            onClick={step === 'current' ? verifyCurrentPassword : changePassword}
            disabled={isLoading}
          >
            {isLoading ? '처리 중...' : step === 'current' ? '다음' : '완료'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordChangeModal;