"use client";

import Image from 'next/image';
import React, { useState } from 'react';
import { getAuthHeaders } from '../../utils/auth';
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

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    try {
      // 기본 페이징 파라미터 추가
      const limit = 20; // 한 번에 가져올 항목 수
      const offset = 0; // 첫 페이지는 0부터 시작
      
      // Construct the search URL with query parameter and pagination
      const searchUrl = `/api/users/search?real_name=${encodeURIComponent(searchTerm)}&limit=${limit}&offset=${offset}`;

      // Fetch search results
      const response = await fetch(searchUrl, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Parse the JSON response
      const data = await response.json();

      // Log search term and full API response to console
      console.log('Search Term:', searchTerm);
      console.log('Search API Response:', data);

      // Dispatch a custom event for UserList to listen to
      const searchEvent = new CustomEvent('search-users', { 
        detail: searchTerm 
      });
      window.dispatchEvent(searchEvent);

      // Call onSearch prop if provided
      if (onSearch) {
        onSearch(searchTerm);
      }
    } catch (error) {
      console.error('Search API Error:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Log the search term to the console
    console.log('Current Search Term:', value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Trigger search on Enter key
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="search-container">
      <div className="search-icon-container">
        <Image
          src="/icons/lens.png"
          alt="Search Icon"
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