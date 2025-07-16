// Singleton Supabase client to prevent multiple GoTrueClient instances
// Based on Supabase Auth documentation recommendations

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

// Global singleton instance - ONLY ONE INSTANCE EVER
let supabaseInstance: ReturnType<typeof createClientComponentClient<Database>> | null = null;
let originalAuth: any = null;
let authBypassActive = false;

// Admin session detection
function isAdminSessionActive(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Quick check for admin session markers
  const cookies = document.cookie.split(';');
  const hasAdminCookie = cookies.some(cookie => 
    cookie.trim().startsWith('adminSession=authenticated') || 
    cookie.trim().startsWith('adminBypass=emergency-access')
  );
  
  if (hasAdminCookie) {
    console.log('🛡️ [Supabase Singleton] Admin session detected via cookie');
    return true;
  }
  
  try {
    const adminSession = localStorage.getItem('adminSession');
    const adminExpiry = localStorage.getItem('adminSessionExpiry');
    const isValid = adminSession === 'authenticated' && 
      adminExpiry && parseInt(adminExpiry) > Date.now();
    
    if (isValid) {
      console.log('🛡️ [Supabase Singleton] Admin session detected via localStorage');
      return true;
    }
  } catch (e) {
    // localStorage access failed, continue with cookie check
  }
  
  return false;
}

// Bypass auth methods for admin sessions
const authBypassMethods = {
  getSession: async () => {
    console.log('🛡️ [Admin Auth Bypass] getSession blocked');
    return { data: { session: null }, error: null };
  },
  getUser: async () => {
    console.log('🛡️ [Admin Auth Bypass] getUser blocked');
    return { data: { user: null }, error: null };
  },
  signOut: async () => {
    console.log('🛡️ [Admin Auth Bypass] signOut blocked');
    return { error: null };
  },
  onAuthStateChange: () => {
    console.log('🛡️ [Admin Auth Bypass] onAuthStateChange blocked');
    return { 
      data: { subscription: null }, 
      unsubscribe: () => {}
    };
  },
  signIn: async () => {
    console.log('🛡️ [Admin Auth Bypass] signIn blocked');
    return { data: { user: null, session: null }, error: null };
  },
  signInWithPassword: async () => {
    console.log('🛡️ [Admin Auth Bypass] signInWithPassword blocked');
    return { data: { user: null, session: null }, error: null };
  },
  signInWithOAuth: async () => {
    console.log('🛡️ [Admin Auth Bypass] signInWithOAuth blocked');
    return { data: { url: null, provider: null }, error: null };
  },
  signUp: async () => {
    console.log('🛡️ [Admin Auth Bypass] signUp blocked');
    return { data: { user: null, session: null }, error: null };
  },
  resetPasswordForEmail: async () => {
    console.log('🛡️ [Admin Auth Bypass] resetPasswordForEmail blocked');
    return { data: null, error: null };
  },
  updateUser: async () => {
    console.log('🛡️ [Admin Auth Bypass] updateUser blocked');
    return { data: { user: null }, error: null };
  },
  setSession: async () => {
    console.log('🛡️ [Admin Auth Bypass] setSession blocked');
    return { data: { session: null }, error: null };
  },
  refreshSession: async () => {
    console.log('🛡️ [Admin Auth Bypass] refreshSession blocked');
    return { data: { session: null }, error: null };
  },
  // Keep admin operations if they exist
  admin: originalAuth?.admin
};

// Singleton factory function - ALWAYS returns the same instance
export const supabase = (): ReturnType<typeof createClientComponentClient<Database>> => {
  // Create the instance only once
  if (!supabaseInstance) {
    console.log('🔌 [Supabase Singleton] Creating THE ONLY Supabase client instance');
    supabaseInstance = createClientComponentClient<Database>();
    originalAuth = { ...supabaseInstance.auth };
  }
  
  // Check if we need to apply/remove auth bypass
  const shouldBypass = isAdminSessionActive();
  
  if (shouldBypass && !authBypassActive) {
    console.log('🛡️ [Supabase Singleton] Activating auth bypass for admin session');
    authBypassActive = true;
    // Apply bypass methods while keeping other auth properties
    supabaseInstance.auth = {
      ...originalAuth,
      ...authBypassMethods,
      admin: originalAuth.admin // Preserve admin methods if they exist
    } as any;
  } else if (!shouldBypass && authBypassActive) {
    console.log('🔓 [Supabase Singleton] Removing auth bypass - no admin session');
    authBypassActive = false;
    // Restore original auth
    supabaseInstance.auth = originalAuth;
  }
  
  return supabaseInstance;
};

// Reset function for testing/admin session changes
export const resetSupabaseInstance = () => {
  console.log('🔄 [Supabase Singleton] Resetting instance');
  supabaseInstance = null;
  originalAuth = null;
  authBypassActive = false;
  delete (window as any).__supabase_client_created__;
};

// Prevent multiple client creation globally
if (typeof window !== 'undefined') {
  (window as any).__supabase_singleton_active__ = true;
}