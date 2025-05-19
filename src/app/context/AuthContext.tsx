"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// 사용자 정보 인터페이스 - 수정됨
interface User {
  id: number;
  name: string;
  nsa_id: string; // API의 username과 매핑
  position: string; // API의 role과 매핑
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  remember_token: string | null;
  note1: string | null; // TEXT 필드이므로 string으로 유지
  note2: string | null; // TEXT 필드이므로 string으로 유지
  note3: string | null; // TEXT 필드이므로 string으로 유지
  
  // API가 반환하는 추가 필드들
  username?: string; // API 응답에는 있지만 내부적으로는 nsa_id로 사용
  role?: string; // API 응답에는 있지만 내부적으로는 position으로 사용
  permissions?: string[]; // API에서 제공하는 권한 목록
}

// API 응답 인터페이스
interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    token: string;
    expiresAt: string;
    user: {
      id: number;
      username: string; // API에서는 username 사용
      name: string;
      role: string; // API에서는 role 사용
      permissions: string[];
      remember_token: string | null;
      email_verified_at: string | null;
      note1: any;
      note2: any;
      note3: any;
      created_at: string;
      updated_at: string;
    }
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

  // 로그인 함수 - 수정됨
  const login = async (nsa_id: string, password: string) => {
    try {
      console.log('로그인 시도:', { nsa_id });

      // API 요청 전송 (백엔드 API 형식에 맞춤)
      const response = await fetch('/api/nup/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: nsa_id, // API 요청 시 username 필드 사용
          password 
        }),
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
        // API에서 받은 사용자 정보 변환
        const apiUser = result.data.user;
        
        // DB 필드명으로 매핑한 사용자 정보
        const userData: User = {
          id: apiUser.id,
          name: apiUser.name,
          nsa_id: apiUser.username, // username -> nsa_id로 매핑
          position: apiUser.role, // role -> position으로 매핑
          email_verified_at: apiUser.email_verified_at,
          remember_token: apiUser.remember_token,
          created_at: apiUser.created_at,
          updated_at: apiUser.updated_at,
          note1: typeof apiUser.note1 === 'object' ? JSON.stringify(apiUser.note1) : apiUser.note1,
          note2: typeof apiUser.note2 === 'object' ? JSON.stringify(apiUser.note2) : apiUser.note2,
          note3: typeof apiUser.note3 === 'object' ? JSON.stringify(apiUser.note3) : apiUser.note3,
          permissions: apiUser.permissions // 권한 정보 유지
        };

        // 인증 토큰을 로컬 스토리지에 저장
        localStorage.setItem('authToken', result.data.token);
        localStorage.setItem('user', JSON.stringify(userData));

        setIsAuthenticated(true);
        setUser(userData);
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