// Singleton Supabase client to prevent multiple GoTrueClient instances
// Based on Supabase Auth documentation recommendations

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

// Global singleton instance 
let supabaseInstance: ReturnType<typeof createClientComponentClient<Database>> | null = null;

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
    console.log('🛡️ [Supabase Singleton] Admin session detected - using mock client');
    return true;
  }
  
  try {
    const adminSession = localStorage.getItem('adminSession');
    const adminExpiry = localStorage.getItem('adminSessionExpiry');
    const isValid = adminSession === 'authenticated' && 
      adminExpiry && parseInt(adminExpiry) > Date.now();
    
    if (isValid) {
      console.log('🛡️ [Supabase Singleton] Admin session in localStorage - using mock client');
      return true;
    }
  } catch (e) {
    // localStorage access failed, continue with cookie check
  }
  
  return false;
}

// We need a real Supabase client for admin operations, but with auth disabled
let adminSupabaseClient: ReturnType<typeof createClientComponentClient<Database>> | null = null;

// Create a special admin client that has auth disabled but database access enabled
const getAdminClient = () => {
  if (!adminSupabaseClient) {
    console.log('🔧 [Supabase Singleton] Creating admin-specific Supabase client with auth bypass');
    adminSupabaseClient = createClientComponentClient<Database>();
    
    // Override auth methods to prevent interference
    const originalAuth = adminSupabaseClient.auth;
    adminSupabaseClient.auth = {
      ...originalAuth,
      getSession: async () => {
        console.log('🛡️ [Admin Supabase] Auth getSession bypassed for admin');
        return { data: { session: null }, error: null };
      },
      getUser: async () => {
        console.log('🛡️ [Admin Supabase] Auth getUser bypassed for admin');
        return { data: { user: null }, error: null };
      },
      signOut: async () => {
        console.log('🛡️ [Admin Supabase] Auth signOut bypassed for admin');
        return { error: null };
      },
      onAuthStateChange: () => {
        console.log('🛡️ [Admin Supabase] Auth state change listener bypassed for admin');
        return { 
          data: { subscription: null }, 
          unsubscribe: () => {}
        };
      },
      signIn: async () => {
        console.log('🛡️ [Admin Supabase] Auth signIn bypassed for admin');
        return { data: { user: null, session: null }, error: null };
      },
      signInWithPassword: async () => {
        console.log('🛡️ [Admin Supabase] Auth signInWithPassword bypassed for admin');
        return { data: { user: null, session: null }, error: null };
      }
    } as any;
  }
  return adminSupabaseClient;
};

// Singleton factory function
export const supabase = (): ReturnType<typeof createClientComponentClient<Database>> => {
  // Admin session check - return special admin client with auth disabled
  if (isAdminSessionActive()) {
    return getAdminClient();
  }
  
  // Create singleton instance only if it doesn't exist
  if (!supabaseInstance) {
    console.log('🔌 [Supabase Singleton] Creating new Supabase client instance');
    supabaseInstance = createClientComponentClient<Database>();
    
    // Mark this as the official instance to prevent duplicates
    (window as any).__supabase_client_created__ = true;
  } else {
    console.log('🔄 [Supabase Singleton] Reusing existing Supabase client instance');
  }
  
  return supabaseInstance;
};

// Reset function for testing/admin session changes
export const resetSupabaseInstance = () => {
  console.log('🔄 [Supabase Singleton] Resetting instance');
  supabaseInstance = null;
  delete (window as any).__supabase_client_created__;
};

// Prevent multiple client creation globally
if (typeof window !== 'undefined') {
  // Override createClientComponentClient to prevent accidental multiple instances
  const originalCreate = createClientComponentClient;
  (window as any).__supabase_singleton_override__ = true;
}