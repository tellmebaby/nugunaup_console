"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

// 위젯 타입 정의
export interface Widget {
  id: string;
  name: string;
  isVisible: boolean;
}

// Context 타입 정의
interface WidgetContextType {
  widgets: Widget[];
  toggleWidget: (id: string) => void;
}

// 초기 위젯 상태
const initialWidgets: Widget[] = [
  { id: 'widget1', name: 'Widget 1-1', isVisible: true },
  { id: 'widget1-2', name: 'Widget 1-2', isVisible: true },
  { id: 'widget1-3', name: 'Widget 1-3', isVisible: true },
  { id: 'widget1-4', name: 'Widget 1-4', isVisible: true },
  { id: 'widget2', name: 'Widget 2-1', isVisible: true },
  { id: 'widget2-2', name: 'Widget 2-2', isVisible: true},
  { id: 'widget2-3', name: 'Widget 2-3', isVisible: true}, // 새로운, Widget2-3 추가
  { id: 'widget3', name: 'Widget 3-1', isVisible: true },
  { id: 'widget3-2', name: 'Widget 3-2', isVisible: true },
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