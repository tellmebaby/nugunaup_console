"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 위젯 타입 정의
export interface Widget {
  id: string;
  name: string;
  isVisible: boolean;
  column?: 'center' | 'right'; // 어느 열에 표시할지 명시
}

// Context 타입 정의
interface WidgetContextType {
  widgets: Widget[];
  toggleWidget: (id: string) => void;
  resetWidgets: () => void;
}

// 초기 위젯 상태 - 수정된 레이아웃에 맞게 조정
// 태그관리, 할일 목록, 사용자목록, 사용자상세정보만 기본으로 활성화
const initialWidgets: Widget[] = [
  { id: 'widget1', name: '서비스 현황', isVisible: false, column: 'right' },
  { id: 'widget1-2', name: '서비스 점검 설정', isVisible: false, column: 'right' },
  { id: 'widget1-3', name: '팝업 관리', isVisible: false, column: 'right' },
  { id: 'widget1-4', name: '서버 용량 관리', isVisible: false, column: 'right' },
  { id: 'widget2', name: '태그 관리', isVisible: true, column: 'center' },
  { id: 'widget2-2', name: '사용자 목록', isVisible: true, column: 'center' },
  { id: 'widget2-3', name: '데이터 요약', isVisible: false, column: 'center' },
  { id: 'widget3', name: '할 일 목록', isVisible: true, column: 'right' },
  { id: 'widget3-2', name: '사용자 상세정보', isVisible: true, column: 'right' },
  { id: 'widget3-3', name: 'SMS 발송', isVisible: false, column: 'right' },
];

// 로컬 스토리지 키
const STORAGE_KEY = 'widget_settings';

// Context 생성
const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

// Context Provider 컴포넌트
export function WidgetProvider({ children }: { children: ReactNode }) {
  const [widgets, setWidgets] = useState<Widget[]>(initialWidgets);
  const [isInitialized, setIsInitialized] = useState(false);

  // 컴포넌트 마운트 시 로컬 스토리지에서 설정 로드
  useEffect(() => {
    const loadWidgetSettings = () => {
      try {
        // 로컬 스토리지에서 설정 가져오기
        const savedSettings = localStorage.getItem(STORAGE_KEY);
        
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          
          if (Array.isArray(parsedSettings) && parsedSettings.length > 0) {
            console.log('로컬 스토리지에서 위젯 설정 로드:', parsedSettings);
            
            // 기존 위젯 정보를 유지하면서 가시성 정보만 업데이트
            const updatedWidgets = initialWidgets.map(widget => {
              const savedWidget = parsedSettings.find(w => w.id === widget.id);
              return savedWidget 
                ? { ...widget, isVisible: savedWidget.isVisible } 
                : widget;
            });
            
            setWidgets(updatedWidgets);
          }
        } else {
          console.log('저장된 위젯 설정 없음, 초기 설정 사용');
          // 초기 설정을 로컬 스토리지에 저장
          localStorage.setItem(STORAGE_KEY, JSON.stringify(initialWidgets));
        }
      } catch (error) {
        console.error('위젯 설정 로드 오류:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    loadWidgetSettings();
  }, []);

  // 위젯 설정이 변경될 때마다 로컬 스토리지에 저장
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
        console.log('위젯 설정 저장됨:', widgets);
      } catch (error) {
        console.error('위젯 설정 저장 오류:', error);
      }
    }
  }, [widgets, isInitialized]);

  // 위젯 토글 함수
  const toggleWidget = (id: string) => {
    setWidgets(prevWidgets =>
      prevWidgets.map(widget =>
        widget.id === id 
          ? { ...widget, isVisible: !widget.isVisible } 
          : widget
      )
    );
  };

  // 위젯 설정 초기화 함수
  const resetWidgets = () => {
    // 초기 위젯 설정으로 돌아가기 (태그관리, 할일 목록, 사용자목록, 사용자상세정보만 활성화)
    const defaultWidgets = initialWidgets.map(widget => ({
      ...widget,
      isVisible: ['widget2', 'widget2-2', 'widget3', 'widget3-2'].includes(widget.id) 
    }));
    setWidgets(defaultWidgets);
  };

  return (
    <WidgetContext.Provider value={{ widgets, toggleWidget, resetWidgets }}>
      {children}
    </WidgetContext.Provider>
  );
}

// Custom Hook 생성
export function useWidgets() {
  const context = useContext(WidgetContext);
  if (context === undefined) {
    throw new Error('useWidgets must be used within a WidgetProvider');
  }
  return context;
}