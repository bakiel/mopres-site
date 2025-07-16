'use client';

import { useEffect } from 'react';
import { logger } from '@/utils/logger';

export default function AdminSessionKeeper() {
  useEffect(() => {
    // Keep session alive
    const checkSession = () => {
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
      
      // Clean up expired localStorage bypass
      if (bypassExpiry && parseInt(bypassExpiry) <= Date.now()) {
        localStorage.removeItem('adminBypass');
        localStorage.removeItem('adminBypassExpiry');
      }
    };
    
    // Check immediately
    checkSession();
    
    // Check every 5 seconds to prevent session loss
    const interval = setInterval(checkSession, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  return null;
}