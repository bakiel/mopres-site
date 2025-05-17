// mopres-nextjs/update_scarlet_images.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env file in the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use Service Role Key

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase URL or Service Role Key environment variables.');
  console.error('Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in the .env file.');
  process.exit(1);
}

// Initialize Supabase client using the Service Role Key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    // Prevent client initialization with service key on the browser
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

// Heel Height mapping (extracted from descriptions)
const heelHeightUpdates = [
  { name: "Bow Envy", heelHeight: 9.5 },
  { name: "Red Leopard Pumps", heelHeight: 8.5 },
  { name: "Black Buckled Mule", heelHeight: 8 },
  { name: "Silver Radiance", heelHeight: 9.5 },
  { name: "Scarlet Solo", heelHeight: 9.5 },
  { name: "Nude Crystal Sling-back", heelHeight: 8 },
  { name: "Bow Temptation", heelHeight: 8.5 },
  { name: "Ivory Grace", heelHeight: 9 },
  { name: "Scarlet Classic", heelHeight: 10 },
  { name: "Beige Classic", heelHeight: 9 },
  { name: "Bow Charm Gold", heelHeight: 9 },
  { name: "Brown Leopard Pumps", heelHeight: 8.5 },
  { name: "Crystal Sandal", heelHeight: 8 },
  { name: "Rosy Bow", heelHeight: 8.5 },
  { name: "Crystal Shine", heelHeight: 8.5 },
  { name: "Scarlet Show 12cm", heelHeight: 12 },
  { name: "Pink Crystal Sling-back", heelHeight: 8 },
  { name: "Beige Buckled Ankle-strap", heelHeight: 8 },
  { name: "Elevated Glam Black", heelHeight: 11 },
  { name: "Pink Melody", heelHeight: 8.5 },
  { name: "Scarlet Rhinestone", heelHeight: 8.5 },
  { name: "Scarlet Bow", heelHeight: 9 },
  { name: "Black Lustre", heelHeight: 9 },
  { name: "Beige Signature", heelHeight: 8.5 },
  { name: "Blush Sandal", heelHeight: 9 },
  { name: "Elevated Glam Red", heelHeight: 11 },
  // Add Black Chic Flat as 1cm? Or leave NULL? Assuming 1 for now.
  { name: "Black Chic Flat", heelHeight: 1 }
];

// Column name for heel height
const heelHeightColumn = 'heel_height';

async function updateProductHeelHeights() {
  console.log('Starting product heel height update...');
  let successCount = 0;
  let errorCount = 0;
  let notFoundCount = 0;

  for (const update of heelHeightUpdates) {
    if (update.heelHeight === undefined || update.heelHeight === null) {
      console.log(`Skipping "${update.name}" due to missing heel height data.`);
      continue;
    }
    try {
      console.log(`Attempting to update "${update.name}" with heel height ${update.heelHeight}cm...`);
      const { data, error, count } = await supabase
        .from('products')
        .update({ [heelHeightColumn]: update.heelHeight })
        .eq('name', update.name)
        .select('*', { count: 'exact', head: true }); // Check if row exists without fetching data

      if (error) {
        throw error; // Throw error to be caught below
      }

      // Check if the update matched any rows. 'count' might be null if RLS prevents seeing the row even with service key?
      // A safer check might be to see if the update itself returned data or error.
      // Let's refine the check based on typical Supabase update behavior.
      // If the update completes without error but affects 0 rows, it means the 'eq' condition didn't match.

      // Re-fetch the count specifically for the filter condition to be sure
       const { count: matchCount, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('name', update.name);

       if (countError) {
           console.error(`Error checking existence for "${update.name}":`, countError.message);
           // Decide how to handle this - maybe skip or count as error? Counting as error for now.
           errorCount++;
           continue;
       }


      if (matchCount !== null && matchCount > 0) {
        // If the row exists, the previous update call should have worked (assuming no other errors)
        console.log(`Successfully updated heel height for "${update.name}".`);
        successCount++;
      } else {
        console.warn(`Warning: No product found with name "${update.name}". Update skipped.`);
        notFoundCount++;
      }

    } catch (error) {
      console.error(`Error updating heel height for product "${update.name}":`, error.message || error);
      errorCount++;
    }
  }

  console.log('\n--- Heel Height Update Summary ---');
  console.log(`Successfully updated: ${successCount}`);
  console.log(`Errors encountered: ${errorCount}`);
  console.log(`Products not found/skipped: ${notFoundCount}`);
  console.log(`Products skipped (missing data): ${heelHeightUpdates.length - successCount - errorCount - notFoundCount}`);
  console.log('----------------------------------');

  if (errorCount > 0) {
    console.error('Update process completed with errors.');
    process.exit(1); // Exit with error code if any updates failed
  } else {
    console.log('Update process completed successfully.');
  }
}

updateProductHeelHeights();