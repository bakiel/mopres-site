'use client';

import { useEffect } from 'react';
import { logger } from '@/utils/logger';

export default function AdminSessionKeeper() {
  useEffect(() => {
    // Keep admin session alive - maintenance approach
    const maintainAdminSession = () => {
      // Check for session in localStorage
      const sessionLocalStorage = localStorage.getItem('adminSession');
      const sessionExpiry = localStorage.getItem('adminSessionExpiry');
      const hasValidLocalStorageSession = sessionLocalStorage === 'authenticated' && 
        sessionExpiry && parseInt(sessionExpiry) > Date.now();
      
      // Check for session cookie
      const cookies = document.cookie.split(';');
      const hasSessionCookie = cookies.some(cookie => cookie.trim().startsWith('adminSession=authenticated'));
      
      // If we have valid session in localStorage but not in cookie, restore cookie
      if (hasValidLocalStorageSession && !hasSessionCookie) {
        document.cookie = 'adminSession=authenticated; path=/; max-age=86400; SameSite=Lax';
        logger.debug('Restored admin session cookie from localStorage');
      }
      
      // If we have session cookie but not localStorage, restore localStorage
      if (hasSessionCookie && !hasValidLocalStorageSession) {
        localStorage.setItem('adminSession', 'authenticated');
        localStorage.setItem('adminSessionExpiry', String(Date.now() + 86400000));
        logger.debug('Restored admin session localStorage from cookie');
      }
      
      // Clean up expired localStorage session
      if (sessionExpiry && parseInt(sessionExpiry) <= Date.now()) {
        localStorage.removeItem('adminSession');
        localStorage.removeItem('adminSessionExpiry');
        logger.debug('Cleared expired admin session from localStorage');
      }
      
      // Extra protection: if we're on an admin page without session, redirect to login
      const isAdminPage = window.location.pathname.startsWith('/admin') && 
                         !window.location.pathname.includes('/admin/login');
      
      if (isAdminPage && !hasValidLocalStorageSession && !hasSessionCookie) {
        logger.warn('Admin page accessed without session - redirecting to login');
        // Add a small delay to prevent race conditions
        setTimeout(() => {
          window.location.href = '/admin/login';
        }, 100);
      }
    };
    
    // Check immediately
    maintainAdminSession();
    
    // Check every 2 seconds to prevent session loss
    const interval = setInterval(maintainAdminSession, 2000);
    
    // Also check on focus/visibility change
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        maintainAdminSession();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  return null;
}