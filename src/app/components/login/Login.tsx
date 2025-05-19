// src/app/components/login/Login.tsx
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../../context/AuthContext';
import '../../styles/LoginStyle.css';

export default function Login() {
  const [nsa_id, setNsa_id] = useState(''); // username에서 nsa_id로 변경
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // 간단한 유효성 검사
    if (!nsa_id || !password) {
      setError('아이디와 비밀번호를 입력해주세요.');
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await login(nsa_id, password); // username에서 nsa_id로 변경
      
      if (result.success) {
        // 로그인 성공 시 대시보드로 이동
        router.push('/dashboard');
      } else {
        setError(result.error || '로그인에 실패했습니다.');
      }
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo-container">
          <Image 
            src="/logo.png" 
            alt="Logo" 
            width={80} 
            height={80} 
            className="login-logo" 
            priority
          />
        </div>
        
        <h1 className="login-title">관리자 로그인</h1>
        
        {error && <div className="login-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-input-group">
            <div className="login-input-label">아이디</div>
            <input
              type="text"
              value={nsa_id}
              onChange={(e) => setNsa_id(e.target.value)}
              className="login-input"
              placeholder="아이디를 입력하세요"
              disabled={loading}
            />
          </div>
          
          <div className="login-input-group">
            <div className="login-input-label">비밀번호</div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              placeholder="비밀번호를 입력하세요"
              disabled={loading}
            />
          </div>
          
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  );
}