"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

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
}

// 초기 위젯 상태 - 수정된 레이아웃에 맞게 조정
const initialWidgets: Widget[] = [
  { id: 'widget1', name: '서비스 현황', isVisible: true, column: 'right' },
  { id: 'widget1-2', name: '서비스 점검 설정', isVisible: true, column: 'right' },
  { id: 'widget1-3', name: '팝업 관리', isVisible: true, column: 'right' },
  { id: 'widget1-4', name: '서버 용량 관리', isVisible: true, column: 'right' },
  { id: 'widget2', name: '태그 관리', isVisible: true, column: 'center' },
  { id: 'widget2-2', name: '사용자 목록', isVisible: true, column: 'center' },
  { id: 'widget2-3', name: '데이터 요약', isVisible: true, column: 'center' },
  { id: 'widget3', name: '할 일 목록', isVisible: true, column: 'right' },
  { id: 'widget3-2', name: '사용자 상세정보', isVisible: true, column: 'right' },
  { id: 'widget3-3', name: 'SMS 발송', isVisible: true, column: 'right' },
];

// Context 생성
const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

// Context Provider 컴포넌트
export function WidgetProvider({ children }: { children: ReactNode }) {
  const [widgets, setWidgets] = useState<Widget[]>(initialWidgets);

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

  return (
    <WidgetContext.Provider value={{ widgets, toggleWidget }}>
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