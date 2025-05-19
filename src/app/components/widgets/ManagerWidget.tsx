import React, { useState, useEffect } from 'react';
import '../../styles/ManagerWidgetStyle.css';
import { getAuthHeaders } from '../../utils/auth';

// 매니저 데이터 인터페이스
interface Manager {
  id: number;
  nsa_id: string;
  name: string;
  position: string;
}

// 등록되지 않은 회원 인터페이스
interface UnregisteredMember {
  id: number;
  nsa_id: string;
}

export default function ManagerWidget() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [unregisteredMembers, setUnregisteredMembers] = useState<UnregisteredMember[]>([]);
  
  // 새 매니저 등록을 위한 상태
  const [newManager, setNewManager] = useState({
    nsa_id: '',
    name: '',
    position: 'admin',
    password: '1234' // 기본 비밀번호
  });

  // 매니저 목록 불러오기
  const fetchManagers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/manager', {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'success' && Array.isArray(data.data)) {
        setManagers(data.data);
      } else {
        throw new Error('매니저 목록을 가져오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('매니저 목록 로드 오류:', err);
      setError((err as Error).message || '매니저 정보를 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 등록되지 않은 회원 목록 불러오기
  const fetchUnregisteredMembers = async () => {
    try {
      const response = await fetch('/api/unregistered-admin-members', {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'success' && Array.isArray(data.data)) {
        setUnregisteredMembers(data.data);
      } else {
        throw new Error('등록되지 않은 회원 목록을 가져오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('등록되지 않은 회원 목록 로드 오류:', err);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchManagers();
  }, []);

  // 매니저 추가 모드 활성화
  const handleAddManager = async () => {
    setIsAdding(true);
    await fetchUnregisteredMembers();
  };

  // 매니저 삭제
  const handleDeleteManager = async (id: number) => {
    if (!window.confirm('이 매니저를 삭제하시겠습니까?')) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/manager/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`삭제 요청 실패: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'success') {
        // 매니저 목록에서 삭제된 매니저 제거
        setManagers(managers.filter(manager => manager.id !== id));
      } else {
        throw new Error(data.message || '매니저 삭제에 실패했습니다.');
      }
    } catch (err) {
      console.error('매니저 삭제 오류:', err);
      alert((err as Error).message || '매니저 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 입력 변경 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewManager({ ...newManager, [name]: value });
  };

  // 매니저 추가 제출
  const handleSubmitNewManager = async () => {
    if (!newManager.nsa_id || !newManager.name || !newManager.position) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/manager', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newManager)
      });

      if (!response.ok) {
        throw new Error(`등록 요청 실패: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'success') {
        // 매니저 목록 새로고침
        await fetchManagers();
        
        // 입력 필드 초기화
        setNewManager({
          nsa_id: '',
          name: '',
          position: 'admin',
          password: '1234'
        });
        
        // 추가 모드 종료
        setIsAdding(false);
      } else {
        throw new Error(data.message || '매니저 등록에 실패했습니다.');
      }
    } catch (err) {
      console.error('매니저 등록 오류:', err);
      alert((err as Error).message || '매니저 등록 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 매니저 유형 변경
  const handleUpdatePosition = async (id: number, newPosition: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/manager/${id}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ position: newPosition })
      });

      if (!response.ok) {
        throw new Error(`업데이트 요청 실패: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'success') {
        // 매니저 목록 업데이트
        setManagers(managers.map(manager => 
          manager.id === id ? { ...manager, position: newPosition } : manager
        ));
      } else {
        throw new Error(data.message || '매니저 유형 변경에 실패했습니다.');
      }
    } catch (err) {
      console.error('매니저 유형 변경 오류:', err);
      alert((err as Error).message || '매니저 유형 변경 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 로딩 중일 때
  if (isLoading && !managers.length) {
    return (
      <div className="manager-widget-container">
        <div className="manager-widget-title">
          <div className="manager-widget-title-text">
            <span>매니저 관리</span>
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
      <div className="manager-widget-container">
        <div className="manager-widget-title">
          <div className="manager-widget-title-text">
            <span>매니저 관리</span>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100% - 30px)' }}>
          <span style={{ fontSize: '12px', color: '#FF0000' }}>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="manager-widget-container">
      <div className="manager-widget-title">
        <div className="manager-widget-title-text">
          <span>매니저 관리</span>
        </div>
      </div>
      
      <div className="manager-widget-body">
        {/* 헤더 행 */}
        <div className="manager-widget-header">
          <div className="manager-widget-header-cell manager-no">번호</div>
          <div className="manager-widget-header-cell manager-id">아이디</div>
          <div className="manager-widget-header-cell manager-name">이름</div>
          <div className="manager-widget-header-cell manager-position">유형</div>
          <div className="manager-widget-header-cell manager-delete">삭제</div>
        </div>
        
        {/* 매니저 목록 */}
        <div className="manager-widget-list-container">
          {managers.map((manager, index) => (
            <div key={manager.id} className={index % 2 === 0 ? "manager-widget-row even" : "manager-widget-row odd"}>
              <div className="manager-widget-cell manager-no">{index + 1}</div>
              <div className="manager-widget-cell manager-id">{manager.nsa_id}</div>
              <div className="manager-widget-cell manager-name">{manager.name}</div>
              <div className="manager-widget-cell manager-position">
                <select 
                  value={manager.position}
                  onChange={(e) => handleUpdatePosition(manager.id, e.target.value)}
                  className="manager-position-select"
                >
                  <option value="admin">admin</option>
                  <option value="manager">manager</option>
                  <option value="marketing">marketing</option>
                  <option value="sales">sales</option>
                </select>
              </div>
              <div 
                className="manager-widget-cell manager-delete"
                onClick={() => handleDeleteManager(manager.id)}
              >
                X
              </div>
            </div>
          ))}
          
          {/* 새 매니저 추가 행 */}
          {isAdding && (
            <div className="manager-widget-row new-manager">
              <div className="manager-widget-cell manager-no">New</div>
              <div className="manager-widget-cell manager-id">
                <select 
                  name="nsa_id"
                  value={newManager.nsa_id}
                  onChange={handleInputChange}
                  className="manager-select"
                >
                  <option value="">선택하세요</option>
                  {unregisteredMembers.map(member => (
                    <option key={member.id} value={member.nsa_id}>{member.nsa_id}</option>
                  ))}
                </select>
              </div>
              <div className="manager-widget-cell manager-name">
                <input 
                  type="text"
                  name="name"
                  value={newManager.name}
                  onChange={handleInputChange}
                  placeholder="이름"
                  className="manager-input"
                />
              </div>
              <div className="manager-widget-cell manager-position">
                <select 
                  name="position"
                  value={newManager.position}
                  onChange={handleInputChange}
                  className="manager-position-select"
                >
                  <option value="admin">admin</option>
                  <option value="manager">manager</option>
                  <option value="marketing">marketing</option>
                  <option value="sales">sales</option>
                </select>
              </div>
              <div 
                className="manager-widget-cell manager-delete"
                onClick={() => setIsAdding(false)}
              >
                취소
              </div>
            </div>
          )}
        </div>
        
        {/* 버튼 영역 */}
        {isAdding ? (
          <div 
            className="manager-widget-add-button"
            onClick={handleSubmitNewManager}
          >
            <span>매니저 등록하기</span>
          </div>
        ) : (
          <div 
            className="manager-widget-add-button"
            onClick={handleAddManager}
          >
            <span>매니저 등록하기</span>
          </div>
        )}
      </div>
    </div>
  );
}