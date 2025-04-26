import { createClient } from '@supabase/supabase-js';

// Ensure environment variables are defined
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL");
}

if (!supabaseAnonKey) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Optional: Export types if needed elsewhere
export type SupabaseClient = typeof supabase;

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
  try {
    const { data } = supabase.storage.from('product-images').getPublicUrl(cleanedFilename);
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
