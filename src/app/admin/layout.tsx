// src/app/admin/layout.tsx
'use client';

// CRITICAL: Import early guard FIRST to prevent Supabase initialization
import '@/lib/supabase-early-guard';

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
      const timestamp = new Date().toISOString();
      console.log(`\n🕐 [${timestamp}] Admin Layout Session Check Started`);
      
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
      
      // Enhanced debugging with detailed info
      console.log('📋 [Admin Layout] Detailed Session Info:', {
        timestamp,
        url: window.location.href,
        hasSessionCookie,
        hasLegacyBypass,
        hasValidLocalStorageSession,
        hasValidLegacyBypass,
        finalResult: result,
        cookieDetails: {
          raw: document.cookie,
          parsed: cookies.map(c => c.trim()),
          adminSessionFound: cookies.find(c => c.trim().includes('adminSession'))?.trim()
        },
        localStorageDetails: {
          adminSession: sessionLocalStorage,
          adminSessionExpiry: sessionExpiry,
          expiryDate: sessionExpiry ? new Date(parseInt(sessionExpiry)).toISOString() : null,
          isExpired: sessionExpiry ? parseInt(sessionExpiry) < Date.now() : null
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
        const isProduction = window.location.hostname !== 'localhost';
        const cookieString = `adminSession=authenticated; path=/; max-age=86400; SameSite=Lax${isProduction ? '; Secure' : ''}`;
        document.cookie = cookieString;
        console.log('🔄 [Admin Layout] Restored admin session cookie with settings:', cookieString);
      }
      
      // Set localStorage if missing
      if (!localStorage.getItem('adminSession')) {
        localStorage.setItem('adminSession', 'authenticated');
        localStorage.setItem('adminSessionExpiry', String(Date.now() + 86400000));
        console.log('🔄 [Admin Layout] Restored admin session localStorage');
      }
      
      // Start session keeper to maintain the session
      const sessionKeeper = setInterval(() => {
        if (!checkAdminSession()) {
          console.log('⚠️ [Admin Layout] Session lost! Attempting to restore...');
          clearInterval(sessionKeeper);
        } else {
          // Refresh the cookie to keep it alive
          const isProduction = window.location.hostname !== 'localhost';
          const cookieString = `adminSession=authenticated; path=/; max-age=86400; SameSite=Lax${isProduction ? '; Secure' : ''}`;
          document.cookie = cookieString;
        }
      }, 5000); // Check every 5 seconds
      
      return () => clearInterval(sessionKeeper); // Cleanup on unmount
    }
    
    // If we get here, no admin session exists - redirect to login
    console.log('🚨 [Admin Layout] No admin session found - redirecting to login');
    logger.debug('No admin session found, redirecting to login page');
    
    if (typeof window !== 'undefined' && !isLoginPage) {
      // Add a small delay to ensure cookies are checked
      setTimeout(() => {
        // Double check before redirecting
        if (!checkAdminSession()) {
          console.log('🚨 [Admin Layout] Confirmed no session - redirecting now');
          window.location.href = '/admin/login';
        } else {
          console.log('✅ [Admin Layout] Session found on second check - not redirecting');
        }
      }, 100);
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