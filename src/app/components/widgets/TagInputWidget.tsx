"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/TagInputWidgetStyle.css';

export default function TagInputWidget() {
  const { user } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const tagsContainerRef = useRef<HTMLDivElement>(null);

  // 태그 초기 데이터 로드
  useEffect(() => {
    if (user && user.note3 && Array.isArray(user.note3)) {
      setTags(user.note3);
    } else {
      // 임시 데이터 (테스트용)
      setTags(["회원번호 수정", "인증인", "매물등록", "주택임대", "낙찰자"]);
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim() !== '') {
      addTag();
    }
  };

  const addTag = () => {
    if (inputValue.trim() !== '' && !tags.includes(inputValue.trim())) {
      const newTags = [...tags, inputValue.trim()];
      setTags(newTags);
      setInputValue('');
      
      // TODO: Here you would update the user's note3 array via API
    }
  };

  const removeTag = (indexToRemove: number) => {
    const newTags = tags.filter((_, index) => index !== indexToRemove);
    setTags(newTags);
    
    // TODO: Here you would update the user's note3 array via API
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
            />
          </div>
          <button className="tag-add-button" onClick={addTag}>
            <div className="tag-add-button-circle"></div>
            <span className="tag-add-button-text">+</span>
          </button>
        </div>

        {/* 태그 목록 섹션 */}
        <div 
          className="tags-list-container"
          ref={tagsContainerRef}
        >
          <div className="tags-list">
            {tags.map((tag, index) => (
              <div key={index} className="tag-item">
                <span>{tag}</span>
                <button 
                  className="tag-remove-button"
                  onClick={() => removeTag(index)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}