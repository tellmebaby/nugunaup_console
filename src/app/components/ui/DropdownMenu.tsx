"use client";

import React, { useState, useRef, useEffect } from 'react';
import '../../styles/ui/DropdownMenu.css';

interface DropdownItem {
  id: string;
  label: string;
  checked?: boolean;
}

interface DropdownMenuProps {
  buttonText: string;
  headerText?: string;
  items: DropdownItem[];
  onItemToggle?: (id: string) => void;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  buttonText,
  headerText,
  items,
  onItemToggle
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Handle outside clicks
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = (id: string) => {
    if (onItemToggle) {
      onItemToggle(id);
    }
  };

  // 활성화된 위젯 수 계산
  const activeItemsCount = items.filter(item => item.checked).length;

  return (
   <div className="dropdown">
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className="dropdown-button"
      >
        <div className="dropdown-button-text">
          <span>{buttonText}</span>
          {activeItemsCount > 0 && (
            <span className="dropdown-active-count">{activeItemsCount}</span>
          )}
        </div>
        <div className="dropdown-button-icon">
          <span>▼</span>
        </div>
      </button>
      
      {isOpen && (
        <div 
          ref={menuRef} 
          className="dropdown-menu"
        >
          {headerText && <div className="dropdown-header">{headerText}</div>}
          <div className="dropdown-items-container">
            {items.map(item => (
              <div key={item.id} className="dropdown-item">
                <label htmlFor={item.id} className="dropdown-label">
                  <input
                    type="checkbox"
                    id={item.id}
                    checked={item.checked}
                    onChange={() => handleItemClick(item.id)}
                    className="dropdown-checkbox"
                  />
                  <span className="dropdown-text">{item.label}</span>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;