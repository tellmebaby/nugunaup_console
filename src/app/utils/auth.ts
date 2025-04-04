"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext'; 

/**
 * 보호된 경로에 대한 인증 확인 훅
 * 인증되지 않은 사용자를 로그인 페이지로 리디렉션합니다.
 */
export function useRequireAuth() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);
  
  return isAuthenticated;
}

/**
 * JWT 토큰이 만료되었는지 확인합니다.
 * @returns {boolean} 토큰 만료 여부
 */
export function isTokenExpired(): boolean {
  if (typeof window === 'undefined') return true;
  
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) return true;
    
    // 토큰 분석 (간단한 만료 체크)
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) return true;
    
    const payload = JSON.parse(atob(tokenParts[1]));
    const expTime = payload.exp * 1000; // 초를 밀리초로 변환
    
    return Date.now() >= expTime;
  } catch (error) {
    console.error('토큰 유효성 검사 오류:', error);
    return true;
  }
}

/**
 * 인증 헤더 가져오기
 * @returns {HeadersInit} 인증 헤더
 */
export function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  // 브라우저 환경에서만 실행
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
}