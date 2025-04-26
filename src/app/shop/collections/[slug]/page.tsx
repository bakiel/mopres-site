import React from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Import next/image
import Button from '@/components/Button';
import SectionTitle from '@/components/SectionTitle';
import { cookies } from 'next/headers'; // Import cookies
// Remove auth-helpers import: import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { createSupabaseServerClient, getProductImageUrl } from '@/lib/supabaseClient'; // Import server client factory and helper
import { notFound } from 'next/navigation'; // Import notFound for handling missing collections
import { Suspense } from 'react'; // Import Suspense

// Define types (can be moved to a types file later)
type Collection = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image: string;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
};

// Define props type for the page component, including searchParams
interface CollectionPageProps {
  params: {
    slug: string;
  };
  searchParams: {
    page?: string;
  };
}

const ITEMS_PER_PAGE = 12; // Define items per page

// Make the component async to fetch data based on the slug and searchParams
export default async function CollectionPage({ params, searchParams }: CollectionPageProps) {
  // Create Supabase client INSIDE the component function scope using the ssr factory
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore); // Use the ssr client factory

  // Destructure params and searchParams correctly
  const slug = params.slug;
  const currentPage = parseInt(searchParams?.page || '1', 10); // Add optional chaining for safety
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  let collection: Collection | null = null;
  let products: Product[] = [];
  let totalProducts = 0;
  let fetchError: string | null = null;

  try {
    // 1. Fetch the collection details by slug
    const { data: collectionData, error: collectionError } = await supabase
      .from('collections')
      .select('id, name, slug, description, image')
      .eq('slug', slug)
      .single(); // Expect only one collection per slug

    if (collectionError || !collectionData) {
      console.error("Supabase fetch error (Collection Details):", collectionError);
      if (collectionError?.code === 'PGRST116') { // Code for 'No rows found'
        notFound(); // Trigger Next.js 404 page if collection doesn't exist
      }
      throw new Error(collectionError?.message || "Collection not found");
    }
    collection = collectionData;

    // 2. Fetch products belonging to this collection with pagination
    const { data: productsData, error: productsError, count } = await supabase
      .from('products')
      .select('id, name, slug, price, images', { count: 'exact' }) // Select necessary fields and count
      .eq('collection_id', collection.id) // Filter by collection ID
      .order('created_at', { ascending: false })
      .range(offset, offset + ITEMS_PER_PAGE - 1); // Apply range for pagination

    if (productsError) {
      console.error("Supabase fetch error (Collection Products):", productsError);
      throw new Error(productsError.message);
    }
    products = productsData || [];
    totalProducts = count || 0; // Get the total count

  } catch (error: any) {
    console.error(`Error fetching data for collection "${slug}":`, error);
    // If notFound() was called, this part might not execute, but good for other errors
    fetchError = `Could not load data for the "${slug}" collection.`;
    // Avoid setting collection/products if the error wasn't just 'not found'
    if (error.message !== "Collection not found") {
        collection = null;
        products = [];
    }
  }

  // If collection fetch failed but wasn't a 'not found' error, show error message
  if (!collection && fetchError) {
    return (
      <div className="bg-background-body py-12 lg:py-20">
        <div className="w-full max-w-screen-xl mx-auto px-4 text-center">
          <p className="text-red-600">{fetchError}</p>
          <Link href="/shop/collections" className="mt-4 inline-block text-brand-gold hover:underline">
            Back to Collections
          </Link>
        </div>
      </div>
    );
  }

  // If collection is still null after checks (should have triggered notFound), handle defensively
  if (!collection) {
     notFound();
  }

  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

  // Ensure the return statement has a single root element
  return (
    <div className="bg-background-body py-12 lg:py-20">
      <div className="w-full max-w-screen-xl mx-auto px-4">
        {/* Collection Header */}
        <div className="mb-12 text-center">
          <SectionTitle centered>{collection.name}</SectionTitle>
          {collection.description && (
            <p className="mt-4 text-lg text-text-light max-w-3xl mx-auto font-poppins">{collection.description}</p>
          )}
          {/* Optional: Display collection image as a banner? */}
          {/* <img src={getCollectionImageUrl(collection.image)} alt={`${collection.name} banner`} className="mt-6 w-full h-48 object-cover rounded"/> */}
        </div>

        {/* Product Grid */}
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <div key={product.id} className="product-card bg-white p-4 pb-8 border border-border-light transition-transform duration-std ease-in-out hover:-translate-y-1 hover:shadow-xl flex flex-col">
                  <Link href={`/shop/products/${product.slug}`} className="block mb-6 aspect-square overflow-hidden group relative"> {/* Added relative for Image fill */}
                    <Image
                      src={getProductImageUrl(product.images?.[0])}
                      alt={product.name}
                      fill // Use fill layout
                      style={{ objectFit: 'cover' }} // Ensure image covers the area
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 25vw" // Provide sizes hint
                      className="transition-transform duration-std ease-in-out group-hover:scale-105"
                    />
                  </Link>
                  <div className="flex-grow flex flex-col">
                    <h3 className="font-montserrat text-base font-medium mb-3 truncate flex-grow">{product.name}</h3>
                    <p className="price text-base text-brand-gold mb-5 font-poppins">
                      {new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(product.price)}
                    </p>
                    <Button href={`/shop/products/${product.slug}`} variant="secondary" className="text-xs px-5 py-2.5 mt-auto font-poppins">View Details</Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 mt-12">
                {/* Previous Button */}
                <Link
                  href={`/shop/collections/${slug}?page=${currentPage - 1}`}
                  className={`px-4 py-2 border rounded ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-brand-gold border-brand-gold hover:bg-brand-gold hover:text-white'}`}
                  aria-disabled={currentPage === 1}
                  tabIndex={currentPage === 1 ? -1 : undefined}
                >
                  Previous
                </Link>

                {/* Page Numbers (Simplified for now) */}
                <span className="text-text-dark font-poppins">
                  Page {currentPage} of {totalPages}
                </span>

                {/* Next Button */}
                <Link
                  href={`/shop/collections/${slug}?page=${currentPage + 1}`}
                  className={`px-4 py-2 border rounded ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-brand-gold border-brand-gold hover:bg-brand-gold hover:text-white'}`}
                  aria-disabled={currentPage === totalPages}
                  tabIndex={currentPage === totalPages ? -1 : undefined}
                >
                  Next
                </Link>
              </div>
            )}
          </>
        ) : (
          <p className="text-center text-text-light font-poppins">No products found in this collection.</p>
        )}

        {/* Back Link */}
        <div className="text-center mt-12">
            <Link href="/shop/collections" className="text-brand-gold hover:underline font-poppins">
                &larr; Back to All Collections
            </Link>
        </div>
      </div>
    </div>
  );
}

// Optional: Add Suspense boundary if needed for loading states
// export default function CollectionPageWithSuspense(props: CollectionPageProps) {
//   return (
//     <Suspense fallback={<div>Loading collection...</div>}>
//       <CollectionPage {...props} />
//     </Suspense>
//   );
// }
