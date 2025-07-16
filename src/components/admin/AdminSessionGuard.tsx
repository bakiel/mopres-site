'use client';

import React, { useEffect, useState } from 'react';

interface AdminSessionGuardProps {
  children: React.ReactNode;
}

export default function AdminSessionGuard({ children }: AdminSessionGuardProps) {
  const [isAdminSession, setIsAdminSession] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for admin session IMMEDIATELY to prevent Supabase interference
    const checkAdminSession = () => {
      const cookies = document.cookie.split(';');
      const hasSessionCookie = cookies.some(cookie => cookie.trim().startsWith('adminSession=authenticated'));
      const hasLegacyBypass = cookies.some(cookie => cookie.trim().startsWith('adminBypass=emergency-access'));
      
      // Also check localStorage as backup
      const sessionLocalStorage = localStorage.getItem('adminSession');
      const sessionExpiry = localStorage.getItem('adminSessionExpiry');
      const hasValidLocalStorageSession = sessionLocalStorage === 'authenticated' && 
        sessionExpiry && parseInt(sessionExpiry) > Date.now();
      
      const legacyBypass = localStorage.getItem('adminBypass');
      const legacyExpiry = localStorage.getItem('adminBypassExpiry');
      const hasValidLegacyBypass = legacyBypass === 'emergency-access' && 
        legacyExpiry && parseInt(legacyExpiry) > Date.now();
      
      const adminSessionActive = hasSessionCookie || hasValidLocalStorageSession || hasLegacyBypass || hasValidLegacyBypass;
      
      console.log('🛡️ [AdminSessionGuard] Admin session check:', {
        adminSessionActive,
        hasSessionCookie,
        hasValidLocalStorageSession,
        hasLegacyBypass,
        hasValidLegacyBypass
      });
      
      setIsAdminSession(adminSessionActive);
      setIsLoading(false);
      
      // If admin session is active, disable any Supabase clients
      if (adminSessionActive) {
        console.log('🛡️ [AdminSessionGuard] Admin session active - blocking Supabase');
        
        // Prevent Supabase from initializing by overriding the global
        (window as any).supabaseDisabled = true;
        
        // Clear any existing Supabase auth state
        try {
          localStorage.removeItem('supabase.auth.token');
          localStorage.removeItem('sb-' + process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.replace('.', '-') + '-auth-token');
        } catch (e) {
          console.log('Could not clear Supabase auth tokens:', e);
        }
      }
    };

    checkAdminSession();
    
    // Re-check every 2 seconds to maintain guard
    const interval = setInterval(checkAdminSession, 2000);
    
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // If NOT admin session, allow normal Supabase flow
  if (!isAdminSession) {
    return <>{children}</>;
  }

  // If admin session is active, render without Supabase interference
  return (
    <div className="admin-session-protected">
      {children}
    </div>
  );
}