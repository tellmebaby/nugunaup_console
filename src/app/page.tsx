// src/app/page.tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to login page immediately
    router.push('/login');
  }, [router]);

  // This return will only briefly be visible before the redirect
  return null;
}