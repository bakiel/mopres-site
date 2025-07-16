'use client';

import { useEffect } from 'react';
import { logger } from '@/utils/logger';

export default function AdminSessionKeeper() {
  useEffect(() => {
    // Keep session alive - more aggressive approach
    const maintainBypass = () => {
      // Check for bypass in localStorage
      const bypassLocalStorage = localStorage.getItem('adminBypass');
      const bypassExpiry = localStorage.getItem('adminBypassExpiry');
      const hasValidLocalStorageBypass = bypassLocalStorage === 'emergency-access' && 
        bypassExpiry && parseInt(bypassExpiry) > Date.now();
      
      // Check for bypass cookie
      const cookies = document.cookie.split(';');
      const hasBypassCookie = cookies.some(cookie => cookie.trim().startsWith('adminBypass=emergency-access'));
      
      // If we have valid bypass in localStorage but not in cookie, restore cookie
      if (hasValidLocalStorageBypass && !hasBypassCookie) {
        document.cookie = 'adminBypass=emergency-access; path=/; max-age=86400; SameSite=Lax';
        logger.debug('Restored admin bypass cookie from localStorage');
      }
      
      // If we have bypass cookie but not localStorage, restore localStorage
      if (hasBypassCookie && !hasValidLocalStorageBypass) {
        localStorage.setItem('adminBypass', 'emergency-access');
        localStorage.setItem('adminBypassExpiry', String(Date.now() + 86400000));
        logger.debug('Restored admin bypass localStorage from cookie');
      }
      
      // Clean up expired localStorage bypass
      if (bypassExpiry && parseInt(bypassExpiry) <= Date.now()) {
        localStorage.removeItem('adminBypass');
        localStorage.removeItem('adminBypassExpiry');
        logger.debug('Cleared expired admin bypass from localStorage');
      }
      
      // Extra protection: if we're on an admin page without bypass, redirect to login
      const isAdminPage = window.location.pathname.startsWith('/admin') && 
                         !window.location.pathname.includes('/admin/login');
      
      if (isAdminPage && !hasValidLocalStorageBypass && !hasBypassCookie) {
        logger.warn('Admin page accessed without bypass - redirecting to login');
        window.location.href = '/admin/login';
      }
    };
    
    // Check immediately
    maintainBypass();
    
    // Check every 2 seconds to prevent session loss
    const interval = setInterval(maintainBypass, 2000);
    
    // Also check on focus/visibility change
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        maintainBypass();
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