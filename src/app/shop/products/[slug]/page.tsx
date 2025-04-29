import React, { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Import next/image
import Button from '@/components/Button'; // Keep Button import if used in Server Error or Related Products
import SectionTitle from '@/components/SectionTitle';
import { cookies } from 'next/headers'; // Import cookies
// Remove auth-helpers import: import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { createSupabaseServerClient, getProductImageUrl } from '@/lib/supabaseClient'; // Import server client factory and helper
import { notFound } from 'next/navigation';
// Remove client-specific imports like addToCart, User type if not needed server-side
// import { addToCart } from '@/lib/cartUtils';
// import type { User } from '@supabase/supabase-js';
import ProductDetailsClient from '@/components/ProductDetailsClient'; // Import the new client component

// --- Types (Keep types needed for server-side fetching) ---
type ProductDetail = {
  id: string;
  name: string;
  slug: string;
  sku?: string;
  description?: string;
  price: number;
  sale_price?: number;
  images: string[];
  sizes?: string[];
  in_stock?: boolean;
  collection_id?: string;
};

type RelatedProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
};

// Error component specific to server-side fetching
const ServerProductError = ({ error, slug }: { error: string, slug?: string }) => {
    return (
      <div className="bg-background-body py-12 lg:py-20">
        <div className="w-full max-w-screen-xl mx-auto px-4 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 inline-block">
            <p className="text-red-600 mb-4">Error loading product: {error}</p>
            <p className="text-text-light text-sm mb-4">
              Could not retrieve details {slug ? `for product "${slug}"` : ''}. It might be unavailable or there was a connection issue.
            </p>
            <Link href="/shop" className="inline-block text-brand-gold hover:underline">
              Back to Shop
            </Link>
          </div>
        </div>
      </div>
    );
  };

// Loading component for Suspense (Optional: Can use loading.tsx instead)
const ProductLoadingSkeleton = () => (
    <div className="bg-background-body py-12 lg:py-20 animate-pulse">
      <div className="w-full max-w-screen-xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          {/* Image Skeleton */}
          <div className="product-images">
            <div className="main-image mb-4 bg-gray-300 rounded aspect-square"></div>
            <div className="thumbnails grid grid-cols-4 sm:grid-cols-5 gap-2">
              {[...Array(4)].map((_, i) => <div key={i} className="bg-gray-300 rounded aspect-square"></div>)}
            </div>
          </div>
          {/* Details Skeleton */}
          <div className="product-info space-y-6">
            <div className="h-10 bg-gray-300 rounded w-3/4"></div> {/* Title */}
            <div className="h-8 bg-gray-300 rounded w-1/4"></div> {/* Price */}
            <div className="space-y-3"> {/* Description */}
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6"></div>
            </div>
            <div className="h-6 bg-gray-300 rounded w-1/3 mb-3"></div> {/* Size Title */}
            <div className="flex flex-wrap gap-3"> {/* Sizes */}
              {[...Array(3)].map((_, i) => <div key={i} className="h-10 w-16 bg-gray-300 rounded"></div>)}
            </div>
            <div className="h-6 bg-gray-300 rounded w-1/4 mb-3"></div> {/* Quantity Title */}
            <div className="h-10 w-20 bg-gray-300 rounded"></div> {/* Quantity Input */}
            <div className="h-12 bg-gray-300 rounded w-full lg:w-1/2"></div> {/* Add to Cart Button */}
          </div>
        </div>
        {/* Related Products Skeleton */}
        <div className="related-products mt-16 lg:mt-24 pt-12 border-t border-border-light">
           <div className="h-8 bg-gray-300 rounded w-1/3 mx-auto mb-8"></div> {/* Section Title */}
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
              {[...Array(4)].map((_, i) => (
                  <div key={i} className="product-card bg-white p-4 pb-8 border border-border-light rounded space-y-4">
                      <div className="bg-gray-300 rounded aspect-square"></div>
                      <div className="h-5 bg-gray-300 rounded w-5/6"></div>
                      <div className="h-6 bg-gray-300 rounded w-1/3"></div>
                      <div className="h-10 bg-gray-300 rounded w-full"></div>
                  </div>
              ))}
           </div>
        </div>
      </div>
    </div>
);


