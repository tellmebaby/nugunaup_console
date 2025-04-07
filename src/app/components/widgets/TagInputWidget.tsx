"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/TagInputWidgetStyle.css';
import { getAuthHeaders } from '../../utils/auth';

// 로딩 스피너 컴포넌트
const LoadingSpinner = () => (
  <div className="loading-spinner">
    <div className="spinner"></div>
  </div>
);

// 태그 인터페이스 정의
interface Tag {
  id: number;
  name: string;
}

export default function TagInputWidget() {
  const { user } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [isRemovingTag, setIsRemovingTag] = useState<number | null>(null);
  const tagsContainerRef = useRef<HTMLDivElement>(null);

  // 태그 목록 조회 API 호출
  const fetchTags = async () => {
    if (!user || !user.id) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/tag-manager/list/${user.id}`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('태그 목록 조회에 실패했습니다.');
      }
      
      const responseData = await response.json();
      
      // 새로운 API 응답 구조 처리
      if (responseData.status === 'success' && responseData.data && Array.isArray(responseData.data.tags)) {
        setTags(responseData.data.tags);
      } else if (user && user.note3 && Array.isArray(user.note3)) {
        // 로그인 시 가져온 사용자 정보의 note3 배열 사용 (이전 형식 호환성 유지)
        console.log('API 응답 대신 사용자 정보의 태그 사용:', user.note3);
        // 문자열 배열을 Tag 객체 배열로 변환
        const tagObjects = user.note3.map((tagName: string, index: number) => ({
          id: index + 1000, // 임시 ID 부여
          name: tagName
        }));
        setTags(tagObjects);
      } else {
        console.error('태그 목록 형식이 잘못되었습니다:', responseData);
        // 백업: 임시 데이터 사용
        setTags([
          { id: 1001, name: "회원번호 수정" },
          { id: 1002, name: "인증인" },
          { id: 1003, name: "매물등록" },
          { id: 1004, name: "주택임대" },
          { id: 1005, name: "낙찰자" }
        ]);
      }
    } catch (error) {
      console.error('태그 목록 조회 오류:', error);
      
      // API 오류 시 로그인된 사용자 정보의 태그 활용
      if (user && user.note3 && Array.isArray(user.note3)) {
        console.log('API 오류로 인해 사용자 정보의 태그 사용:', user.note3);
        // 문자열 배열을 Tag 객체 배열로 변환
        const tagObjects = user.note3.map((tagName: string, index: number) => ({
          id: index + 1000, // 임시 ID 부여
          name: tagName
        }));
        setTags(tagObjects);
      } else {
        // 백업: 임시 데이터 사용
        setTags([
          { id: 1001, name: "회원번호 수정" },
          { id: 1002, name: "인증인" },
          { id: 1003, name: "매물등록" },
          { id: 1004, name: "주택임대" },
          { id: 1005, name: "낙찰자" }
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 태그 목록 조회
  useEffect(() => {
    fetchTags();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim() !== '') {
      addTag();
    }
  };

  // 중복 태그 확인
  const isTagDuplicate = (tagName: string): boolean => {
    return tags.some(tag => tag.name.toLowerCase() === tagName.toLowerCase());
  };

  // 태그 추가 API 호출
  const addTag = async () => {
    if (!user || !user.id || inputValue.trim() === '' || isTagDuplicate(inputValue.trim())) {
      // 중복 태그인 경우 알림
      if (inputValue.trim() !== '' && isTagDuplicate(inputValue.trim())) {
        alert('이미 존재하는 태그입니다.');
      }
      return;
    }

    try {
      setIsAddingTag(true);
      const tagName = inputValue.trim();
      
      // 태그 추가 API 호출 (태그 매니저 API만 호출)
      const tagResponse = await fetch('/api/tag-manager/add', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          manager_id: user.id,
          tag_name: tagName
        })
      });

      if (!tagResponse.ok) {
        throw new Error('태그 추가에 실패했습니다.');
      }

      const tagResponseData = await tagResponse.json();
      
      // 태그 API 응답 확인
      if (tagResponseData.status === 'success') {
        // 새로 추가된 태그의 ID 가져오기
        let newTagId = 0;
        
        if (tagResponseData.data && tagResponseData.data.tag_id) {
          newTagId = tagResponseData.data.tag_id;
        } else if (tagResponseData.data && tagResponseData.data.note_id) {
          // note_id가 있다면 이를 태그 ID로 사용
          newTagId = tagResponseData.data.note_id;
        } else {
          // 응답에서 ID를 가져오지 못한 경우 임시 ID 생성
          newTagId = Math.floor(Math.random() * 10000) + 2000;
          console.warn('태그 ID를 응답에서 찾을 수 없어 임시 ID를 생성했습니다:', newTagId);
        }
        
        console.log('태그 추가 성공:', { id: newTagId, name: tagName });
        
        // 태그 추가 성공 시 상태 업데이트
        setTags(prevTags => [...prevTags, { id: newTagId, name: tagName }]);
        setInputValue('');
      } else {
        console.error('태그 추가 실패:', tagResponseData);
        alert('태그를 추가할 수 없습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('태그 추가 API 오류:', error);
      alert('태그 추가 중 오류가 발생했습니다.');
    } finally {
      setIsAddingTag(false);
    }
  };

  // 태그 제거 API 호출
  const removeTag = async (indexToRemove: number) => {
    if (!user || !user.id) return;
    
    const tagToRemove = tags[indexToRemove];
    
    try {
      setIsRemovingTag(indexToRemove);
      
      // 요청 데이터 준비
      const requestData = {
        manager_id: user.id,
        tag_name: tagToRemove.name
      };
      
      console.log('태그 제거 요청 데이터:', requestData);
      
      // 태그 제거 API 호출
      const response = await fetch('/api/tag-manager/remove', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(requestData)
      });

      console.log('태그 제거 응답 상태:', response.status, response.statusText);
      
      // 실패한 경우에도 응답 텍스트 확인
      const responseText = await response.text();
      console.log('태그 제거 응답 텍스트:', responseText);
      
      if (!response.ok) {
        throw new Error(`태그 제거에 실패했습니다. 상태 코드: ${response.status}`);
      }

      // 텍스트를 JSON으로 변환
      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log('태그 제거 응답 데이터:', responseData);
      } catch (parseError) {
        console.error('응답 JSON 파싱 오류:', parseError);
        throw new Error('서버 응답을 처리할 수 없습니다.');
      }
      
      // API 응답 구조 검사
      if (responseData.status === 'success') {
        // API 성공 시 태그 제거
        setTags(prevTags => prevTags.filter((_, index) => index !== indexToRemove));
        
        // 사용자 정보의 note3도 업데이트 (로컬 스토리지에서)
        if (user) {
          try {
            const userData = localStorage.getItem('user');
            if (userData) {
              const parsedUser = JSON.parse(userData);
              if (parsedUser.note3 && Array.isArray(parsedUser.note3)) {
                // 제거된 태그 반영
                parsedUser.note3 = parsedUser.note3.filter((tag: string) => tag !== tagToRemove.name);
                localStorage.setItem('user', JSON.stringify(parsedUser));
              }
            }
          } catch (storageError) {
            console.error('로컬 스토리지 업데이트 오류:', storageError);
          }
        }
      } else {
        console.error('태그 제거 실패:', responseData);
        alert('태그를 제거할 수 없습니다. 다시 시도해주세요.');
      }
    } catch (error: any) {
      console.error('태그 제거 API 오류:', error);
      const errorMessage = error.message || '알 수 없는 오류가 발생했습니다';
      alert('태그 제거 중 오류가 발생했습니다: ' + errorMessage);
    } finally {
      setIsRemovingTag(null);
    }
  };

  return (
    <div className="h-full w-full">      
      <div className="tag-container">
        {/* 입력 섹션 */}
        <div className="tag-input-section">
          <div className="tag-input-field">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="태그 이름"
              className="tag-input"
              disabled={isAddingTag}
            />
          </div>
          <button 
            className={`tag-add-button ${isAddingTag ? 'loading' : ''}`} 
            onClick={addTag}
            disabled={isAddingTag || inputValue.trim() === ''}
          >
            {isAddingTag ? (
              <LoadingSpinner />
            ) : (
              <>
                <div className="tag-add-button-circle"></div>
                <span className="tag-add-button-text">+</span>
              </>
            )}
          </button>
        </div>

        {/* 태그 목록 섹션 */}
        <div 
          className="tags-list-container"
          ref={tagsContainerRef}
        >
          {isLoading ? (
            <div className="tags-loading">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="tags-list">
              {tags.map((tag, index) => (
                <div key={tag.id} className="tag-item">
                  <span>{tag.name}</span>
                  <button 
                    className="tag-remove-button"
                    onClick={() => removeTag(index)}
                    disabled={isRemovingTag === index}
                  >
                    {isRemovingTag === index ? (
                      <span className="tag-loading-dot">•</span>
                    ) : "×"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}