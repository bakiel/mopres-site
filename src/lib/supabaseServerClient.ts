import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
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

// Function to create a Supabase client instance for server components/actions.
// This version directly uses `cookies()` from `next/headers`.
// IMPORTANT: This function should ONLY be called from Server Components or Route Handlers
// where `next/headers` is allowed. It CANNOT be imported by client components.
export async function createSupabaseServerClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();

  return createServerClient(
    supabaseUrl!,
    supabaseAnonKey!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set(name, value, options);
          } catch (error) {
            // Errors can occur if called from a Server Component route handler after response has started streaming.
            // Middleware is a better place for setting cookies generally.
            // console.error('SupabaseServerClient: Error setting cookie:', error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set(name, '', { ...options, maxAge: 0 }); // Common way to remove by expiring
          } catch (error) {
            // console.error('SupabaseServerClient: Error removing cookie:', error);
          }
        },
      },
    }
  );
}