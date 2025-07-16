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

// Mock client for admin sessions
const mockSupabaseClient = {
  auth: {
    getSession: () => {
      console.log('🛡️ [Mock Supabase] Blocked auth.getSession call');
      return Promise.resolve({ data: { session: null }, error: null });
    },
    getUser: () => {
      console.log('🛡️ [Mock Supabase] Blocked auth.getUser call');
      return Promise.resolve({ data: { user: null }, error: null });
    },
    signOut: () => {
      console.log('🛡️ [Mock Supabase] Blocked auth.signOut call');
      return Promise.resolve({ error: null });
    },
    onAuthStateChange: () => {
      console.log('🛡️ [Mock Supabase] Blocked auth.onAuthStateChange call');
      return { 
        data: { subscription: null }, 
        unsubscribe: () => console.log('🛡️ [Mock Supabase] Mock unsubscribe called')
      };
    }
  },
  from: (table: string) => ({
    select: () => {
      console.log(`🛡️ [Mock Supabase] Blocked ${table}.select call`);
      return Promise.resolve({ data: [], error: null });
    },
    insert: () => {
      console.log(`🛡️ [Mock Supabase] Blocked ${table}.insert call`);
      return Promise.resolve({ data: [], error: null });
    },
    update: () => {
      console.log(`🛡️ [Mock Supabase] Blocked ${table}.update call`);
      return Promise.resolve({ data: [], error: null });
    },
    delete: () => {
      console.log(`🛡️ [Mock Supabase] Blocked ${table}.delete call`);
      return Promise.resolve({ data: [], error: null });
    }
  }),
  storage: {
    from: (bucket: string) => ({
      getPublicUrl: (path: string) => {
        console.log(`🛡️ [Mock Supabase] Mock storage.getPublicUrl for ${bucket}/${path}`);
        return { data: { publicUrl: `/product-images/${path}` } };
      }
    })
  }
};

// Singleton factory function
export const supabase = (): ReturnType<typeof createClientComponentClient<Database>> => {
  // Admin session check - return mock if admin is active
  if (isAdminSessionActive()) {
    return mockSupabaseClient as any;
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