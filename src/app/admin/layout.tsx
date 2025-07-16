// src/app/admin/layout.tsx
'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { logger } from '@/utils/logger';
import { createAdminSession, checkAutoLoginStatus } from '@/utils/admin-auth';
import AdminSessionGuard from '@/components/admin/AdminSessionGuard';

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
    
    // CRITICAL DEBUG - Log entry point
    console.log('🎯 [Admin Layout] Entry point:', {
      path: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
      isLoginPage,
      cookies: typeof window !== 'undefined' ? document.cookie : 'unknown',
      localStorage: typeof window !== 'undefined' ? {
        adminSession: localStorage.getItem('adminSession'),
        adminSessionExpiry: localStorage.getItem('adminSessionExpiry')
      } : 'unknown'
    });
    
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
      const hasLegacyBypass = cookies.some(cookie => cookie.trim().startsWith('adminBypass=emergency-access'));
      
      // Also check localStorage as backup
      const sessionLocalStorage = localStorage.getItem('adminSession');
      const sessionExpiry = localStorage.getItem('adminSessionExpiry');
      const hasValidLocalStorageSession = sessionLocalStorage === 'authenticated' && 
        sessionExpiry && parseInt(sessionExpiry) > Date.now();
      
      // Check legacy localStorage too
      const legacyBypass = localStorage.getItem('adminBypass');
      const legacyExpiry = localStorage.getItem('adminBypassExpiry');
      const hasValidLegacyBypass = legacyBypass === 'emergency-access' && 
        legacyExpiry && parseInt(legacyExpiry) > Date.now();
      
      const result = hasSessionCookie || hasValidLocalStorageSession || hasLegacyBypass || hasValidLegacyBypass;
      
      // Enhanced debugging
      console.log('🔍 [Admin Layout] Session check:', {
        hasSessionCookie,
        hasLegacyBypass,
        hasValidLocalStorageSession,
        hasValidLegacyBypass,
        result,
        allCookies: document.cookie,
        localStorage: {
          adminSession: localStorage.getItem('adminSession'),
          adminSessionExpiry: localStorage.getItem('adminSessionExpiry'),
          legacyBypass: localStorage.getItem('adminBypass'),
          legacyExpiry: localStorage.getItem('adminBypassExpiry')
        }
      });
      
      return result;
    };
    
    if (checkAdminSession()) {
      logger.debug('Admin session active, allowing access - no additional checks needed');
      console.log('✅ [Admin Layout] Admin session found - allowing access');
      
      // Ensure both cookie and localStorage are set for persistence
      const cookies = document.cookie.split(';');
      const hasSessionCookie = cookies.some(cookie => cookie.trim().startsWith('adminSession=authenticated'));
      
      if (!hasSessionCookie) {
        document.cookie = 'adminSession=authenticated; path=/; max-age=86400; SameSite=Lax; Secure=false';
        console.log('🔄 [Admin Layout] Restored admin session cookie');
      }
      
      // Set localStorage if missing
      if (!localStorage.getItem('adminSession')) {
        localStorage.setItem('adminSession', 'authenticated');
        localStorage.setItem('adminSessionExpiry', String(Date.now() + 86400000));
        console.log('🔄 [Admin Layout] Restored admin session localStorage');
      }
      
      return; // IMMEDIATE EXIT - Admin session is active, skip ALL other logic
    }
    
    // If we get here, no admin session exists - redirect to login
    console.log('🚨 [Admin Layout] No admin session found - redirecting to login');
    logger.debug('No admin session found, redirecting to login page');
    
    if (typeof window !== 'undefined' && !isLoginPage) {
      window.location.href = '/admin/login';
    }
  }, [router]);

  return (
    <AdminSessionGuard>
      <div>
        <AdminSessionInjector />
        {children}
      </div>
    </AdminSessionGuard>
  );
}