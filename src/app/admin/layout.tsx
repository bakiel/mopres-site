'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  
  useEffect(() => {
    // Simple session check
    const checkSession = () => {
      const hasSession = 
        document.cookie.includes('adminSession=authenticated') ||
        localStorage.getItem('adminSession') === 'authenticated';
      
      return hasSession;
    };
    
    // Skip check on login/logout pages
    const isAuthPage = window.location.pathname.includes('/admin/login') || 
                      window.location.pathname.includes('/admin/logout');
    
    if (!isAuthPage && !checkSession()) {
      window.location.href = '/admin/login';
    }
  }, [router]);
  
  return <div>{children}</div>;
}