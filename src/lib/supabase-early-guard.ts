// Early guard that runs before any Supabase imports
// This must be imported FIRST in the app

if (typeof window !== 'undefined') {
  // Set up early admin session detection
  const checkEarlyAdminSession = () => {
    const cookies = document.cookie.split(';');
    const hasSessionCookie = cookies.some(cookie => cookie.trim().startsWith('adminSession=authenticated'));
    const hasLegacyBypass = cookies.some(cookie => cookie.trim().startsWith('adminBypass=emergency-access'));
    
    try {
      const sessionLocalStorage = localStorage.getItem('adminSession');
      const sessionExpiry = localStorage.getItem('adminSessionExpiry');
      const hasValidLocalStorageSession = sessionLocalStorage === 'authenticated' && 
        sessionExpiry && parseInt(sessionExpiry) > Date.now();
      
      const legacyBypass = localStorage.getItem('adminBypass');
      const legacyExpiry = localStorage.getItem('adminBypassExpiry');
      const hasValidLegacyBypass = legacyBypass === 'emergency-access' && 
        legacyExpiry && parseInt(legacyExpiry) > Date.now();
      
      const adminActive = hasSessionCookie || hasValidLocalStorageSession || hasLegacyBypass || hasValidLegacyBypass;
      
      if (adminActive) {
        console.log('🛡️ [Early Guard] Admin session detected - setting global Supabase block');
        (window as any).supabaseDisabled = true;
        
        // Set a flag to indicate admin mode is active
        console.log('🛡️ [Early Guard] Admin session active - Supabase auth will be bypassed');
        
        // Set a flag to indicate admin mode is active
        (window as any).__admin_session_active__ = true;
      }
      
      return adminActive;
    } catch (e) {
      return hasSessionCookie || hasLegacyBypass;
    }
  };
  
  // Run the check immediately
  checkEarlyAdminSession();
  
  // Also run on DOM content loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkEarlyAdminSession);
  } else {
    checkEarlyAdminSession();
  }
}

export {};