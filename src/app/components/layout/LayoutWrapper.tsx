"use client";

import React, { ReactNode } from 'react';
import { WidgetProvider } from '../../context/WidgetContext';
import DashboardLayout from './DashboardLayout';

interface LayoutWrapperProps {
  children: ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  return (
    <WidgetProvider>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </WidgetProvider>
  );
}