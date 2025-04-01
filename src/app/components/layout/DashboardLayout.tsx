"use client";

import React, { useEffect, useState } from 'react';
import Header from './Header';
import Widget1 from '../widgets/Widget1';
import Widget2 from '../widgets/Widget2';
import Widget3 from '../widgets/Widget3';
import { useWidgets } from '../../context/WidgetContext';

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { widgets } = useWidgets();
  const [isMobile, setIsMobile] = useState(false);

  // 각 위젯의 가시성 상태 가져오기
  const isWidget1Visible = widgets.find(w => w.id === 'widget1')?.isVisible || false;
  const isWidget2Visible = widgets.find(w => w.id === 'widget2')?.isVisible || false;
  const isWidget3Visible = widgets.find(w => w.id === 'widget3')?.isVisible || false;

  // 반응형 레이아웃을 위한 창 크기 감지
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // 초기 설정
    handleResize();

    // 이벤트 리스너 등록
    window.addEventListener('resize', handleResize);

    // 클린업
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      
      <div className={`flex flex-1 p-4 ${isMobile ? 'flex-col' : 'flex-row'} transition-all duration-500 ease-in-out`}>
        {/* 위젯 컨테이너들 */}
        
        {/* 가로모드: 첫 번째 열 (왼쪽) / 세로모드: 마지막에 표시 */}
        <div className={`
          ${isMobile ? 'w-full mb-4 order-3' : 'w-1/3 pr-4'} 
          flex flex-col space-y-4
          transition-all duration-500 ease-in-out
        `}>
          {isWidget1Visible && <Widget1 />}
        </div>
        
        {/* 가로모드: 두 번째 열 (중앙) / 세로모드: 첫 번째로 표시 */}
        <div className={`
          ${isMobile ? 'w-full mb-4 order-1' : 'w-1/3 px-4'} 
          flex flex-col space-y-4
          transition-all duration-500 ease-in-out
        `}>
          {isWidget2Visible && <Widget2 />}
          {/* 메인 콘텐츠 영역 */}
        </div>
        
        {/* 가로모드: 세 번째 열 (오른쪽) / 세로모드: 두 번째로 표시 */}
        <div className={`
          ${isMobile ? 'w-full mb-4 order-2' : 'w-1/3 pl-4'} 
          flex flex-col space-y-4
          transition-all duration-500 ease-in-out
        `}>
          {isWidget3Visible && <Widget3 />}
        </div>
      </div>
    </div>
  );
}