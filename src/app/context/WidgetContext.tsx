"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

// 위젯 타입 정의 확장
export interface Widget {
  id: string;
  name: string;
  isVisible: boolean;
  column?: 'center' | 'right';
  allowedPositions: string[]; // 접근 가능한 position 목록 추가
}

// Context 타입 정의
interface WidgetContextType {
  widgets: Widget[];
  toggleWidget: (id: string) => void;
  resetWidgets: () => void;
  isWidgetAllowed: (widgetId: string) => boolean; // 권한 확인 함수 추가
}

// 초기 위젯 상태 - position별 권한 추가
// WidgetContext.tsx의 initialWidgets 배열 수정 (중복 제거)

const initialWidgets: Widget[] = [
  { 
    id: 'widget1', 
    name: '서비스 현황', 
    isVisible: false, 
    column: 'right',
    allowedPositions: ['admin', 'manager', 'marketing', 'sales']
  },
  { 
    id: 'widget1-2', 
    name: '서비스 점검 설정', 
    isVisible: false, 
    column: 'right',
    allowedPositions: ['admin']
  },
  { 
    id: 'widget1-3', 
    name: '팝업 관리', 
    isVisible: false, 
    column: 'right',
    allowedPositions: ['admin']
  },
  { 
    id: 'widget1-4', 
    name: '서버 용량 관리', 
    isVisible: false, 
    column: 'right',
    allowedPositions: ['admin']
  },
  { 
    id: 'widget1-5', 
    name: '매니저 관리', 
    isVisible: false, 
    column: 'right',
    allowedPositions: ['admin']
  },
  { 
    id: 'widget2', 
    name: '태그 관리', 
    isVisible: true, 
    column: 'center',
    allowedPositions: ['admin', 'manager', 'sales']
  },
  { 
    id: 'widget2-2', 
    name: '사용자 목록', 
    isVisible: true, 
    column: 'center',
    allowedPositions: ['admin', 'manager', 'marketing', 'sales']
  },
  { 
    id: 'widget2-3', 
    name: '차량 입찰 관리',  // 이름 변경
    isVisible: false, 
    column: 'center',
    allowedPositions: ['admin', 'manager', 'sales']  // 권한 조정
  },
  { 
    id: 'widget2-4', 
    name: '개발용 누구나사 입찰내역',  // 새 위젯 추가
    isVisible: false, 
    column: 'center',
    allowedPositions: ['admin', 'manager', 'sales']
  },
  { 
    id: 'widget3', 
    name: '할 일 목록', 
    isVisible: true, 
    column: 'right',
    allowedPositions: ['admin', 'manager', 'sales']
  },
  { 
    id: 'widget3-2', 
    name: '사용자 상세정보', 
    isVisible: true, 
    column: 'right',
    allowedPositions: ['admin', 'manager', 'marketing', 'sales']
  },
  { 
    id: 'widget3-3', 
    name: 'SMS 발송', 
    isVisible: false, 
    column: 'right',
    allowedPositions: ['admin', 'manager', 'marketing', 'sales']
  },
  { 
    id: 'widget-car-note', 
    name: '차량 노트', 
    isVisible: false, 
    column: 'center',
    allowedPositions: ['admin']
  },
  { 
    id: 'widget2-5', 
    name: '입찰참여비관리', 
    isVisible: false, 
    column: 'center',
    allowedPositions: ['admin', 'manager', 'sales']
  }
  // 중복된 widget-car-note 항목 제거됨
];

// 로컬 스토리지 키
const STORAGE_KEY = 'widget_settings';

// Context 생성
const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

// Context Provider 컴포넌트
export function WidgetProvider({ children }: { children: ReactNode }) {
  const [widgets, setWidgets] = useState<Widget[]>(initialWidgets);
  const [isInitialized, setIsInitialized] = useState(false);
  const { user } = useAuth(); // 사용자 정보 가져오기

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
          
          // 사용자의 position에 따라 초기 위젯 설정 조정
          const userPosition = user?.position || 'sales'; // 기본값은 sales
          
          const adjustedWidgets = initialWidgets.map(widget => {
            // position에 따라 초기 가시성 설정
            let initialVisibility = widget.isVisible;
            
            // 기본 위젯 (position에 상관없이 보이는 위젯)
            const defaultWidgets = ['widget2', 'widget2-2', 'widget3', 'widget3-2'];
            
            // 권한이 없으면 무조건 비활성화
            if (!widget.allowedPositions.includes(userPosition)) {
              initialVisibility = false;
            }
            
            return {
              ...widget,
              isVisible: initialVisibility
            };
          });
          
          setWidgets(adjustedWidgets);
          
          // 초기 설정을 로컬 스토리지에 저장
          localStorage.setItem(STORAGE_KEY, JSON.stringify(adjustedWidgets));
        }
      } catch (error) {
        console.error('위젯 설정 로드 오류:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    loadWidgetSettings();
  }, [user]);

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

  // 위젯 권한 확인 함수
  const isWidgetAllowed = (widgetId: string): boolean => {
    const widget = widgets.find(w => w.id === widgetId);
    const userPosition = user?.position || 'sales'; // 기본값: sales
    
    if (!widget) return false;
    
    return widget.allowedPositions.includes(userPosition);
  };

  // 위젯 토글 함수
  const toggleWidget = (id: string) => {
    // 권한이 없으면 토글 불가
    if (!isWidgetAllowed(id)) return;
    
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
    const userPosition = user?.position || 'sales';
    
    const resetWidgets = initialWidgets.map(widget => {
      // 권한이 없으면 무조건 비활성화
      if (!widget.allowedPositions.includes(userPosition)) {
        return { ...widget, isVisible: false };
      }
      
      return widget;
    });
    
    setWidgets(resetWidgets);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resetWidgets));
  };

  return (
    <WidgetContext.Provider value={{ 
      widgets, 
      toggleWidget, 
      resetWidgets, 
      isWidgetAllowed 
    }}>
      {children}
    </WidgetContext.Provider>
  );
}

// Context 사용 훅
export function useWidget() {
  const context = useContext(WidgetContext);
  if (context === undefined) {
    throw new Error('useWidget must be used within a WidgetProvider');
  }
  return context;
}