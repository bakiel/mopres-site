import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

// Check if admin session is active IMMEDIATELY
function isAdminSessionActive(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check for disabled flag first
  if ((window as any).supabaseDisabled) {
    return true;
  }
  
  const cookies = document.cookie.split(';');
  const hasSessionCookie = cookies.some(cookie => cookie.trim().startsWith('adminSession=authenticated'));
  const hasLegacyBypass = cookies.some(cookie => cookie.trim().startsWith('adminBypass=emergency-access'));
  
  // Also check localStorage as backup
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
      console.log('🛡️ [Supabase Client] Admin session detected - blocking Supabase initialization');
      (window as any).supabaseDisabled = true;
    }
    
    return adminActive;
  } catch (e) {
    return hasSessionCookie || hasLegacyBypass;
  }
}

// Mock Supabase client for admin sessions
const mockSupabaseClient = {
  auth: {
    getSession: () => {
      console.log('🛡️ [Mock Supabase] getSession called - returning null');
      return Promise.resolve({ data: { session: null }, error: null });
    },
    getUser: () => {
      console.log('🛡️ [Mock Supabase] getUser called - returning null');
      return Promise.resolve({ data: { user: null }, error: null });
    },
    signOut: () => {
      console.log('🛡️ [Mock Supabase] signOut called - no-op');
      return Promise.resolve({ error: null });
    },
    onAuthStateChange: () => {
      console.log('🛡️ [Mock Supabase] onAuthStateChange called - returning empty subscription');
      return { data: { subscription: null }, unsubscribe: () => {} };
    }
  },
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: [], error: null }),
    update: () => Promise.resolve({ data: [], error: null }),
    delete: () => Promise.resolve({ data: [], error: null })
  }),
  storage: {
    from: () => ({
      getPublicUrl: (path: string) => ({
        data: { publicUrl: `/product-images/${path}` }
      })
    })
  }
};

// Create a singleton instance of the Supabase client
let supabaseClient: ReturnType<typeof createClientComponentClient<Database>> | null = null;

// Function to get the Supabase client (creates it only once)
export const supabase = () => {
  // IMMEDIATE CHECK - if admin session is active, return mock client
  if (isAdminSessionActive()) {
    console.log('🛡️ [Supabase Client] Returning mock client for admin session');
    return mockSupabaseClient as any;
  }
  
  // Otherwise, create real Supabase client
  if (!supabaseClient) {
    console.log('🔌 [Supabase Client] Creating real Supabase client');
    supabaseClient = createClientComponentClient<Database>();
  }
  return supabaseClient;
};

// Function to get the URL for a product image from storage
export function getProductImageUrl(imagePath: string): string {
  // If the image path is a full URL, return it
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If the image is in Supabase storage
  if (imagePath.includes('storage/')) {
    const client = supabase();
    return client.storage.from('products').getPublicUrl(imagePath).data.publicUrl;
  }
  
  // Default to local public folder
  return `/product-images/${imagePath}`;
}
