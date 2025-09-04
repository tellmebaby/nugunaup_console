"use client";

import React, { useEffect, useState } from 'react';
import Header from './Header';
import { BusinessStatus, Widget2, Widget2_2, Widget2_3, Widget2_4, Widget3, Widget3_2, Widget3_3, Widget1_2, Widget1_3, Widget1_4, CarNoteWidget, NSAAppVehicleBid, NSAAppVehiclePaymentsBoard } from '../widgets';
import { useWidget } from '../../context/WidgetContext';

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { widgets } = useWidget();
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // 각 위젯의 가시성 상태 가져오기
  const isWidget1Visible = widgets.find(w => w.id === 'widget1')?.isVisible || false;
  const isWidget1_2Visible = widgets.find(w => w.id === 'widget1-2')?.isVisible || false;
  const isWidget1_3Visible = widgets.find(w => w.id === 'widget1-3')?.isVisible || false;
  const isWidget1_4Visible = widgets.find(w => w.id === 'widget1-4')?.isVisible || false;
  const isWidget2Visible = widgets.find(w => w.id === 'widget2')?.isVisible || false;
  const isWidget2_2Visible = widgets.find(w => w.id === 'widget2-2')?.isVisible || false;
  const isWidget2_3Visible = widgets.find(w => w.id === 'widget2-3')?.isVisible || false;
  const isWidget2_4Visible = widgets.find(w => w.id === 'widget2-4')?.isVisible || false; // 새 위젯
  const isWidget3Visible = widgets.find(w => w.id === 'widget3')?.isVisible || false;
  const isWidget3_2Visible = widgets.find(w => w.id === 'widget3-2')?.isVisible || false;
  const isWidget3_3Visible = widgets.find(w => w.id === 'widget3-3')?.isVisible || false; // SMS 위젯 가시성
  const isCarNoteVisible = widgets.find(w => w.id === 'widget-car-note')?.isVisible || false;
  const isWidget2_5Visible = widgets.find(w => w.id === 'widget2-5')?.isVisible || false; // 입찰참여비관리


  // 반응형 레이아웃을 위한 창 크기 감지 (이전 코드와 동일)
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

      <div className="flex-1 p-4 flex justify-center">
        <div className="widget-grid">
          {/* Center widgets */}
          <div className="widget-center-column">
            {isWidget2Visible && (
              <div className="widget-item widget-center">
                <Widget2 />
              </div>
            )}

            {isWidget2_2Visible && (
              <div className="widget-item widget-center">
                <Widget2_2 />
              </div>
            )}

            {isWidget2_3Visible && (
              <div className="widget-item widget-center">
                <Widget2_3 />
              </div>
            )}

            {isWidget2_4Visible && (
              <div className="widget-item widget-center">
                <Widget2_4 />
              </div>
            )}

            {isCarNoteVisible && (
              <div className="widget-item widget-center">
                <CarNoteWidget />
              </div>
            )}

            {isWidget2_5Visible && (
              <div className="widget-item widget-center">
                <NSAAppVehiclePaymentsBoard />
              </div>
            )}

            {/* 차량 노트 위젯 추가 */}
            {isCarNoteVisible && (
              <div className="widget-item widget-center">
                <CarNoteWidget />
              </div>
            )}
          </div>

          {/* Right widget - 기존 오른쪽 컬럼 위젯과 왼쪽 컬럼 위젯을 함께 배치 */}
          <div className="widget-right-column">
            {isWidget3Visible && (
              <div className="widget-item widget-right">
                <Widget3 />
              </div>
            )}

            {isWidget3_2Visible && (
              <div className="widget-item widget-right">
                <Widget3_2 />
              </div>
            )}
            
            {isWidget3_3Visible && (
              <div className="widget-item widget-right">
                <Widget3_3 />
              </div>
            )}
            
            {/* 기존 왼쪽 컬럼의 위젯들 */}
            {isWidget1Visible && (
              <div className="widget-item widget-right">
                <BusinessStatus />
              </div>
            )}

            {isWidget1_2Visible && (
              <div className="widget-item widget-right">
                <Widget1_2 />
              </div>
            )}

            {isWidget1_3Visible && (
              <div className="widget-item widget-right">
                <Widget1_3 />
              </div>
            )}

            {isWidget1_4Visible && (
              <div className="widget-item widget-right">
                <Widget1_4 />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}