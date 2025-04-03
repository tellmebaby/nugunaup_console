"use client";

import React from 'react';
import '../../styles/ui/IconButton.css';

interface IconButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  ariaLabel?: string;
}

const IconButton: React.FC<IconButtonProps> = ({
  onClick,
  children,
  ariaLabel
}) => {
  return (
    <button 
      className="icon-button"
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
};

export default IconButton;