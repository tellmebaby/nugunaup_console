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

export default function TagInputWidget() {
  const { user } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const [tags, setTags] = useState<string[]>([]);
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
      
      // API 응답 구조 검사 - API가 {data: {...}, status: 'success'} 형식을 반환하는 것 같습니다
      if (responseData.status === 'success' && responseData.data && Array.isArray(responseData.data.tags)) {
        setTags(responseData.data.tags);
      } else if (user && user.note3 && Array.isArray(user.note3)) {
        // 로그인 시 가져온 사용자 정보의 note3 배열 사용
        console.log('API 응답 대신 사용자 정보의 태그 사용:', user.note3);
        setTags(user.note3);
      } else {
        console.error('태그 목록 형식이 잘못되었습니다:', responseData);
        // 백업: 임시 데이터 사용
        setTags(["회원번호 수정", "인증인", "매물등록", "주택임대", "낙찰자"]);
      }
    } catch (error) {
      console.error('태그 목록 조회 오류:', error);
      
      // API 오류 시 로그인된 사용자 정보의 태그 활용
      if (user && user.note3 && Array.isArray(user.note3)) {
        console.log('API 오류로 인해 사용자 정보의 태그 사용:', user.note3);
        setTags(user.note3);
      } else {
        // 백업: 임시 데이터 사용
        setTags(["회원번호 수정", "인증인", "매물등록", "주택임대", "낙찰자"]);
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

  // 태그 추가 API 호출
  const addTag = async () => {
    if (!user || !user.id || inputValue.trim() === '' || tags.includes(inputValue.trim())) {
      return;
    }

    try {
      setIsAddingTag(true);
      
      const response = await fetch('/api/tag-manager/add', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          manager_id: user.id,
          tag_name: inputValue.trim()
        })
      });

      if (!response.ok) {
        throw new Error('태그 추가에 실패했습니다.');
      }

      const responseData = await response.json();
      
      // API 응답 구조 검사 - API가 {data: {...}, status: 'success'} 형식을 반환하는 것 같습니다
      if (responseData.status === 'success') {
        // API 성공 시 태그 추가
        setTags(prevTags => [...prevTags, inputValue.trim()]);
        setInputValue('');
      } else {
        console.error('태그 추가 실패:', responseData);
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
      
      const response = await fetch('/api/tag-manager/remove', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          manager_id: user.id,
          tag_name: tagToRemove
        })
      });

      if (!response.ok) {
        throw new Error('태그 제거에 실패했습니다.');
      }

      const responseData = await response.json();
      
      // API 응답 구조 검사 - API가 {data: {...}, status: 'success'} 형식을 반환하는 것 같습니다
      if (responseData.status === 'success') {
        // API 성공 시 태그 제거
        setTags(prevTags => prevTags.filter((_, index) => index !== indexToRemove));
      } else {
        console.error('태그 제거 실패:', responseData);
        alert('태그를 제거할 수 없습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('태그 제거 API 오류:', error);
      alert('태그 제거 중 오류가 발생했습니다.');
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
                <div key={index} className="tag-item">
                  <span>{tag}</span>
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