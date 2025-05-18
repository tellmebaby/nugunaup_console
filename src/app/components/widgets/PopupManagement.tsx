import React, { useState, useEffect, useRef } from "react";
import { getAuthHeaders } from '../../utils/auth';
import '../../styles/PopupManagementStyle.css';

interface PopupImageData {
  content1: string;
  content2: string | null;
  content3: string | null;
  created_at: string;
  description: string;
  note: string;
  setting_id: string;
  setting_type: string;
  status: string; // "ACTIVE" 또는 다른 상태 값을 가질 수 있음
  updated_at: string;
}

interface ApiResponse {
  data: PopupImageData;
  status: string;
}

interface UploadResponse {
  data: {
    blob_name: string;
    file_url: string;
    original_filename: string;
  };
  message: string;
  status: string;
}

export default function PopupManagement() {
  const [popupData, setPopupData] = useState<PopupImageData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [excludedUsers, setExcludedUsers] = useState<string[]>([]);
  const [isEditingUsers, setIsEditingUsers] = useState<boolean>(false);
  const [excludedUsersText, setExcludedUsersText] = useState<string>('');
  const [originalUserText, setOriginalUserText] = useState<string>(''); // 원본 텍스트 저장용
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 팝업 이미지 데이터 불러오기
  const fetchPopupData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/settings/get/popup_image', {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      if (data.status === 'success' && data.data) {
        console.log('팝업 데이터:', data.data); // 데이터 확인용 로그
        setPopupData(data.data);
        
        // note 파싱 (취소 회원 리스트)
        if (data.data.note) {
          try {
            const parsedNote = JSON.parse(data.data.note);
            if (Array.isArray(parsedNote)) {
              const formattedText = parsedNote.join(', ');
              setExcludedUsers(parsedNote);
              setExcludedUsersText(formattedText);
              setOriginalUserText(formattedText); // 원본 저장
            }
          } catch (e) {
            console.error('노트 데이터 파싱 오류:', e);
            setExcludedUsers([]);
            setExcludedUsersText('');
            setOriginalUserText('');
          }
        } else {
          // note가 없을 경우 초기화
          setExcludedUsers([]);
          setExcludedUsersText('');
          setOriginalUserText('');
        }
      } else {
        throw new Error('팝업 이미지 데이터를 가져오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('팝업 이미지 데이터 로드 오류:', err);
      setError((err as Error).message || '팝업 이미지 정보를 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchPopupData();
  }, []);

  // 파일명 추출 함수
  const extractFileName = (url: string | null): string => {
    if (!url) return '-';
    
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      return pathParts[pathParts.length - 1] || url;
    } catch (e) {
      // URL 파싱 실패 시 원본 URL 반환
      return url;
    }
  };

  // 이미지 업로드 핸들러
  const handleUpload = () => {
    // 파일 입력 요소를 클릭하여 파일 선택 대화상자 열기
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 파일 선택 시 처리
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // 이미지 파일만 허용
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      return;
    }
    
    try {
      setIsUploading(true);
      setError(null);
      
      // FormData 생성
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'api-test-uploader');
      
      console.log('업로드 요청 시작:', {
        파일명: file.name,
        파일크기: file.size,
        파일타입: file.type,
        폴더: 'api-test-uploader'
      });
      
      // 이미지 업로드 API 요청 - 인증 헤더 사용
      const authHeader = getAuthHeaders();
      
      // 이미지 업로드 API 요청
      const uploadResponse = await fetch('/api/gcs/upload', {
        method: 'POST',
        // 중요! Content-Type 헤더를 명시적으로 제외하고 오직 인증 헤더만 사용
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      });
      // 응답 텍스트 먼저 가져오기 (디버깅용)
      const responseText = await uploadResponse.text();
      console.log('업로드 응답 원본:', responseText);
      
      if (!uploadResponse.ok) {
        throw new Error(`업로드 요청 실패: ${uploadResponse.status}, 상세: ${responseText}`);
      }
      
      // 텍스트로 이미 읽었으므로 JSON으로 파싱
      let uploadResult: UploadResponse;
      try {
        uploadResult = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`응답 파싱 오류: ${e instanceof Error ? e.message : String(e)}`);
      }
      
      if (uploadResult.status === 'success' && uploadResult.data && uploadResult.data.file_url) {
        console.log('업로드 성공:', uploadResult.data.file_url);
        // 업로드 성공 시 팝업 이미지 링크 업데이트
        await updatePopupImage(uploadResult.data.file_url);
      } else {
        throw new Error(uploadResult.message || '이미지 업로드에 실패했습니다.');
      }
    } catch (err) {
      console.error('이미지 업로드 오류:', err);
      setError((err as Error).message || '이미지 업로드 중 오류가 발생했습니다.');
      alert(`업로드 오류: ${(err as Error).message}`);
    } finally {
      setIsUploading(false);
      // 파일 입력 초기화 (같은 파일 재선택 가능하도록)
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 팝업 이미지 URL 업데이트
  const updatePopupImage = async (imageUrl: string) => {
    try {
      const updateResponse = await fetch('/api/settings/update', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          setting_id: "popup_image",
          content1: imageUrl
        })
      });
      
      if (!updateResponse.ok) {
        throw new Error(`설정 업데이트 요청 실패: ${updateResponse.status}`);
      }
      
      const updateResult = await updateResponse.json();
      
      if (updateResult.status === 'success') {
        // 성공 메시지 표시
        alert('팝업 이미지가 성공적으로 업데이트되었습니다.');
        // 데이터 다시 로드
        await fetchPopupData();
      } else {
        throw new Error(updateResult.message || '팝업 이미지 업데이트에 실패했습니다.');
      }
    } catch (err) {
      console.error('팝업 이미지 업데이트 오류:', err);
      setError((err as Error).message || '팝업 이미지 업데이트 중 오류가 발생했습니다.');
    }
  };

  // 열람 취소 회원 목록 클릭 이벤트
  const handleExcludedUsersClick = () => {
    if (!isEditingUsers) {
      setIsEditingUsers(true);
      // 편집 시작할 때 원본 텍스트 저장
      setOriginalUserText(excludedUsersText);
    }
  };

  // 열람 취소 회원 목록 변경 이벤트
  const handleExcludedUsersChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setExcludedUsersText(e.target.value);
  };

  // 저장 핸들러
  const handleSave = async () => {
    if (!popupData) return;
    
    // 변경 사항이 없는 경우 편집 모드만 종료하고 API 호출 생략
    if (excludedUsersText === originalUserText) {
      setIsEditingUsers(false);
      return;
    }
    
    try {
      setIsSaving(true);
      setError(null);
      
      // 텍스트에서 회원 ID 추출 (쉼표 또는 공백으로 구분된 값)
      const userIds = excludedUsersText
        .split(/[,\s]+/) // 쉼표 또는 공백으로 구분
        .map(id => id.trim())
        .filter(id => id.length > 0); // 빈 문자열 제거
      
      // API 요청
      const updateResponse = await fetch('/api/settings/update', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          setting_id: "popup_image",
          note: JSON.stringify(userIds)
        })
      });
      
      if (!updateResponse.ok) {
        throw new Error(`설정 업데이트 요청 실패: ${updateResponse.status}`);
      }
      
      const updateResult = await updateResponse.json();
      
      if (updateResult.status === 'success') {
        // 성공 메시지 표시
        alert('열람 취소 회원 목록이 성공적으로 업데이트되었습니다.');
        // 원본 텍스트 업데이트
        setOriginalUserText(excludedUsersText);
        // 편집 모드 종료
        setIsEditingUsers(false);
        // 데이터 다시 로드
        await fetchPopupData();
      } else {
        throw new Error(updateResult.message || '열람 취소 회원 목록 업데이트에 실패했습니다.');
      }
    } catch (err) {
      console.error('열람 취소 회원 목록 업데이트 오류:', err);
      setError((err as Error).message || '열람 취소 회원 목록 업데이트 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // 취소 핸들러 - 추가
  const handleCancel = () => {
    // 편집 모드 종료하고 원본 텍스트로 복원
    setExcludedUsersText(originalUserText);
    setIsEditingUsers(false);
  };

  // 로딩 중일 때
  if (isLoading) {
    return (
      <div className="popup-management-container">
        <div className="popup-management-title">
          <div className="popup-management-title-text">
            <span>팝업 관리</span>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100% - 30px)' }}>
          <span style={{ fontSize: '12px', color: '#666' }}>로딩 중...</span>
        </div>
      </div>
    );
  }

  // 에러 발생시
  if (error) {
    return (
      <div className="popup-management-container">
        <div className="popup-management-title">
          <div className="popup-management-title-text">
            <span>팝업 관리</span>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100% - 30px)' }}>
          <span style={{ fontSize: '12px', color: '#FF0000' }}>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="popup-management-container">
      {/* 숨겨진 파일 업로드 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      
      <div className="popup-management-title">
        <div className="popup-management-title-text">
          <span>팝업 관리</span>
        </div>
      </div>

      {/* Row 1: File Name and Upload */}
      <div className="popup-management-row file-path-row">
        <div className="popup-management-cell-label">
          <span>파일명</span>
        </div>
        <div className="popup-management-cell-content" style={{ cursor: 'pointer' }}>
          <a 
            href={popupData?.content1 || '#'} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ textDecoration: 'none', color: '#0066CC' }}
          >
            <span>{popupData ? extractFileName(popupData.content1) : '-'}</span>
          </a>
        </div>
        <div 
          className="popup-management-cell-action"
          onClick={handleUpload}
          style={{ cursor: 'pointer' }}
        >
          <span>{isUploading ? '처리중...' : '업로드'}</span>
        </div>
      </div>

      {/* Row 2: Popup Status */}
      <div className="popup-management-row mod-date-row">
        <div className="popup-management-cell-label">
          <span>팝업상태</span>
        </div>
        <div className="popup-management-cell-content-full">
          <span className={popupData && popupData.status === "ACTIVE" ? "status-active" : ""}>
            {popupData ? (popupData.status === "ACTIVE" ? "실행중" : popupData.status) : '-'}
          </span>
        </div>
      </div>

      {/* Row 3: Member Cancellation */}
      <div className="popup-management-row member-cancel-row">
        <div className="popup-management-cell-label-full">
          <span>열람 취소 회원</span>
        </div>
      </div>

      {/* Multi-line content area */}
      <div 
        className="popup-management-multi-content"
        onClick={!isEditingUsers ? handleExcludedUsersClick : undefined}
        style={{ cursor: isEditingUsers ? 'default' : 'pointer' }}
      >
        {isEditingUsers ? (
          <textarea
            className="popup-management-textarea"
            style={{
              width: '100%',
              height: '100%',
              padding: '10px',
              border: 'none',
              resize: 'none',
              fontFamily: '42dot Sans, sans-serif',
              fontSize: '11px',
              lineHeight: '1.3'
            }}
            value={excludedUsersText}
            onChange={handleExcludedUsersChange}
            autoFocus
          />
        ) : (
          <div 
            className="popup-management-multi-content-inner"
          >
            <span>{excludedUsers.length > 0 ? excludedUsers.join(', ') : '-'}</span>
          </div>
        )}
      </div>

      <div className="popup-management-row-save">
        {isEditingUsers ? (
          // 편집 모드일 때 취소 및 저장 버튼
          <>
            <div 
              className="popup-management-cell-cancel"
              onClick={handleCancel}
              style={{ 
                cursor: 'pointer',
                backgroundColor: '#f1f1f1',
                width: '80px',
                height: '25px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: '3px'
              }}
            >
              <span style={{ fontSize: '11px', color: '#333' }}>취소</span>
            </div>
            <div 
              className="popup-management-cell-save"
              onClick={handleSave}
              style={{ 
                cursor: isSaving ? 'not-allowed' : 'pointer',
                opacity: isSaving ? 0.7 : 1,
                width: '80px',
                height: '25px'
              }}
            >
              <span>{isSaving ? '저장중...' : '저장하기'}</span>
            </div>
          </>
        ) : (
          // 비편집 모드일 때 정보와 저장 버튼
          <>
            <div className="popup-management-cell-info">
              <span>{popupData ? popupData.updated_at : '-'} 저장</span>
            </div>
            <div 
              className="popup-management-cell-save"
              onClick={() => setIsEditingUsers(true)} // 비편집 모드에서 버튼 클릭 시 편집 모드로 전환
              style={{ 
                cursor: 'pointer',
                width: '80px',
                height: '25px'
              }}
            >
              <span>수정하기</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}