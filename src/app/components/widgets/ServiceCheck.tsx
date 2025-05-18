import React, { useState, useEffect, useRef } from "react";
import { getAuthHeaders } from '../../utils/auth';
import '../../styles/ServiceCheckStyle.css';

interface MaintenanceData {
  content1: string; // 이미지 URL
  content2: string | null; // 점검 시작 시간
  content3: string | null; // 점검 종료 시간
  created_at: string;
  description: string;
  note: string;
  setting_id: string;
  setting_type: string;
  status: string; // "ACTIVE" 또는 다른 상태 값
  updated_at: string;
}

interface ApiResponse {
  data: MaintenanceData;
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

export default function ServiceCheck() {
  const [maintenanceData, setMaintenanceData] = useState<MaintenanceData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({
    startDate: false,
    endDate: false
  });
  const [error, setError] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({
    startDate: '',
    endDate: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 유지보수 모드 데이터 불러오기
  const fetchMaintenanceData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/settings/get/maintenance_mode', {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      if (data.status === 'success' && data.data) {
        console.log('유지보수 데이터:', data.data); // 데이터 확인용 로그
        setMaintenanceData(data.data);
        
        // 편집 값 초기화
        setEditValues({
          startDate: formatDateForInput(data.data.content2),
          endDate: formatDateForInput(data.data.content3)
        });
      } else {
        throw new Error('유지보수 모드 데이터를 가져오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('유지보수 데이터 로드 오류:', err);
      setError((err as Error).message || '유지보수 정보를 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchMaintenanceData();
  }, []);

  // 서버 날짜 형식을 입력 필드용 형식으로 변환
  const formatDateForInput = (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    
    try {
      // 서버 형식: "2025-05-13 13:55:00.00" -> 입력용 형식: "2025-05-13T13:55"
      const parts = dateString.split(' ');
      if (parts.length !== 2) return '';
      
      const datePart = parts[0]; // "2025-05-13"
      
      // 시간 부분에서 초와 밀리초 제거
      let timePart = parts[1]; // "13:55:00.00"
      timePart = timePart.split(':').slice(0, 2).join(':'); // "13:55"
      
      return `${datePart}T${timePart}`;
    } catch (e) {
      console.error('입력용 날짜 형식 변환 오류:', e);
      return '';
    }
  };

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
      formData.append('folder', 'maintenance-images');
      
      console.log('업로드 요청 시작:', {
        파일명: file.name,
        파일크기: file.size,
        파일타입: file.type,
        폴더: 'maintenance-images'
      });
      
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
        // 업로드 성공 시 유지보수 이미지 링크 업데이트
        await updateMaintenanceField('content1', uploadResult.data.file_url);
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

  // 유지보수 설정 필드 업데이트
  const updateMaintenanceField = async (field: string, value: string) => {
    if (!maintenanceData) return;
    
    try {
      const updateResponse = await fetch('/api/settings/update', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          setting_id: "maintenance_mode",
          [field]: value
        })
      });
      
      if (!updateResponse.ok) {
        throw new Error(`설정 업데이트 요청 실패: ${updateResponse.status}`);
      }
      
      const updateResult = await updateResponse.json();
      
      if (updateResult.status === 'success') {
        // 성공 메시지 표시
        alert('서비스 점검 설정이 성공적으로 업데이트되었습니다.');
        // 데이터 다시 로드
        await fetchMaintenanceData();
      } else {
        throw new Error(updateResult.message || '서비스 점검 설정 업데이트에 실패했습니다.');
      }
    } catch (err) {
      console.error('서비스 점검 설정 업데이트 오류:', err);
      setError((err as Error).message || '서비스 점검 설정 업데이트 중 오류가 발생했습니다.');
      alert(`업데이트 오류: ${(err as Error).message}`);
    } finally {
      // 편집 모드 종료
      setIsUpdating({
        ...isUpdating,
        [field === 'content2' ? 'startDate' : field === 'content3' ? 'endDate' : '']: false
      });
    }
  };

  // 날짜 필드 클릭 핸들러
  const handleDateFieldClick = (field: 'startDate' | 'endDate') => {
    setIsUpdating({
      ...isUpdating,
      [field]: true
    });
  };

