// src/app/admin/layout.tsx
'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { logger } from '@/utils/logger';
import { createAdminSession, checkAutoLoginStatus } from '@/utils/admin-auth';

// Dynamically import the admin session injector to ensure it runs client-side
const AdminSessionInjector = dynamic(
  () => import('@/components/admin/AdminSessionInjector'),
  { ssr: false }
);

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  
  useEffect(() => {
    // Check if we're on the login page - don't auto-inject on login page
    const isLoginPage = typeof window !== 'undefined' && 
      (window.location.pathname.includes('/admin/login') || 
       window.location.pathname.includes('/admin/basic-login') ||
       window.location.pathname.includes('/admin/logout'));
    
    // Log admin layout access
    logger.admin('Admin layout rendered', { 
      path: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      isLoginPage
    });
    
    // Skip session creation on login/logout pages
    if (isLoginPage) {
      logger.debug('On login/logout page, skipping admin session creation');
      return;
    }
    
    // ADMIN AUTHENTICATION - Check for admin session cookie or localStorage
    const checkAdminSession = () => {
      const cookies = document.cookie.split(';');
      const hasSessionCookie = cookies.some(cookie => cookie.trim().startsWith('adminSession=authenticated'));
      
      // Also check localStorage as backup
      const sessionLocalStorage = localStorage.getItem('adminSession');
      const sessionExpiry = localStorage.getItem('adminSessionExpiry');
      const hasValidLocalStorageSession = sessionLocalStorage === 'authenticated' && 
        sessionExpiry && parseInt(sessionExpiry) > Date.now();
      
      return hasSessionCookie || hasValidLocalStorageSession;
    };
    
    if (checkAdminSession()) {
      logger.debug('Admin session active, allowing access - no additional checks needed');
      // Ensure both cookie and localStorage are set for persistence
      const cookies = document.cookie.split(';');
      const hasSessionCookie = cookies.some(cookie => cookie.trim().startsWith('adminSession=authenticated'));
      
      if (!hasSessionCookie) {
        document.cookie = 'adminSession=authenticated; path=/; max-age=86400; SameSite=Lax';
      }
      
      // Set localStorage if missing
      if (!localStorage.getItem('adminSession')) {
        localStorage.setItem('adminSession', 'authenticated');
        localStorage.setItem('adminSessionExpiry', String(Date.now() + 86400000));
      }
      
      return; // Skip ALL other checks - this is the proper admin authentication
    }
    
    // Only run normal session logic if admin session is NOT active
    const isAutoLoginEnabled = checkAutoLoginStatus();
    
    if (!isAutoLoginEnabled) {
      logger.debug('Auto-login is disabled, redirecting to login page');
      
      // Redirect to login page if auto-login is disabled
      if (typeof window !== 'undefined' && !isLoginPage) {
        window.location.href = '/admin/login';
      }
      return;
    }
    
    // Only create admin session if auto-login is enabled and we're not on login page
    try {
      createAdminSession('admin@mopres.co.za', '73f8df24-fc99-41b2-9f5c-1a5c74c4564e');
      logger.admin('Admin session created in layout');
    } catch (error) {
      logger.error('Error setting up admin session in layout', error);
    }
  }, [router]);

  return (
    <div>
      <AdminSessionInjector />
      {children}
    </div>
  );
}