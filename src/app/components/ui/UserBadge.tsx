"use client";

import Link from 'next/link';
import React from 'react';
import '../../styles/ui/UserBadge.css';

interface UserBadgeProps {
  username: string;
  href?: string;
  onClick?: () => void;
}

const UserBadge: React.FC<UserBadgeProps> = ({
  username,
  href = "/admin",
  onClick
}) => {
  const badgeContent = (
    <div className="user-badge" onClick={onClick}>
      <span>{username}</span>
    </div>
  );

  if (href) {
    return (
      <Link href={href}>
        {badgeContent}
      </Link>
    );
  }

  return badgeContent;
};

export default UserBadge;