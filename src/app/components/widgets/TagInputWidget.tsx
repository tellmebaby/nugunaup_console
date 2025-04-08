"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNote } from '../../context/NoteContext';
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
  id: number;       // 실제 manager_notes의 id를 저장
  name: string;     // 실제 manager_notes의 content를 저장
  status?: string;  // 노트 상태 (대기, 진행, 완료, 삭제)
}

export default function TagInputWidget() {
  const { user } = useAuth();
  const { selectedNoteId, selectedTagName, setSelectedNote } = useNote(); // NoteContext 사용
  const [inputValue, setInputValue] = useState('');
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [isRemovingTag, setIsRemovingTag] = useState<number | null>(null);
  const [selectedTagIndex, setSelectedTagIndex] = useState<number | null>(null);
  const tagsContainerRef = useRef<HTMLDivElement>(null);

  // 응답 데이터에서 안전하게 노트 배열 추출
  const extractNotesFromResponse = (responseData: any): any[] => {
    if (!responseData || responseData.status !== 'success') {
      return [];
    }
    
    // Case 1: data.notes 형태 (API 문서 기준 예상 구조)
    if (responseData.data && Array.isArray(responseData.data.notes)) {
      return responseData.data.notes;
    }
    
    // Case 2: data 자체가 배열인 경우
    if (Array.isArray(responseData.data)) {
      return responseData.data;
    }
    
    // 로그 기록
    console.warn('예상치 못한 응답 구조:', responseData);
    return [];
  };

  // 삭제되지 않은 모든 노트 가져오기 (태그로 사용)
  const fetchNotes = async () => {
    if (!user || !user.id) return;
    
    try {
      setIsLoading(true);
      // manager_notes API를 통해 현재 사용자의 노트 목록 가져오기
      const response = await fetch(`/api/manager-notes/list?creator_id=${user.id}`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('노트 목록 조회에 실패했습니다.');
      }
      
      const responseData = await response.json();
      const notesList = extractNotesFromResponse(responseData);
      
      // 상태가 '삭제'가 아닌 노트만 필터링
      const activeTags = notesList
        .filter(note => note.status !== '삭제')
        .map(note => ({
          id: note.id,
          name: note.content || `노트 ${note.id}`, // content가 없을 경우 기본값
          status: note.status
        }));
      
      console.log('활성 태그/노트 목록:', activeTags);
      
      if (activeTags.length > 0) {
        setTags(activeTags);
      } else {
        console.warn('활성 태그/노트가 없습니다.');
        // 백업 데이터 사용
        setBackupTags();
      }
    } catch (error) {
      console.error('노트/태그 목록 조회 오류:', error);
      // 백업 데이터 사용
      setBackupTags();
    } finally {
      setIsLoading(false);
    }
  };
  
  // 백업 태그 데이터 설정 (API 실패 시)
  const setBackupTags = () => {
    // 사용자 정보에서 태그를 가져오거나 기본 태그 사용
    if (user && user.note3 && Array.isArray(user.note3)) {
      console.log('사용자 정보의 태그 사용:', user.note3);
      // 문자열 배열을 Tag 객체 배열로 변환
      const tagObjects = user.note3.map((tagName: string, index: number) => ({
        id: index + 1000, // 임시 ID 부여
        name: tagName
      }));
      setTags(tagObjects);
    } else {
      // 기본 태그 사용
      setTags([
        { id: 1001, name: "회원번호 수정" },
        { id: 1002, name: "인증인" },
        { id: 1003, name: "매물등록" },
        { id: 1004, name: "주택임대" },
        { id: 1005, name: "낙찰자" }
      ]);
    }
  };

  // 컴포넌트 마운트 시 태그 목록 조회
  useEffect(() => {
    fetchNotes();
  }, [user]);

  // 선택된 태그 이름 변경 시 해당 태그 인덱스 찾기
  useEffect(() => {
    if (selectedTagName) {
      const tagIndex = tags.findIndex(tag => tag.name === selectedTagName);
      if (tagIndex !== -1) {
        setSelectedTagIndex(tagIndex);
      }
    } else {
      setSelectedTagIndex(null);
    }
  }, [selectedTagName, tags]);

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

  // 태그(노트) 추가
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
      
      // 새 노트(태그)를 manager_notes 테이블에 직접 추가
      // 상태값이 정확히 뭐가 있는지 모르니 null로 보내거나 생략
      const createResponse = await fetch('/api/manager-notes/create', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          creator_id: user.id,
          content: tagName
          // status 필드 제거
        })
      });

      if (!createResponse.ok) {
        throw new Error('태그 추가에 실패했습니다.');
      }

      const createResponseData = await createResponse.json();
      
      if (createResponseData.status === 'success') {
        // 새로 생성된 노트 ID 가져오기
        let newNoteId;
        
        // 응답 구조에 따라 다르게 처리
        if (createResponseData.data && createResponseData.data.id) {
          newNoteId = createResponseData.data.id;
        } else if (createResponseData.data && createResponseData.data.note && createResponseData.data.note.id) {
          newNoteId = createResponseData.data.note.id;
        } else {
          console.warn('응답에서 노트 ID를 찾을 수 없습니다:', createResponseData);
          newNoteId = Math.floor(Math.random() * 10000) + 2000; // 임시 ID
        }
        
        console.log('새 태그(노트) 생성 성공:', { id: newNoteId, name: tagName });
        
        // 태그 목록에 추가
        const newTag = { id: newNoteId, name: tagName };
        setTags(prevTags => [...prevTags, newTag]);
        setInputValue('');
        
        // 새 태그 선택
        const newIndex = tags.length;
        setSelectedTagIndex(newIndex); // 새 태그의 인덱스 (추가 전 배열 길이)
        setSelectedNote(newNoteId, tagName);
        
        // 전체 목록 새로고침
        await fetchNotes();
      } else {
        console.error('태그 추가 응답 실패:', createResponseData);
        alert('태그를 추가할 수 없습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('태그 추가 오류:', error);
      alert('태그 추가 중 오류가 발생했습니다.');
    } finally {
      setIsAddingTag(false);
    }
  };

  // 태그(노트) 제거
  const removeTag = async (indexToRemove: number) => {
    if (!user || !user.id) return;
    
    const tagToRemove = tags[indexToRemove];
    
    try {
      setIsRemovingTag(indexToRemove);
      
      // manager_notes 테이블에서 해당 노트의 상태를 '삭제'로 변경
      const updateResponse = await fetch(`/api/manager-notes/update/${tagToRemove.id}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: '삭제'
        })
      });
      
      if (!updateResponse.ok) {
        throw new Error(`태그 제거에 실패했습니다. 상태 코드: ${updateResponse.status}`);
      }

      const responseData = await updateResponse.json();
      
      if (responseData.status === 'success') {
        // 현재 선택된 태그가 삭제되는 경우 선택 해제
        if (selectedTagIndex === indexToRemove) {
          setSelectedTagIndex(null);
          setSelectedNote(null, null);
        }
        
        // UI에서 태그 제거
        setTags(prevTags => prevTags.filter((_, index) => index !== indexToRemove));
        
        // 전체 목록 새로고침 (필요한 경우)
        // await fetchNotes();
      } else {
        console.error('태그 제거 실패:', responseData);
        alert('태그를 제거할 수 없습니다. 다시 시도해주세요.');
      }
    } catch (error: any) {
      console.error('태그 제거 오류:', error);
      const errorMessage = error.message || '알 수 없는 오류가 발생했습니다';
      alert('태그 제거 중 오류가 발생했습니다: ' + errorMessage);
    } finally {
      setIsRemovingTag(null);
    }
  };

  // 태그 클릭 시 노트 선택
  const handleTagClick = (index: number) => {
    const tag = tags[index];
    
    // 이미 선택된 태그인 경우 선택 해제
    if (selectedTagIndex === index) {
      setSelectedTagIndex(null);
      setSelectedNote(null, null);
      return;
    }
    
    // 태그 선택 및 노트 ID 설정
    setSelectedTagIndex(index);
    setSelectedNote(tag.id, tag.name);
    
    console.log(`태그 '${tag.name}' 선택됨, 노트 ID: ${tag.id}`);
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
                <div 
                  key={tag.id} 
                  className={`tag-item ${selectedTagIndex === index ? 'tag-item-selected' : ''}`}
                  onClick={() => handleTagClick(index)}
                >
                  <span>{tag.name}</span>
                  <button 
                    className="tag-remove-button"
                    onClick={(e) => {
                      e.stopPropagation(); // 태그 클릭 이벤트 전파 방지
                      removeTag(index);
                    }}
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