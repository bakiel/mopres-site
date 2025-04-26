import { createBrowserClient, createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers'; // Import cookies
import type { SupabaseClient } from '@supabase/supabase-js'; // Keep type import

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
  return createBrowserClient(supabaseUrl!, supabaseAnonKey!);
}

// Remove the specific type import: import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

// Function to create a Supabase client instance for server components/actions.
// Requires the cookie store obtained from `cookies()` in the calling context.
// Let TypeScript infer the cookieStore type based on usage by createServerClient.
export function createSupabaseServerClient(cookieStore: any): SupabaseClient { // Use 'any' or let it be inferred
  // No longer call cookies() here, use the passed argument

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
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}


// We keep the utility function below, but it should ideally use an instance
// appropriate for its context (client/server). For getProductImageUrl,
// a simple client instance might be sufficient as it doesn't rely on user auth state.
// We create one instance here for that specific utility.
const supabaseInstanceForUtils = createBrowserClient(supabaseUrl!, supabaseAnonKey!);

// Optional: Export types if needed elsewhere
// export type SupabaseClient = SupabaseClient; // Type export remains valid

/**
 * Generates the public URL for an image stored in the 'product-images' bucket.
 * @param filename - The name of the image file (e.g., 'imagename.jpg').
 * @returns The public URL of the image or a placeholder path.
 */
export const getProductImageUrl = (filename: string | null | undefined): string => {
  const placeholderPath = '/placeholder.svg'; // Use SVG placeholder

  if (!filename || typeof filename !== 'string' || filename.trim() === '') {
    console.warn(`getProductImageUrl called with invalid filename: ${filename}. Falling back to placeholder.`);
    return placeholderPath;
  }

  // Clean the filename: remove leading slash and trim whitespace
  const cleanedFilename = filename.trim().startsWith('/') ? filename.trim().substring(1) : filename.trim();

  // Log the cleaned filename being processed
  console.log(`getProductImageUrl: Processing cleaned filename: "${cleanedFilename}" (original: "${filename}")`);

  // Revert to using the standard Supabase getPublicUrl method
  // Using the dedicated instance for this utility function.
  try {
    const { data } = supabaseInstanceForUtils.storage.from('product-images').getPublicUrl(cleanedFilename);
    console.log(`getProductImageUrl: Supabase getPublicUrl data for "${cleanedFilename}":`, data);

    if (!data?.publicUrl) {
      console.error(`getProductImageUrl: Failed to get public URL for image: "${cleanedFilename}". Falling back to placeholder.`);
      return placeholderPath;
    }

    console.log(`getProductImageUrl: Returning public URL: ${data.publicUrl} for filename: "${cleanedFilename}"`);
    return data.publicUrl;

  } catch (error) {
      console.error(`getProductImageUrl: Error calling getPublicUrl for "${cleanedFilename}":`, error);
      return placeholderPath;
  }
};
