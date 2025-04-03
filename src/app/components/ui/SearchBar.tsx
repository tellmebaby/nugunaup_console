"use client";

import Image from 'next/image';
import React from 'react';
import '../../styles/ui/SearchBar.css';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search..",
  onSearch
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSearch) {
      onSearch(e.target.value);
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
        />
      </div>
      <div className="search-input-container">
        <input
          type="text"
          placeholder={placeholder}
          className="search-input"
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

export default SearchBar;