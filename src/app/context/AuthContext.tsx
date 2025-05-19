"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// 사용자 정보 인터페이스 (수정 버전)
interface User {
  id: number;
  name: string;
  nsa_id: string; // username 대신 nsa_id 사용
  position: string; // 직책 필드 추가
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  remember_token: string | null;
  note1: string | null; // TEXT 필드이므로 string으로 변경, null 허용
  note2: string | null; // TEXT 필드이므로 string으로 변경, null 허용
  note3: string | null; // TEXT 필드이므로 string으로 변경, null 허용
}

// API 응답 인터페이스
interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    token: string;
    expiresAt: string;
    user: User;
  };
  error?: {
    code: string;
    message: string;
  };
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (nsa_id: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // 초기 로딩 시 인증 상태 확인
  useEffect(() => {
    const checkAuth = () => {
      try {
        const authToken = localStorage.getItem('authToken');
        const userData = localStorage.getItem('user');

        if (authToken && userData) {
          try {
            // JSON 파싱 시도
            const parsedUser = JSON.parse(userData);
            setIsAuthenticated(true);
            setUser(parsedUser);
          } catch (parseError) {
            console.error("사용자 데이터 파싱 오류:", parseError);
            // 잘못된 데이터 처리
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            setIsAuthenticated(false);
            setUser(null);
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error("인증 확인 중 오류 발생:", error);
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    checkAuth();
  }, []);

  // 로그인 함수 (nsa_id로 파라미터 변경)
  const login = async (nsa_id: string, password: string) => {
    try {
      console.log('로그인 시도:', { nsa_id });

      // API 요청 전송 (필드명도 nsa_id로 변경)
      const response = await fetch('/api/nup/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nsa_id, password }),
      });

      // 응답 상태 확인
      console.log('응답 상태:', response.status, response.statusText);

      if (!response.ok) {
        console.error('서버 응답 오류:', response.status, response.statusText);

        // 401, 400 등의 오류 처리
        if (response.status === 401) {
          return {
            success: false,
            error: '아이디 또는 비밀번호가 일치하지 않습니다.'
          };
        }

        return {
          success: false,
          error: '서버 오류가 발생했습니다. 나중에 다시 시도해주세요.'
        };
      }

      // 응답 텍스트 먼저 확인 (디버깅 용도)
      const responseText = await response.text();
      console.log('응답 텍스트:', responseText);

      // 응답이 비어있는지 확인
      if (!responseText.trim()) {
        console.error('빈 응답 받음');
        return {
          success: false,
          error: '서버로부터 빈 응답을 받았습니다.'
        };
      }

      // 텍스트를 JSON으로 파싱
      let result: AuthResponse;
      try {
        result = JSON.parse(responseText);
        console.log('파싱된 응답:', result);
      } catch (parseError) {
        console.error('JSON 파싱 오류:', parseError);
        return {
          success: false,
          error: '서버 응답을 처리할 수 없습니다. 관리자에게 문의하세요.'
        };
      }

      // 로그인 성공 처리
      if (result.success && result.data) {
        // 인증 토큰을 로컬 스토리지에 저장
        localStorage.setItem('authToken', result.data.token);
        localStorage.setItem('user', JSON.stringify(result.data.user));

        setIsAuthenticated(true);
        setUser(result.data.user);
        return { success: true };
      }

      // 로그인 실패 처리
      return {
        success: false,
        error: result.error?.message || result.message || '로그인에 실패했습니다.'
      };
    } catch (error) {
      console.error('로그인 중 예외 발생:', error);
      return {
        success: false,
        error: '서버 연결에 실패했습니다. 네트워크 연결을 확인해주세요.'
      };
    }
  };

  // 로그아웃 함수
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Context Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth는 AuthProvider 내에서 사용되어야 합니다');
  }
  return context;
}