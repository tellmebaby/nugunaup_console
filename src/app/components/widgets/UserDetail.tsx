import React, { useState, useEffect } from 'react';
import { getAuthHeaders } from '../../utils/auth';
import '../../styles/UserDetailStyle.css';

interface UserDetailProps {
  selectedUserId?: number | null;
}

interface UserDetailData {
  id: number;
  real_name: string;
  nickname: string;
  company_name: string;
  member_type: string;
  complex_name: string;
  phone: string;
  is_received: string;
  bank_name: string;
  account_number: string;
  email: string;
  verified_date: string;
  last_active_date: string | null;
  manager_name: string | null;
  note1: string | null;
  last_modified: string;
}

// 모달에 표시할 필드 타입
type EditableFieldType = 'nickname' | 'member_type' | 'manager_name';

const UserDetail: React.FC<UserDetailProps> = ({ selectedUserId }) => {
  const [userData, setUserData] = useState<UserDetailData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // 편집 관련 상태
  const [isEditingNote, setIsEditingNote] = useState<boolean>(false);
  const [noteContent, setNoteContent] = useState<string>('');
  const [editedData, setEditedData] = useState<Partial<UserDetailData>>({});
  
  // 모달 관련 상태
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalField, setModalField] = useState<EditableFieldType | null>(null);
  const [modalValue, setModalValue] = useState<string>('');
  const [modalTitle, setModalTitle] = useState<string>('');

  useEffect(() => {
    // 선택된 사용자 ID가 없으면 데이터 초기화
    if (!selectedUserId) {
      console.log('UserDetail: 선택된 사용자 ID가 없음');
      setUserData(null);
      setEditedData({});
      setIsEditingNote(false);
      return;
    }
  
    console.log('UserDetail: 선택된 사용자 ID 변경 감지:', selectedUserId);
  
    // 사용자 상세 정보 가져오기
    const fetchUserDetail = async () => {
      console.log('UserDetail: 사용자 상세 정보 가져오기 시작:', selectedUserId);
      setIsLoading(true);
      setError(null);
      setIsEditingNote(false);
      setEditedData({});
      
      try {
        const apiUrl = `/api/users/details/${selectedUserId}`;
        console.log('UserDetail: API 요청 URL:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: getAuthHeaders()
        });

        if (!response.ok) {
          console.error('UserDetail: API 응답 오류:', response.status);
          throw new Error(`API 요청 실패: ${response.status}`);
        }

        // 응답 텍스트 먼저 확인 (디버깅용)
        const responseText = await response.text();
        console.log('UserDetail: API 응답 원본:', responseText);

        // 응답이 비어있지 않은 경우에만 JSON 파싱 시도
        let result;
        if (responseText.trim()) {
          try {
            result = JSON.parse(responseText);
            console.log('UserDetail: 파싱된 API 응답:', result);
          } catch (e) {
            console.error('UserDetail: JSON 파싱 오류:', e);
            throw new Error('응답 형식이 올바르지 않습니다.');
          }
        } else {
          console.error('UserDetail: 빈 API 응답');
          throw new Error('빈 응답을 받았습니다.');
        }

        if (result.status === 'success' && result.data) {
          console.log('UserDetail: 사용자 데이터 설정:', result.data);
          setUserData(result.data);
          // 노트 내용 초기화
          setNoteContent(result.data.note1 || '');
        } else {
          console.error('UserDetail: API 응답에 데이터가 없음:', result);
          throw new Error(result.message || '사용자 정보를 가져오는데 실패했습니다.');
        }
      } catch (err) {
        console.error('사용자 상세 정보 로드 오류:', err);
        setError((err as Error).message || '사용자 정보를 불러올 수 없습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetail();
  }, [selectedUserId]);

  // 필드 클릭 핸들러 - 모달 열기
  const handleFieldClick = (field: EditableFieldType, value: string, title: string) => {
    setModalField(field);
    setModalValue(value || '');
    setModalTitle(title);
    setIsModalOpen(true);
  };

  // 모달 취소 핸들러
  const handleModalCancel = () => {
    setIsModalOpen(false);
    setModalField(null);
    setModalValue('');
  };

  // 모달 저장 핸들러
  const handleModalSave = async () => {
    if (!modalField || !userData || !selectedUserId) return;
    
    // 변경된 값이 있을 때만 처리
    if (userData[modalField] !== modalValue) {
      // 수정 데이터 준비
      const updatedData = {
        [modalField]: modalValue
      };
      
      setIsSaving(true);
      
      try {
        const apiUrl = `/api/users/details/${selectedUserId}`;
        console.log('UserDetail: 필드 업데이트 요청 URL:', apiUrl);
        console.log('UserDetail: 업데이트할 데이터:', updatedData);
        
        const response = await fetch(apiUrl, {
          method: 'PUT',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatedData)
        });
  
        if (!response.ok) {
          console.error('UserDetail: 업데이트 API 응답 오류:', response.status);
          throw new Error(`API 요청 실패: ${response.status}`);
        }
  
        // 응답 처리
        const responseText = await response.text();
        let result;
        if (responseText.trim()) {
          try {
            result = JSON.parse(responseText);
            console.log('UserDetail: 파싱된 업데이트 API 응답:', result);
          } catch (e) {
            console.error('UserDetail: JSON 파싱 오류:', e);
            throw new Error('응답 형식이 올바르지 않습니다.');
          }
        } else {
          console.error('UserDetail: 빈 API 응답');
          throw new Error('빈 응답을 받았습니다.');
        }
  
        if (result.status === 'success' && result.data) {
          // 성공 시 userData 업데이트
          setUserData(result.data);
          // editedData 초기화 (현재 필드는 이미 API에 저장됨)
          const newEditedData = { ...editedData };
          delete newEditedData[modalField];
          setEditedData(newEditedData);
        } else {
          throw new Error(result.message || '사용자 정보 업데이트에 실패했습니다.');
        }
      } catch (err) {
        console.error('사용자 정보 업데이트 오류:', err);
        alert((err as Error).message || '사용자 정보를 업데이트할 수 없습니다.');
      } finally {
        setIsSaving(false);
      }
    }
    
    setIsModalOpen(false);
    setModalField(null);
  };

// 노트 편집 상태 토글
const toggleNoteEdit = async () => {
  if (isEditingNote) {
    // 편집 완료 - 변경사항이 있을 때만 API 요청
    if (userData && userData.note1 !== noteContent && selectedUserId) {
      setIsSaving(true);
      
      try {
        const apiUrl = `/api/users/details/${selectedUserId}`;
        const updatedData = { note1: noteContent };
        
        console.log('UserDetail: 노트 업데이트 요청 URL:', apiUrl);
        console.log('UserDetail: 업데이트할 노트 데이터:', updatedData);
        
        const response = await fetch(apiUrl, {
          method: 'PUT',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatedData)
        });

        if (!response.ok) {
          console.error('UserDetail: 노트 업데이트 API 응답 오류:', response.status);
          throw new Error(`API 요청 실패: ${response.status}`);
        }

        // 응답 처리
        const responseText = await response.text();
        let result;
        if (responseText.trim()) {
          try {
            result = JSON.parse(responseText);
            console.log('UserDetail: 파싱된 노트 업데이트 API 응답:', result);
          } catch (e) {
            console.error('UserDetail: JSON 파싱 오류:', e);
            throw new Error('응답 형식이 올바르지 않습니다.');
          }
        } else {
          console.error('UserDetail: 빈 API 응답');
          throw new Error('빈 응답을 받았습니다.');
        }

        if (result.status === 'success' && result.data) {
          // 성공 시 userData 업데이트
          setUserData(result.data);
        } else {
          throw new Error(result.message || '노트 업데이트에 실패했습니다.');
        }
      } catch (err) {
        console.error('노트 업데이트 오류:', err);
        alert((err as Error).message || '노트를 업데이트할 수 없습니다.');
        // 에러 발생 시 원래 노트 내용으로 복원
        setNoteContent(userData.note1 || '');
      } finally {
        setIsSaving(false);
      }
    }
  } else {
    // 편집 시작
    setNoteContent(userData?.note1 || '');
  }
  
  setIsEditingNote(!isEditingNote);
};

  // 노트 내용 변경 핸들러
  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNoteContent(e.target.value);
  };

  // 저장 처리
  const handleSaveChanges = async () => {
    if (!userData || !selectedUserId || Object.keys(editedData).length === 0) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      const apiUrl = `/api/users/details/${selectedUserId}`;
      console.log('UserDetail: 업데이트 요청 URL:', apiUrl);
      console.log('UserDetail: 업데이트할 데이터:', editedData);
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editedData)
      });

      if (!response.ok) {
        console.error('UserDetail: 업데이트 API 응답 오류:', response.status);
        throw new Error(`API 요청 실패: ${response.status}`);
      }

      // 응답 텍스트 먼저 확인 (디버깅용)
      const responseText = await response.text();
      console.log('UserDetail: 업데이트 API 응답 원본:', responseText);

      // 응답이 비어있지 않은 경우에만 JSON 파싱 시도
      let result;
      if (responseText.trim()) {
        try {
          result = JSON.parse(responseText);
          console.log('UserDetail: 파싱된 업데이트 API 응답:', result);
        } catch (e) {
          console.error('UserDetail: JSON 파싱 오류:', e);
          throw new Error('응답 형식이 올바르지 않습니다.');
        }
      } else {
        console.error('UserDetail: 빈 API 응답');
        throw new Error('빈 응답을 받았습니다.');
      }

      if (result.status === 'success' && result.data) {
        console.log('UserDetail: 업데이트된 사용자 데이터:', result.data);
        // 성공 메시지 표시
        alert('사용자 정보가 성공적으로 업데이트되었습니다.');
        // 업데이트된 데이터로 상태 갱신
        setUserData(result.data);
        // 노트 내용 업데이트
        setNoteContent(result.data.note1 || '');
        // 편집 상태 초기화
        setEditedData({});
        setIsEditingNote(false);
      } else {
        console.error('UserDetail: API 응답에 데이터가 없음:', result);
        throw new Error(result.message || '사용자 정보 업데이트에 실패했습니다.');
      }
    } catch (err) {
      console.error('사용자 정보 업데이트 오류:', err);
      alert((err as Error).message || '사용자 정보를 업데이트할 수 없습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // 사용자가 선택되지 않은 경우
  if (!selectedUserId) {
    return (
      <div className="user-detail-container">
        <div className="user-detail-no-selection">
          <span>회원을 선택해 주세요</span>
        </div>
      </div>
    );
  }

  // 로딩 중인 경우
  if (isLoading) {
    return (
      <div className="user-detail-container">
        <div className="user-detail-loading">
          <span>로딩 중...</span>
        </div>
      </div>
    );
  }

  // 오류가 발생한 경우
  if (error) {
    return (
      <div className="user-detail-container">
        <div className="user-detail-error">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  // 데이터가 없는 경우
  if (!userData) {
    return (
      <div className="user-detail-container">
        <div className="user-detail-no-data">
          <span>사용자 정보를 찾을 수 없습니다.</span>
        </div>
      </div>
    );
  }

  // 날짜 포맷 변환 함수
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '-';
    return dateString.split(' ')[0]; // 시간 부분 제거
  };

  // 현재 표시 값 가져오기 (편집된 데이터 또는 원본 데이터)
  const getDisplayValue = (field: keyof UserDetailData) => {
    return (field in editedData) ? editedData[field] : userData[field];
  };

  return (
    <div className="user-detail-container">
      {/* 모달 */}
      {isModalOpen && modalField && (
        <div className="edit-modal-overlay">
          <div className="edit-modal">
            <div className="edit-modal-header">
              <h3>{modalTitle} 수정</h3>
              <button className="modal-close-button" onClick={handleModalCancel}>×</button>
            </div>
            <div className="edit-modal-body">
              <input
                type="text"
                value={modalValue}
                onChange={(e) => setModalValue(e.target.value)}
                className="edit-modal-input"
                autoFocus
              />
            </div>
            <div className="edit-modal-footer">
              <button className="modal-cancel-button" onClick={handleModalCancel}>취소</button>
              <button className="modal-save-button" onClick={handleModalSave}>완료</button>
            </div>
          </div>
        </div>
      )}

      <div className="user-detail-header">
        <div className="user-detail-title">회원 상세정보</div>
      </div>
      
      <div className="user-detail-content">
        {/* 회원명 */}
        <div className="user-detail-row">
          <div className="user-detail-label">
            <span>회원명</span>
          </div>
          <div className="user-detail-value">
            <span>{userData.real_name || '-'}</span>
          </div>
          <div className="user-detail-label">
            <span>회원번호</span>
          </div>
          <div className="user-detail-value">
            <span>{userData.id || '-'}</span>
          </div>
        </div>
        
        {/* 유형 (클릭 시 모달) */}
        <div className="user-detail-row">
          <div className="user-detail-label">
            <span>유형</span>
          </div>
          <div 
            className="user-detail-value editable"
            onClick={() => handleFieldClick('nickname', getDisplayValue('nickname') as string || '', '유형')}
          >
            <span>{getDisplayValue('nickname') || '-'}</span>
            <span className="edit-icon">✎</span>
          </div>
          <div className="user-detail-label">
            <span>회사명</span>
          </div>
          <div className="user-detail-value">
            <span>{userData.company_name || '-'}</span>
          </div>
        </div>
        
        {/* 그룹 (클릭 시 모달) */}
        <div className="user-detail-row">
          <div className="user-detail-label">
            <span>그룹</span>
          </div>
          <div 
            className="user-detail-value editable"
            onClick={() => handleFieldClick('member_type', getDisplayValue('member_type') as string || '', '그룹')}
          >
            <span>{getDisplayValue('member_type') || '-'}</span>
            <span className="edit-icon">✎</span>
          </div>
          <div className="user-detail-label">
            <span>단지명</span>
          </div>
          <div className="user-detail-value">
            <span>{userData.complex_name || '-'}</span>
          </div>
        </div>
        
        {/* 전화번호 */}
        <div className="user-detail-row">
          <div className="user-detail-label">
            <span>전화번호</span>
          </div>
          <div className="user-detail-value">
            <span>{userData.phone || '-'}</span>
          </div>
          <div className="user-detail-label">
            <span>수신여부</span>
          </div>
          <div className="user-detail-value">
            <span className={userData.is_received === 'Y' ? 'status-enabled' : 'status-disabled'}>
              {userData.is_received === 'Y' ? '가능' : '불가'}
            </span>
          </div>
        </div>
        
        {/* 은행 정보 */}
        <div className="user-detail-row account-row">
          <div className="user-detail-label">
            <span>{userData.bank_name || '대한은행'}</span>
          </div>
          <div className="user-detail-value">
            <span>{userData.account_number || '-'}</span>
          </div>
        </div>
        
        {/* 이메일 */}
        <div className="user-detail-row account-row">
          <div className="user-detail-label">
            <span>이메일</span>
          </div>
          <div className="user-detail-value">
            <span>{userData.email || '-'}</span>
          </div>
        </div>
        
        {/* 인증일 */}
        <div className="user-detail-row account-row">
          <div className="user-detail-label">
            <span>인증일</span>
          </div>
          <div className="user-detail-value">
            <span>{userData.verified_date ? userData.verified_date : '-'}</span>
          </div>
        </div>
        
        {/* 마지막활동일 */}
        <div className="user-detail-row account-row">
          <div className="user-detail-label">
            <span>마지막활동일</span>
          </div>
          <div className="user-detail-value">
            <span>{userData.last_active_date ? userData.last_active_date : '-'}</span>
          </div>
        </div>
        
        {/* 담당매니저 (클릭 시 모달) */}
        {/* <div className="user-detail-row account-row">
          <div className="user-detail-label">
            <span>담당매니저</span>
          </div>
          <div 
            className="user-detail-value editable"
            onClick={() => handleFieldClick('manager_name', getDisplayValue('manager_name') as string || 'admin', '담당매니저')}
          >
            <span>{getDisplayValue('manager_name') || 'admin'}</span>
            <span className="edit-icon">✎</span>
          </div>
        </div> */}
        {/* 담당매니저 (편집 비활성화) */}
        <div className="user-detail-row account-row">
          <div className="user-detail-label">
            <span>담당매니저</span>
          </div>
          <div className="user-detail-value">
            <span>{getDisplayValue('manager_name') || 'admin'}</span>
          </div>
        </div>
        
        {/* 노트 (직접 편집 가능) */}
        <div className="user-detail-note-header">
          <span>NOTE</span>
          <span 
            className="note-edit-toggle" 
            onClick={toggleNoteEdit}
          >
            {isEditingNote ? '완료' : '수정'}
          </span>
        </div>
        <div className="user-detail-note-content">
          {isEditingNote ? (
            <textarea
              className="note-textarea"
              value={noteContent}
              onChange={handleNoteChange}
              placeholder="회원에 대한 메모, 특이사항, 연락 내역 등을 기록할 수 있습니다."
            />
          ) : (
            <div className="user-detail-note-text">
              {getDisplayValue('note1') || '기록된 노트가 없습니다. 여기에 회원에 대한 메모, 특이사항, 연락 내역 등을 기록할 수 있습니다. 내용이 많은 경우 스크롤하여 확인할 수 있습니다.'}
            </div>
          )}
        </div>
      </div>
      
     {/* 푸터 - 마지막 수정 날짜 표시 */}
      <div className="user-detail-footer">
        <div className="user-detail-last-modified">
          {isSaving ? (
            <span>저장 중...</span>
          ) : (
            <span>{formatDate(userData.last_modified)} 저장</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetail;