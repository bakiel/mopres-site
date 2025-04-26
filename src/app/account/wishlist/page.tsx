'use client'; // Needs client-side checks for auth and data fetching

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SectionTitle from '@/components/SectionTitle';
import Button from '@/components/Button';
import { supabase, getProductImageUrl } from '@/lib/supabaseClient'; // Import shared function
import type { User } from '@supabase/supabase-js';

// Define type for Wishlist Item (joining product details)
// TODO: Refine based on actual schema and query
type WishlistItem = {
  id: string;
  created_at: string;
  product_id: string;
  // Adjust 'products' type: Supabase join might return an array even for a single related record
  products: {
    name: string;
    slug: string;
    price: number;
    images: string[];
    in_stock?: boolean;
  }[] | null; // Expect an array of products or null
};

export default function WishlistPage() {
  const [user, setUser] = useState<User | null>(null);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserAndWishlist = async () => {
      setLoading(true);
      setError(null);

      // 1. Check user session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        console.error("Error getting session or no user:", sessionError);
        router.push('/account/login'); // Redirect if not logged in
        return;
      }
      setUser(session.user);

      // 2. Fetch wishlist items for the logged-in user, joining product details
      try {
        const { data: wishlistData, error: wishlistError } = await supabase
          .from('wishlist_items')
          // Join with products table: select wishlist item fields and nested product fields
          .select(`
            id,
            created_at,
            product_id,
            products ( name, slug, price, images, in_stock )
          `)
          .eq('user_id', session.user.id) // Filter by user ID
          .order('created_at', { ascending: false }); // Show most recent first

        if (wishlistError) {
          console.error("Error fetching wishlist:", wishlistError);
          throw new Error("Could not load your wishlist.");
        }
        // Filter out items where the product might have been deleted or the products array is empty
        const validItems = wishlistData?.filter(item => item.products && item.products.length > 0) as WishlistItem[] | undefined;
        setWishlistItems(validItems || []);
      } catch (fetchError: any) {
        setError(fetchError.message || "An error occurred while fetching your wishlist.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndWishlist();

     // Listen for auth changes
     const { data: authListener } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (event === 'SIGNED_OUT') {
            setUser(null);
            setWishlistItems([]); // Clear wishlist on logout
            router.push('/account/login');
          } else {
             setUser(session?.user ?? null);
          }
        }
      );

      // Cleanup listener
      return () => {
        authListener?.subscription.unsubscribe();
      };

  }, [router]);

   const handleRemoveItem = async (wishlistItemId: string) => {
    // Placeholder function - Implement actual removal logic later
    console.log("Attempting to remove wishlist item:", wishlistItemId);
    alert("Remove functionality not yet implemented.");
    // TODO: Implement Supabase delete operation and update state
    // const { error } = await supabase.from('wishlist_items').delete().match({ id: wishlistItemId, user_id: user?.id });
    // if (!error) {
    //   setWishlistItems(currentItems => currentItems.filter(item => item.id !== wishlistItemId));
    // } else {
    //   console.error("Error removing wishlist item:", error);
    //   alert("Failed to remove item from wishlist.");
    // }
  };

  const formatCurrency = (amount: number) => {
     return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
  }

  if (loading) {
    return (
      <div className="bg-background-body py-12 lg:py-20">
        <div className="w-full max-w-screen-xl mx-auto px-4 text-center">
          <p className="text-text-light">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-body py-12 lg:py-20">
      <div className="w-full max-w-screen-lg mx-auto px-4">
        <SectionTitle centered>My Wishlist</SectionTitle>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6 font-poppins" role="alert"> {/* Added font-poppins */}
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {wishlistItems.length > 0 ? (
          <div className="mt-8 space-y-6 font-poppins"> {/* Added font-poppins */}
            {wishlistItems.map((item) => {
              // Access the first product in the array, assuming a one-to-one join was intended
              const product = item.products?.[0];
              // Use implicit return with conditional rendering, ensure key is on the fragment/element returned by map
              return product ? (
                <div key={item.id} className="flex flex-col md:flex-row items-center gap-6 bg-white p-4 border border-border-light rounded shadow-sm">
                  <Link href={`/shop/products/${product.slug}`} className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32 block overflow-hidden rounded border border-border-light">
                    <img
                    src={getProductImageUrl(product.images?.[0])}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </Link>
                <div className="flex-grow text-center md:text-left">
                  <Link href={`/shop/products/${product.slug}`}>
                    <h3 className="font-semibold text-lg hover:text-brand-gold transition-colors">{product.name}</h3>
                  </Link>
                  <p className="text-text-dark mt-1 mb-3">{formatCurrency(product.price)}</p>
                  {/* Add to Cart button (requires client component logic similar to product page) */}
                  {/* For now, just link to product page */}
                   <Link href={`/shop/products/${product.slug}`} className="inline-block mr-4">
                      <Button variant="secondary">View Product</Button> {/* Removed size="sm" */}
                     </Link>
                  </div>
                  <div className="flex-shrink-0 mt-4 md:mt-0">
                    <Button
                      variant="outline-light"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-500" // Removed size="sm"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ) : null; // Return null if product is not available for this item
            })}
          </div>
        ) : (
          <div className="text-center mt-8 bg-white p-8 border border-border-light rounded shadow-sm font-poppins"> {/* Added font-poppins */}
            <p className="text-text-light">Your wishlist is currently empty.</p>
            <Link href="/shop" className="mt-4 inline-block">
                <Button variant="primary">Discover Products</Button>
            </Link>
          </div>
        )}

         <div className="mt-8 text-center">
            <Link href="/account" className="text-brand-gold hover:underline font-poppins"> {/* Added font-poppins */}
                &larr; Back to My Account
            </Link>
        </div>
      </div>
    </div>
  );
}