  // 날짜 필드 변경 핸들러
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'startDate' | 'endDate') => {
    setEditValues({
      ...editValues,
      [field]: e.target.value
    });
  };

  // 날짜 저장 핸들러
  const handleDateSave = (field: 'startDate' | 'endDate') => {
    const apiField = field === 'startDate' ? 'content2' : 'content3';
    
    // 날짜 형식 변환 (yyyy-MM-ddThh:mm -> yyyy-MM-dd hh:mm:ss.00)
    let formattedDate = '';
    
    if (editValues[field]) {
      try {
        // 입력 값에서 날짜 객체 생성
        const date = new Date(editValues[field]);
        
        // 년, 월, 일 추출
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        // 시, 분 추출
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        // 서버가 기대하는 형식으로 변환
        formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:00.00`;
        
        console.log('변환된 날짜 형식:', formattedDate);
      } catch (e) {
        console.error('날짜 변환 오류:', e);
        // 변환 실패 시 원본 값 사용
        formattedDate = editValues[field];
      }
    }
    
    updateMaintenanceField(apiField, formattedDate);
  };

  // 날짜 편집 취소 핸들러
  const handleDateCancel = (field: 'startDate' | 'endDate') => {
    setEditValues({
      ...editValues,
      [field]: field === 'startDate' 
        ? formatDateForInput(maintenanceData?.content2)
        : formatDateForInput(maintenanceData?.content3)
    });
    setIsUpdating({
      ...isUpdating,
      [field]: false
    });
  };

  // 이미지 클릭 핸들러 - 새 창에서 이미지 열기
  const handleImageClick = () => {
    if (maintenanceData?.content1) {
      window.open(maintenanceData.content1, '_blank');
    }
  };

  // 현재 서비스 상태 확인
  const getServiceStatus = (): { text: string; isActive: boolean } => {
    if (!maintenanceData) {
      return { text: '정보 없음', isActive: false };
    }

    // 현재 시간
    const now = new Date();
    
    // 점검 시작 및 종료 시간 파싱
    let startDate = null;
    let endDate = null;
    
    try {
      if (maintenanceData.content2) {
        startDate = new Date(maintenanceData.content2);
      }
      
      if (maintenanceData.content3) {
        endDate = new Date(maintenanceData.content3);
      }
    } catch (e) {
      console.error('날짜 파싱 오류:', e);
    }

    // ACTIVE 상태이고 현재 시간이 점검 시간 내에 있는 경우 점검 중
    const isInMaintenanceWindow = startDate && endDate && 
                                 now >= startDate && now <= endDate;
    
    const isActive = maintenanceData.status === 'ACTIVE';
    
    if (isActive && isInMaintenanceWindow) {
      return { text: '점검중', isActive: false };
    } else if (isActive) {
      return { text: '점검예정', isActive: false };
    } else {
      return { text: '서비스중', isActive: true };
    }
  };

  // 로딩 중일 때
  if (isLoading) {
    return (
      <div className="service-check-container">
        <div className="service-check-title">
          <div className="service-check-title-text">
            <span>서비스점검 설정</span>
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
      <div className="service-check-container">
        <div className="service-check-title">
          <div className="service-check-title-text">
            <span>서비스점검 설정</span>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100% - 30px)' }}>
          <span style={{ fontSize: '12px', color: '#FF0000' }}>{error}</span>
        </div>
      </div>
    );
  }

  // 현재 상태 정보
  const serviceStatus = getServiceStatus();

  return (
    <div className="service-check-container">
      {/* 숨겨진 파일 업로드 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      
      <div className="service-check-title">
        <div className="service-check-title-text">
          <span>서비스점검 설정</span>
        </div>
      </div>

      {/* Row 1: File Name */}
      <div className="service-check-row">
        <div className="service-check-cell-label">
          <span>파일명</span>
        </div>
        <div 
          className="service-check-cell-content"
          onClick={handleImageClick}
          style={{ cursor: maintenanceData?.content1 ? 'pointer' : 'default' }}
        >
          <span style={{ color: maintenanceData?.content1 ? '#0066CC' : 'inherit' }}>
            {maintenanceData ? extractFileName(maintenanceData.content1) : '-'}
          </span>
        </div>
        <div 
          className="service-check-cell-action"
          onClick={handleUpload}
          style={{ cursor: 'pointer' }}
        >
          <span>{isUploading ? '처리중...' : '업로드'}</span>
        </div>
      </div>

      {/* Row 2: Modification Date */}
      <div className="service-check-row">
        <div className="service-check-cell-label">
          <span>수정일</span>
        </div>
        <div className="service-check-cell-content-full">
          <span>{maintenanceData ? maintenanceData.updated_at : '-'}</span>
        </div>
      </div>

      {/* Row 3: Maintenance Start */}
      <div className="service-check-row">
        <div className="service-check-cell-label">
          <span>점검 시작</span>
        </div>
        <div className="service-check-cell-content-full">
          {isUpdating.startDate ? (
            <div className="service-check-edit-container">
              <input
                type="datetime-local"
                value={editValues.startDate}
                onChange={(e) => handleDateChange(e, 'startDate')}
                className="service-check-date-input"
              />
              <div className="service-check-button-group">
                <button 
                  className="service-check-save-button"
                  onClick={() => handleDateSave('startDate')}
                >
                  확인
                </button>
                <button 
                  className="service-check-cancel-button"
                  onClick={() => handleDateCancel('startDate')}
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <span 
              onClick={() => handleDateFieldClick('startDate')}
              style={{ cursor: 'pointer' }}
            >
              {maintenanceData?.content2 || '-'}
            </span>
          )}
        </div>
      </div>

      {/* Row 4: Maintenance End */}
      <div className="service-check-row">
        <div className="service-check-cell-label">
          <span>점검 종료</span>
        </div>
        <div className="service-check-cell-content-full">
          {isUpdating.endDate ? (
            <div className="service-check-edit-container">
              <input
                type="datetime-local"
                value={editValues.endDate}
                onChange={(e) => handleDateChange(e, 'endDate')}
                className="service-check-date-input"
              />
              <div className="service-check-button-group">
                <button 
                  className="service-check-save-button"
                  onClick={() => handleDateSave('endDate')}
                >
                  확인
                </button>
                <button 
                  className="service-check-cancel-button"
                  onClick={() => handleDateCancel('endDate')}
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <span 
              onClick={() => handleDateFieldClick('endDate')}
              style={{ cursor: 'pointer' }}
            >
              {maintenanceData?.content3 || '-'}
            </span>
          )}
        </div>
      </div>

      {/* Row 5: Current Status */}
      <div className="service-check-row">
        <div className="service-check-cell-label">
          <span>현재 상태</span>
        </div>
        <div className="service-check-cell-content-full">
          <div className={serviceStatus.isActive ? "status-active" : "status-inactive"}>
            {serviceStatus.text}
          </div>
        </div>
      </div>
    </div>
  );
}