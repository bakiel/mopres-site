import React from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Import next/image
import Button from '@/components/Button';
import SectionTitle from '@/components/SectionTitle';
import { cookies } from 'next/headers'; // Import cookies
// Remove auth-helpers import: import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { createSupabaseServerClient, getProductImageUrl } from '@/lib/supabaseClient'; // Import server client factory and helper
import { Suspense } from 'react'; // Import Suspense
import ShopSortDropdown from '@/components/ShopSortDropdown'; // Import the new client component

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
    sort?: string; // Add sort parameter
  };
}

const ITEMS_PER_PAGE = 12; // Define items per page

// Make the component async to fetch data
export default async function ShopPage({ searchParams }: ShopPageProps) {
  // Create Supabase client INSIDE the component function scope using the new factory
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore); // Use the ssr client factory

  const currentPage = parseInt(searchParams.page || '1', 10);
  const sortBy = searchParams.sort || 'newest'; // Default sort to newest
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

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
    // Fetch products with pagination and sorting
    const { data, error, count } = await supabase
      .from('products')
      .select('id, name, slug, price, images, created_at', { count: 'exact' }) // Select necessary fields and count
      .order(orderColumn, { ascending: ascending }) // Apply sorting
      .range(offset, offset + ITEMS_PER_PAGE - 1); // Apply range for pagination

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

  return (
    <div className="bg-background-body py-12 lg:py-20"> {/* Added padding */}
      <div className="w-full max-w-screen-xl mx-auto px-4">
        <SectionTitle centered>Shop All Products</SectionTitle>

        {/* Render the client component for sorting */}
        <ShopSortDropdown currentSort={sortBy} />


        {fetchError ? (
          <p className="text-center text-red-600">{fetchError}</p>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {/* Map over fetched products */}
              {products.map((product) => (
                <div key={product.id} className="product-card bg-white p-4 pb-8 border border-border-light transition-transform duration-std ease-in-out hover:-translate-y-1 hover:shadow-xl flex flex-col">
                  <Link href={`/shop/products/${product.slug}`} className="block mb-6 aspect-square overflow-hidden group relative"> {/* Added group for hover effect, added relative */}
                    <Image
                      src={getProductImageUrl(product.images?.[0])} // Use shared function
                      alt={product.name}
                      fill // Use fill layout
                      style={{ objectFit: 'cover' }} // Ensure image covers the area
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 25vw" // Provide sizes hint
                      className="transition-transform duration-std ease-in-out group-hover:scale-105"
                    />
                  </Link>
                  <div className="flex-grow flex flex-col">
                    <h3 className="font-montserrat text-base font-medium mb-3 truncate flex-grow">{product.name}</h3>
                    <p className="price text-base text-brand-gold mb-5 font-poppins"> {/* Added text-brand-gold and font-poppins */}
                      {new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(product.price)}
                    </p>
                    <Button href={`/shop/products/${product.slug}`} variant="secondary" className="text-xs px-5 py-2.5 mt-auto font-poppins">View Details</Button> {/* Added font-poppins */}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 mt-12">
                {/* Previous Button */}
                <Link
                  href={`/shop?page=${currentPage - 1}&sort=${sortBy}`} // Include sort in pagination links
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
                  href={`/shop?page=${currentPage + 1}&sort=${sortBy}`} // Include sort in pagination links
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
          <p className="text-center text-text-light">No products found.</p>
        )}
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
