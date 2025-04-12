"use client";

import Image from 'next/image';
import React, { useState } from 'react';
import '../../styles/ui/SearchBar.css';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search..",
  onSearch
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = () => {
    if (!searchTerm.trim()) return;

    try {
      console.log('검색어 전송:', searchTerm);
      
      // UserList가 수신할 커스텀 이벤트 발송 - 검색어만 전달
      const searchEvent = new CustomEvent('search-users', { 
        detail: searchTerm 
      });
      window.dispatchEvent(searchEvent);

      // onSearch prop이 제공된 경우 호출
      if (onSearch) {
        onSearch(searchTerm);
      }
    } catch (error) {
      console.error('검색 이벤트 발생 오류:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // 현재 검색어를 콘솔에 기록
    console.log('현재 검색어:', value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Enter 키를 누르면 검색 실행
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="search-container">
      <div className="search-icon-container">
        <Image
          src="/icons/lens.png"
          alt="검색 아이콘"
          width={20}
          height={20}
          className="search-icon"
          onClick={handleSearch}
        />
      </div>
      <div className="search-input-container">
        <input
          type="text"
          placeholder={placeholder}
          className="search-input"
          value={searchTerm}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
};

export default SearchBar;