"use client";

import React, { useEffect, useState } from 'react';
import Header from './Header';
import { BusinessStatus, Widget2, Widget3 } from '../widgets';
import { useWidgets } from '../../context/WidgetContext';

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { widgets } = useWidgets();
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // 각 위젯의 가시성 상태 가져오기
  const isWidget1Visible = widgets.find(w => w.id === 'widget1')?.isVisible || false;
  const isWidget2Visible = widgets.find(w => w.id === 'widget2')?.isVisible || false;
  const isWidget3Visible = widgets.find(w => w.id === 'widget3')?.isVisible || false;

  // 반응형 레이아웃을 위한 창 크기 감지
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1230);
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
      
      <div className="flex-1 p-4">
        <div className="widget-grid">
          {isWidget1Visible && (
            <div className="widget-item widget-left">
              <BusinessStatus />
            </div>
          )}
          
          {isWidget2Visible && (
            <div className="widget-item widget-center bg-white rounded-lg shadow p-4">
              <Widget2 />
            </div>
          )}
          
          {isWidget3Visible && (
            <div className="widget-item widget-right bg-white rounded-lg shadow p-4">
              <Widget3 />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}