"use client";

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import '../../styles/ui/Logo.css';

interface LogoProps {
  href?: string;
  width?: number;
  height?: number;
}

const Logo: React.FC<LogoProps> = ({
  href = "/",
  width = 50,
  height = 50
}) => {
  return (
    <div className="logo-container">
      <Link href={href}>
        <div className="logo-wrapper">
          <Image
            src="/logo.png"
            alt="Logo"
            width={width}
            height={height}
            className="logo-image"
          />
        </div>
      </Link>
    </div>
  );
};

export default Logo;