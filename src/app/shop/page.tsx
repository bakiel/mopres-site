import React from 'react';
import Link from 'next/link';
import Button from '@/components/Button';
import SectionTitle from '@/components/SectionTitle';
import { supabase, getProductImageUrl } from '@/lib/supabaseClient'; // Import shared function

// Define a type for the product data (consistent with homepage)
type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[]; // Assuming images is an array of filenames/paths
};

// Make the component async to fetch data
export default async function ShopPage() {
  let products: Product[] = [];
  let fetchError: string | null = null;

  try {
    // Fetch all products from Supabase (consider pagination for large catalogs)
    const { data, error } = await supabase
      .from('products')
      .select('id, name, slug, price, images') // Select necessary fields
      .order('created_at', { ascending: false }); // Optional: order by creation date

    if (error) {
      console.error("Supabase fetch error (Shop Page):", error);
      throw new Error(error.message);
    }
    products = data || [];
  } catch (error: any) {
    console.error("Error fetching products for shop:", error);
    fetchError = "Could not load products at this time.";
  }

  return (
    <div className="bg-background-body py-12 lg:py-20"> {/* Added padding */}
      <div className="w-full max-w-screen-xl mx-auto px-4">
        <SectionTitle centered>Shop All Products</SectionTitle>
        {/* TODO: Add Filtering/Sorting options here */}

        {fetchError ? (
          <p className="text-center text-red-600">{fetchError}</p>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {/* Map over fetched products */}
            {products.map((product) => (
              <div key={product.id} className="product-card bg-white p-4 pb-8 border border-border-light transition-transform duration-std ease-in-out hover:-translate-y-1 hover:shadow-xl flex flex-col">
                <Link href={`/shop/products/${product.slug}`} className="block mb-6 aspect-square overflow-hidden group"> {/* Added group for hover effect */}
                  <img
                    src={getProductImageUrl(product.images?.[0])} // Use shared function
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-std ease-in-out group-hover:scale-105"
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
        ) : (
          <p className="text-center text-text-light">No products found.</p>
        )}
      </div>
    </div>
  );
}
