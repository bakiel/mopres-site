import React from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Import next/image
import Button from '@/components/Button';
import SectionTitle from '@/components/SectionTitle';
import { cookies } from 'next/headers'; // Import cookies
import { createSupabaseServerClient, getProductImageUrl } from '@/lib/supabaseClient';
import { Suspense } from 'react';
// Remove ShopSortDropdown, import the other components
import CollectionFilters from '@/components/CollectionFilters';
import CollectionProductList from '@/components/CollectionProductList';

// Define a type for the product data (consistent with homepage)
type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[]; // Assuming images is an array of filenames/paths
  created_at: string; // Add created_at for sorting
};

// Define props type to accept searchParams
interface ShopPageProps {
  searchParams: {
    page?: string;
    sort?: string; // Keep sort parameter, handled by CollectionFilters now
    inStock?: string;
    minPrice?: string;
    maxPrice?: string;
    heelHeight?: string;
  };
}

const ITEMS_PER_PAGE = 12; // Define items per page

// Make the component async to fetch data
export default async function ShopPage({ searchParams }: ShopPageProps) {
  // Create Supabase client INSIDE the component function scope using the new factory
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore); // Use the ssr client factory

  const currentPage = parseInt(searchParams.page || '1', 10);
  const sortBy = searchParams.sort || 'created_at-desc'; // Match default in CollectionFilters
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  // Get filter values
  const inStockOnly = searchParams?.inStock === 'true';
  const minPrice = searchParams?.minPrice ? parseFloat(searchParams.minPrice) : undefined;
  const maxPrice = searchParams?.maxPrice ? parseFloat(searchParams.maxPrice) : undefined;
  const heelHeightRange = searchParams?.heelHeight?.split('-').map(Number);

  let products: Product[] = [];
  let totalProducts = 0;
  let fetchError: string | null = null;

  // Determine sorting order based on search parameter
  let orderColumn = 'created_at';
  let ascending = false; // Newest first by default

  if (sortBy === 'price-asc') {
    orderColumn = 'price';
    ascending = true;
  } else if (sortBy === 'price-desc') {
    orderColumn = 'price';
    ascending = false;
  } else if (sortBy === 'newest') {
    orderColumn = 'created_at';
    ascending = false;
  } else if (sortBy === 'oldest') {
    orderColumn = 'created_at';
    ascending = true;
  }

  try {
    // Build the product query for ALL products
    let productQuery = supabase
      .from('products')
      .select('id, name, slug, price, images, created_at, heel_height, description', { count: 'exact' }); // Select necessary fields

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

    // Apply sorting
    const [sortField, sortDirection] = sortBy.split('-');
    const ascending = sortDirection === 'asc';
    productQuery = productQuery.order(sortField, { ascending });

    // Apply pagination
    const { data, error, count } = await productQuery.range(offset, offset + ITEMS_PER_PAGE - 1);

    if (error) {
      console.error("Supabase fetch error (Shop Page):", error);
      throw new Error(error.message);
    }
    products = data || [];
    totalProducts = count || 0; // Get the total count
  } catch (error: any) {
    console.error("Error fetching products for shop:", error);
    fetchError = "Could not load products at this time.";
  }

  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

  // Construct search params string from derived variables to avoid direct access warnings
  const currentParams = new URLSearchParams();
  if (searchParams.page) currentParams.set('page', searchParams.page); // Keep original page param if present
  if (searchParams.sort) currentParams.set('sort', searchParams.sort);
  if (searchParams.inStock) currentParams.set('inStock', searchParams.inStock);
  if (searchParams.minPrice) currentParams.set('minPrice', searchParams.minPrice);
  if (searchParams.maxPrice) currentParams.set('maxPrice', searchParams.maxPrice);
  if (searchParams.heelHeight) currentParams.set('heelHeight', searchParams.heelHeight);
  const currentSearchParamsString = currentParams.toString();


  return (
    <div className="bg-background-body py-12 lg:py-20"> {/* Added padding */}
      <div className="w-full max-w-screen-xl mx-auto px-4">
        <SectionTitle centered>Shop All Products</SectionTitle>

        {/* Filters and Product List Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8"> {/* Added mt-8 */}
          <div className="lg:col-span-1">
             {/* Use CollectionFilters, it handles sorting now too */}
            <CollectionFilters />
          </div>
          <div className="lg:col-span-3">
            {fetchError ? (
              <p className="text-center text-red-600">{fetchError}</p>
            ) : (
              <CollectionProductList
                products={products}
                basePath="/shop" // Base path for main shop
                currentPage={currentPage}
                totalPages={totalPages}
                currentSearchParams={currentSearchParamsString} // Pass the safely constructed string
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Optional: Add Suspense boundary if needed for loading states
// export default function ShopPageWithSuspense(props: ShopPageProps) {
//   return (
//     <Suspense fallback={<div>Loading products...</div>}>
//       <ShopPage {...props} />
//     </Suspense>
//   );
// }
