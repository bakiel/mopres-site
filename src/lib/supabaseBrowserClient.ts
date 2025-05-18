import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

// Ensure environment variables are defined
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL");
}

if (!supabaseAnonKey) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

// Function to create a Supabase client instance for browser components.
// Call this within client components or useEffect hooks.
export function createSupabaseBrowserClient(): SupabaseClient {
  // Log the values being used for client creation
  console.log('[SupabaseClient] Creating browser client with URL:', supabaseUrl);
  // Consider logging only a portion or its presence for security.
  console.log('[SupabaseClient] Using Anon Key (presence check):', !!supabaseAnonKey);

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[SupabaseClient] CRITICAL: Supabase URL or Anon Key is missing when creating browser client!');
  }

  return createBrowserClient(supabaseUrl!, supabaseAnonKey!);
}