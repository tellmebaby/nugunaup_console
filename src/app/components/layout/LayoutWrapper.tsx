"use client";

import React, { ReactNode } from 'react';
import { WidgetProvider } from '../../context/WidgetContext';
import { NoteProvider } from '../../context/NoteContext';
import DashboardLayout from './DashboardLayout';

interface LayoutWrapperProps {
  children: ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  return (
    <WidgetProvider>
      <NoteProvider>
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </NoteProvider>
    </WidgetProvider>
  );
}