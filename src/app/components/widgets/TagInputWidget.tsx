"use client";

import React, { useState } from 'react';
import '../../styles/TagInputWidgetStyle.css';

export default function TagInputWidget() {
  const [inputValue, setInputValue] = useState('');
  const [tags, setTags] = useState(['Design', 'UI', 'UX', 'Figma', 'React']);
  const [progressValue, setProgressValue] = useState(20); // 프로그레스바 초기값 (%)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim() !== '') {
      addTag();
    }
  };

  const addTag = () => {
    if (inputValue.trim() !== '') {
      setTags([...tags, inputValue.trim()]);
      setInputValue('');
      
      // 태그가 추가될 때마다 프로그레스바 값을 업데이트 (최대 100%)
      const newProgress = Math.min(100, progressValue + 10);
      setProgressValue(newProgress);
    }
  };

  const removeTag = (indexToRemove: number) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
    
    // 태그가 제거될 때마다 프로그레스바 값을 업데이트 (최소 0%)
    const newProgress = Math.max(0, progressValue - 10);
    setProgressValue(newProgress);
  };

  return (
    <div className="h-full w-full">      
      <div className="tag-container">
        {/* 입력 섹션 */}
        <div className="tag-input-section">
          <div className="tag-input-wrapper">
            <div className="tag-input-field">
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Tag name"
                className="tag-input"
              />
            </div>
            <button className="tag-add-button" onClick={addTag}>
              <div className="tag-add-button-circle"></div>
              <span className="tag-add-button-text">+</span>
            </button>
          </div>
        </div>

        {/* 태그 목록 섹션 */}
        <div className="tags-list-container">
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
          
          {/* 프로그레스 라인 */}
          <div className="tag-progress-container">
            <div className="tag-progress-background">
              <div 
                className="tag-progress-line" 
                style={{ width: `${progressValue}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}