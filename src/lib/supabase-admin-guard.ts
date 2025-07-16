// Supabase client wrapper that respects admin sessions

import { createClient } from '@supabase/supabase-js';

// Check if admin session is active
function isAdminSessionActive(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check for disabled flag first
  if ((window as any).supabaseDisabled) {
    console.log('🛡️ [Supabase Guard] Supabase disabled by admin session');
    return true;
  }
  
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
  
  const adminActive = hasSessionCookie || hasValidLocalStorageSession || hasLegacyBypass || hasValidLegacyBypass;
  
  if (adminActive) {
    console.log('🛡️ [Supabase Guard] Admin session detected - blocking Supabase');
    (window as any).supabaseDisabled = true;
  }
  
  return adminActive;
}

// Mock Supabase client for admin sessions
const mockSupabaseClient = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    signOut: () => Promise.resolve({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: null }, unsubscribe: () => {} })
  },
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: [], error: null }),
    update: () => Promise.resolve({ data: [], error: null }),
    delete: () => Promise.resolve({ data: [], error: null })
  })
};

export function createSupabaseClient() {
  // If admin session is active, return mock client
  if (isAdminSessionActive()) {
    console.log('🛡️ [Supabase Guard] Returning mock client for admin session');
    return mockSupabaseClient;
  }
  
  // Otherwise, return real Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  return createClient(supabaseUrl, supabaseAnonKey);
}

// Singleton instance
let supabaseInstance: any = null;

export function supabase() {
  if (!supabaseInstance) {
    supabaseInstance = createSupabaseClient();
  }
  return supabaseInstance;
}

// Reset instance when admin session changes
export function resetSupabaseInstance() {
  supabaseInstance = null;
}