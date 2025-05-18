import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

// Create a singleton instance of the Supabase client
let supabaseClient: ReturnType<typeof createClientComponentClient<Database>> | null = null;

// Function to get the Supabase client (creates it only once)
export const supabase = () => {
  if (!supabaseClient) {
    supabaseClient = createClientComponentClient<Database>();
    console.log('Supabase client created (singleton)');
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