export default async function ProductPage({ params: paramsPromise }: { params: Promise<{ slug: string }> }) {
  // Create Supabase client INSIDE the component function scope using the ssr factory
  const cookieStore = await cookies(); // Await cookies() here
  const supabase = createSupabaseServerClient(cookieStore); // Use the ssr client factory

  // Await params
  const { slug } = await paramsPromise;
  let product: ProductDetail | null = null;
  let relatedProducts: RelatedProduct[] = [];
  let fetchError: string | null = null;

  try {
    // Fetch main product
    const { data: productDataArray, error: productError } = await supabase
      .from('products')
      .select(`
          id,
          name,
          slug,
          sku,
          description,
          price,
          sale_price,
          images,
          sizes,
          in_stock,
          collection_id,
          estimated_restock_date,
          collections ( name, slug )
      `)
      .eq('slug', slug)
      .limit(1);

    if (productError) throw new Error(productError.message || "Product data could not be retrieved.");
    if (!productDataArray || productDataArray.length === 0) notFound();

    product = productDataArray[0];

    // Fetch related products if collection_id exists
    if (product?.collection_id) {
      const { data: relatedData, error: relatedFetchError } = await supabase
        .from('products')
        .select('id, name, slug, price, images')
        .eq('collection_id', product.collection_id)
        .neq('id', product.id)
        .limit(4);

      if (relatedFetchError) {
        console.error("Supabase fetch error (Related Products):", relatedFetchError);
        // Non-critical, log but don't throw
      } else {
        relatedProducts = relatedData || [];
      }
    }
  } catch (error: any) {
    console.error(`Server Error fetching data for product "${slug}":`, error);
    if (error.message.includes("not found")) { // Check if it was a notFound() call
        notFound(); // Re-trigger notFound if necessary
    }
    fetchError = error.message || `Could not load data for the product "${slug}".`;
    // Don't return here, just set the error state
  }

  // Handle fetch error AFTER the try...catch block
  if (fetchError) {
    // Slug should be defined here if we didn't hit notFound()
    return <ServerProductError error={fetchError} slug={slug} />;
  }

  // Should not happen if notFound() works correctly, but defensive check
  if (!product) {
      notFound(); // This will throw an error, stopping execution
  }

  // Pre-format prices on the server
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
  }
  const formattedPrice = formatCurrency(product.sale_price ?? product.price);
  const formattedOriginalPrice = product.sale_price != null && product.price ? formatCurrency(product.price) : null;

  // Pass pre-formatted prices to the client component
  const productForClient = {
    ...product,
    formattedPrice: formattedPrice,
    formattedOriginalPrice: formattedOriginalPrice,
  };


  return (
    <div className="bg-background-body py-12 lg:py-20">
      <div className="w-full max-w-screen-xl mx-auto px-4">
        {/* Render Client Component with fetched data including formatted prices */}
        <ProductDetailsClient initialProduct={productForClient} />

        {/* Related Products Section (Rendered on Server) */}
        {/* Format related product prices here as well */}
        <div className="related-products mt-16 lg:mt-24 pt-12 border-t border-border-light">
          <SectionTitle centered>You Might Also Like</SectionTitle>
          {relatedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
              {relatedProducts.map((related) => (
                <div key={related.id} className="product-card bg-white p-4 pb-8 border border-border-light transition-transform duration-std ease-in-out hover:-translate-y-1 hover:shadow-xl flex flex-col">
                  <Link
                    href={`/shop/products/${related.slug}`}
                    className="block mb-6 aspect-square overflow-hidden group relative"> {/* Added relative for Image fill */}
                    <Image
                      src={getProductImageUrl(supabase, related.images?.[0])} // Pass supabase instance
                      alt={related.name}
                      fill // Use fill layout
                      style={{ objectFit: 'cover' }} // Ensure image covers the area
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" // Provide sizes hint
                      className="transition-transform duration-std ease-in-out group-hover:scale-105"
                    />
                  </Link>
                  <div className="flex-grow flex flex-col">
                    <h3 className="font-montserrat text-base font-medium mb-3 truncate flex-grow">{related.name}</h3>
                    <p className="price text-base text-brand-gold mb-5 font-poppins">
                      {formatCurrency(related.price)} {/* Use server-side formatting */}
                    </p>
                    <Link href={`/shop/products/${related.slug}`} className="mt-auto inline-block text-center bg-brand-black text-white font-poppins text-xs font-medium uppercase tracking-wider px-5 py-2.5 rounded-sm transition-colors duration-300 ease-in-out hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-black">
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-text-light mt-8 font-poppins">No related products found.</p>
          )}
        </div>

        {/* Back Link */}
        <div className="text-center mt-12">
          <Link href="/shop" className="text-brand-gold hover:underline font-poppins">
            &larr; Back to Shop
          </Link>
        </div>
      </div>
    </div>
  );
}

// Add Suspense boundary around the page export if needed, or use a loading.tsx file
// export default function ProductPageWithSuspense(props: ProductPageProps) {
//   return (
//     <Suspense fallback={<ProductLoadingSkeleton />}>
//       <ProductPage {...props} />
//     </Suspense>
//   );
// }
