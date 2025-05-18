import type { SupabaseClient } from '@supabase/supabase-js'; // Keep type import

// This file can now be used for shared Supabase utilities that don't involve client creation
// or server-only/client-only imports.

// Optional: Export types if needed elsewhere
// export type { SupabaseClient } from '@supabase/supabase-js'; // Re-export if needed

/**
 * Generates the public URL for an image stored in the 'product-images' bucket.
 * @param supabase - An initialized Supabase client instance (server or browser).
 * @param filename - The name of the image file (e.g., 'imagename.jpg').
 * @returns The public URL of the image or a placeholder path.
 */
export const getProductImageUrl = (supabase: SupabaseClient, filename: string | null | undefined): string => {
  const placeholderPath = '/placeholder.svg'; // Use SVG placeholder

  if (!supabase) {
    console.error("getProductImageUrl: Supabase client instance is required.");
    return placeholderPath;
  }

  if (!filename || typeof filename !== 'string' || filename.trim() === '') {
    console.warn(`getProductImageUrl called with invalid filename: ${filename}. Falling back to placeholder.`);
    return placeholderPath;
  }

  // Clean the filename: remove leading slash and trim whitespace
  const cleanedFilename = filename.trim().startsWith('/') ? filename.trim().substring(1) : filename.trim();

  // Log the cleaned filename being processed
  console.log(`getProductImageUrl: Processing cleaned filename: "${cleanedFilename}" (original: "${filename}")`);

  // Use the provided Supabase client instance
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
