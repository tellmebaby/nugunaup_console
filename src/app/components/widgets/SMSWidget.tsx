// src/app/components/widgets/SMSWidget.tsx
"use client";

import React, { useState, useEffect } from 'react';
import '../../styles/SMSWidgetStyle.css';

interface SMSWidgetProps {
  // 필요한 props가 있다면 여기에 정의
}

const SMSWidget: React.FC<SMSWidgetProps> = () => {
  const [message, setMessage] = useState<string>('');
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sendResult, setSendResult] = useState<string | null>(null);

  // UserList 컴포넌트에서 선택된 사용자 이벤트 수신
  useEffect(() => {
    const handleSelectedUsers = (event: CustomEvent<any[]>) => {
      console.log('SMS Widget: 선택된 사용자 수신:', event.detail);
      
      // 데이터를 받을 때 명확한 형태로 변환
      const processedUsers = event.detail.map((user: any) => ({
        id: user.id,
        real_name: user.real_name || '',
        phone: user.phone || '',
        // is_received 값을 명시적으로 처리
        is_received: String(user.is_received).toUpperCase() === 'Y' ? 'Y' : 'N'
      }));
      
      console.log('처리된 사용자 데이터:', processedUsers);
      console.log('수신 가능 사용자:', processedUsers.filter(u => u.is_received === 'Y' && u.phone));
      
      setSelectedUsers(processedUsers);
    };

    // 이벤트 리스너 등록
    window.addEventListener('sms-selected-users' as any, handleSelectedUsers as any);

    // 컴포넌트 언마운트 시 리스너 제거
    return () => {
      window.removeEventListener('sms-selected-users' as any, handleSelectedUsers as any);
    };
  }, []);

  // SMS 발송 함수
  const sendSMS = async () => {
    if (!message.trim()) {
      alert('메시지를 입력해주세요.');
      return;
    }

    if (selectedUsers.length === 0) {
      alert('선택된 사용자가 없습니다. 사용자 목록에서 먼저 사용자를 선택해주세요.');
      return;
    }

    // 수신 가능한 사용자만 필터링
    console.log('SMS 발송 전 모든 사용자:', selectedUsers);
    
    const receivableUsers = selectedUsers.filter(user => {
      const isReceived = user.is_received === 'Y';
      const hasPhone = !!user.phone;
      
      console.log(`사용자 ${user.id} 필터링 결과:`, { isReceived, hasPhone, phone: user.phone });
      
      return isReceived && hasPhone;
    });
    
    console.log('최종 수신 가능 사용자:', receivableUsers);
    
    if (receivableUsers.length === 0) {
      alert('선택된 사용자 중 수신 가능한 사용자가 없습니다.');
      return;
    }

    const phoneNumbers = receivableUsers.map(user => user.phone);
    
    try {
      setIsSending(true);
      setSendResult(null);
      
      // 외부 SMS API 호출
      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dest: phoneNumbers,
          message: message,
          subject: message.length > 90 ? message.substring(0, 30) + "..." : "",
          date: "", // 바로 발송
          count: 1  // 1회 발송
        })
      });

      if (!response.ok) {
        throw new Error(`SMS 발송 실패: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.status === 'success') {
        setSendResult(`${receivableUsers.length}명에게 문자 메시지가 발송되었습니다.`);
        setMessage(''); // 메시지 초기화
      } else {
        setSendResult(`발송 실패: ${result.message || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('SMS 발송 중 오류:', error);
      setSendResult(`오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="sms-widget-container">
      <div className="sms-widget-title">
        <div className="sms-widget-title-text">
          <span>문자 메시지 보내기</span>
        </div>
      </div>
      
      <div className="sms-widget-content">
        <div className="sms-widget-info">
          {selectedUsers.length > 0 ? (
            <span>선택된 사용자: {selectedUsers.length}명 (수신 가능: {selectedUsers.filter(u => u.is_received === 'Y' && u.phone).length}명)</span>
          ) : (
            <span>사용자 목록에서 먼저 사용자를 선택해주세요</span>
          )}
        </div>
        
        <div className="sms-message-container">
          <textarea
            className="sms-message-input"
            placeholder="보낼 메시지를 입력하세요..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isSending}
          />
          <div className="sms-character-count">
            <span>{message.length} / 2000자</span>
          </div>
        </div>
        
        {sendResult && (
          <div className={`sms-result ${sendResult.includes('실패') || sendResult.includes('오류') ? 'error' : 'success'}`}>
            {sendResult}
          </div>
        )}
      </div>
      
      <div className="sms-widget-footer">
        <div></div> {/* 발신번호 부분 제거 */}
        <button
          className="sms-send-button"
          onClick={sendSMS}
          disabled={isSending || selectedUsers.length === 0 || !message.trim()}
        >
          {isSending ? '발송 중...' : '발송하기'}
        </button>
      </div>
    </div>
  );
};

export default SMSWidget;