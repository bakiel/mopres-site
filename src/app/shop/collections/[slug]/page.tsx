import React from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Import next/image
import Button from '@/components/Button';
import SectionTitle from '@/components/SectionTitle';
import { cookies } from 'next/headers'; // Import cookies
// Remove auth-helpers import: import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { createSupabaseServerClient, getProductImageUrl } from '@/lib/supabaseClient';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import CollectionProductList from '@/components/CollectionProductList';
import CollectionFilters from '@/components/CollectionFilters';
import Breadcrumbs from '@/components/Breadcrumbs'; // Import the Breadcrumbs component

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
  description?: string; // Ensure description is included if needed by list view
};

// Define props type for the page component, including searchParams
interface CollectionPageProps {
  params: {
    slug: string;
  };
  searchParams: {
    page?: string;
    inStock?: string;
    minPrice?: string;
    maxPrice?: string;
    heelHeight?: string;
    sortBy?: string; // Add sortBy to the interface
  };
}

const ITEMS_PER_PAGE = 12; // Define items per page

// Make the component async to fetch data based on the slug and searchParams
// Explicitly type params as 'any' to bypass stubborn type error
export default async function CollectionPage({ params, searchParams }: { params: any, searchParams: CollectionPageProps['searchParams'] }) {
  // Create Supabase client INSIDE the component function scope using the ssr factory
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore); // Use the ssr client factory

  // Destructure params and searchParams correctly
  const slug = params.slug;
  const currentPage = parseInt(searchParams?.page || '1', 10);
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  // Get filter values from searchParams
  const inStockOnly = searchParams?.inStock === 'true';
  const minPrice = searchParams?.minPrice ? parseFloat(searchParams.minPrice) : undefined;
  const maxPrice = searchParams?.maxPrice ? parseFloat(searchParams.maxPrice) : undefined;
  const heelHeightRange = searchParams?.heelHeight?.split('-').map(Number);
  const sortBy = searchParams?.sortBy || 'created_at-desc'; // Default sort

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

    // 2. Build the product query with filters
    let productQuery = supabase
      .from('products')
      .select('id, name, slug, price, images, description, heel_height', { count: 'exact' }) // Added heel_height
      .eq('collection_id', collection.id);

    // Apply filters
    if (inStockOnly) {
      productQuery = productQuery.eq('in_stock', true);
    }
    if (minPrice !== undefined && !isNaN(minPrice)) {
      productQuery = productQuery.gte('price', minPrice);
    }
    if (maxPrice !== undefined && !isNaN(maxPrice)) {
      productQuery = productQuery.lte('price', maxPrice);
    }
    if (heelHeightRange && heelHeightRange.length === 2 && !isNaN(heelHeightRange[0]) && !isNaN(heelHeightRange[1])) {
      productQuery = productQuery.gte('heel_height', heelHeightRange[0]);
      productQuery = productQuery.lte('heel_height', heelHeightRange[1]);
    }

    // Add ordering based on sortBy parameter
    const [sortField, sortDirection] = sortBy.split('-');
    const ascending = sortDirection === 'asc';
    productQuery = productQuery.order(sortField, { ascending });

    // Add pagination
    productQuery = productQuery.range(offset, offset + ITEMS_PER_PAGE - 1);

    // Execute the query
    const { data: productsData, error: productsError, count } = await productQuery;

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

  // Construct search params string safely
  const currentParams = new URLSearchParams();
  if (searchParams.page) currentParams.set('page', searchParams.page);
  if (searchParams.sortBy) currentParams.set('sortBy', searchParams.sortBy);
  if (searchParams.inStock) currentParams.set('inStock', searchParams.inStock);
  if (searchParams.minPrice) currentParams.set('minPrice', searchParams.minPrice);
  if (searchParams.maxPrice) currentParams.set('maxPrice', searchParams.maxPrice);
  if (searchParams.heelHeight) currentParams.set('heelHeight', searchParams.heelHeight);
  const currentSearchParamsString = currentParams.toString();

  // Ensure the return statement has a single root element
  // Prepare breadcrumb items
  const breadcrumbItems = [
    { label: 'Shop', href: '/shop' },
    { label: 'Collections', href: '/shop/collections' },
    { label: collection.name }, // Current page, no href
  ];

  return (
    <div className="bg-background-body py-12 lg:py-20">
      <div className="w-full max-w-screen-xl mx-auto px-4">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbItems} />

        {/* Collection Header */}
        <div className="mb-12 text-center">
          <SectionTitle centered>{collection.name}</SectionTitle>
          {collection.description && (
            <p className="mt-4 text-lg text-text-light max-w-3xl mx-auto font-poppins">{collection.description}</p>
          )}
          {/* Display collection image as a banner */}
          {collection.image && (
            <div className="mt-8 relative w-full h-48 md:h-64 overflow-hidden rounded-md shadow-sm">
              <Image
                src={`/${collection.image}`} // Assuming image is in /public
                alt={`${collection.name} collection banner`}
                fill
                style={{ objectFit: 'cover' }}
                priority // Prioritize loading banner image
                sizes="(max-width: 768px) 100vw, 100vw"
              />
               {/* Optional: Add a subtle overlay */}
               <div className="absolute inset-0 bg-black bg-opacity-10"></div>
            </div>
          )}
        </div>

        {/* Filters and Product List */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <CollectionFilters />
          </div>
          <div className="lg:col-span-3">
            <CollectionProductList
              products={products}
              basePath={`/shop/collections/${slug}`} // Use collection path
              currentPage={currentPage}
              totalPages={totalPages}
              currentSearchParams={currentSearchParamsString} // Pass the safely constructed string
            />
          </div>
        </div>

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
