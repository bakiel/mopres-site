import { supabase } from '@/lib/supabase-singleton';
import type { SupabaseClient } from '@supabase/supabase-js';

// Function to get the Supabase client instance for browser components.
// This now uses the singleton to prevent multiple instances.
export function createSupabaseBrowserClient(): SupabaseClient {
  console.log('[SupabaseClient] Getting browser client from singleton');
  return supabase() as SupabaseClient;
}