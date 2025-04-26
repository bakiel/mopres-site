import React from 'react';
import Link from 'next/link';
import Button from '@/components/Button';
import SectionTitle from '@/components/SectionTitle';
import { supabase, getProductImageUrl } from '@/lib/supabaseClient'; // Import shared function

// Define a type for the collection data
type Collection = {
  id: string;
  name: string;
  slug: string;
  description?: string; // Optional description
  image: string; // Assuming image is a path in storage
};

// Make the component async to fetch data
export default async function CollectionsListPage() {
  let collections: Collection[] = [];
  let fetchError: string | null = null;

  try {
    // Fetch all collections from Supabase
    const { data, error } = await supabase
      .from('collections')
      .select('id, name, slug, description, image') // Select necessary fields
      .order('name', { ascending: true }); // Order alphabetically by name

    if (error) {
      console.error("Supabase fetch error (Collections Page):", error);
      throw new Error(error.message);
    }
    collections = data || [];
  } catch (error: any) {
    console.error("Error fetching collections:", error);
    fetchError = "Could not load collections at this time.";
  }

  return (
    <div className="bg-background-body py-12 lg:py-20">
      <div className="w-full max-w-screen-xl mx-auto px-4">
        <SectionTitle centered>Explore Our Collections</SectionTitle>

        {fetchError ? (
          <p className="text-center text-red-600">{fetchError}</p>
        ) : collections.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Map over fetched collections */}
            {collections.map((collection) => (
              <div key={collection.id} className="collection-card relative border border-border-light overflow-hidden group">
                <img
                  src={getProductImageUrl(collection.image)} // Use shared function
                  alt={collection.name}
                  loading="lazy"
                  className="w-full h-64 object-cover transition-transform duration-std ease-in-out group-hover:scale-105" // Fixed height for consistency
                />
                <div className="collection-overlay absolute inset-0 bg-gradient-to-t from-black/75 to-transparent flex flex-col justify-end items-center text-center p-8 transition-opacity duration-std ease-in-out opacity-100 group-hover:opacity-100"> {/* Keep overlay visible */}
                  <h3 className="font-montserrat text-2xl text-white font-semibold mb-4 text-shadow-sm">{collection.name}</h3>
                  {/* Optional: Display description if available */}
                  {/* {collection.description && <p className="text-white/80 text-sm mb-4 hidden md:block">{collection.description}</p>} */}
                  <Button
                    href={`/shop/collections/${collection.slug}`}
                    variant="outline-light"
                    className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-std ease-in-out"
                  >
                    Shop Collection
                  </Button>
                </div>
                 {/* Link overlay for clicking the whole card */}
                 <Link href={`/shop/collections/${collection.slug}`} className="absolute inset-0 z-10" aria-label={`View ${collection.name} collection`}></Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-text-light">No collections found.</p>
        )}
      </div>
    </div>
  );
}
