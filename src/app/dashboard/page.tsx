"use client";

import { useRequireAuth } from '../utils/auth';
import LayoutWrapper from '../components/layout/LayoutWrapper';

export default function DashboardPage() {
  // This will redirect to login if not authenticated
  const isAuthenticated = useRequireAuth();
  
  if (!isAuthenticated) {
    // Return null or a loading state while redirecting
    return null;
  }

  return (
    <LayoutWrapper>
      <div>
        {/* Dashboard content */}
      </div>
    </LayoutWrapper>
  );
}