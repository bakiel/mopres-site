'use client'; // Needs client-side interaction for remove/move to cart

 import React, { useState, useEffect } from 'react';
 import Link from 'next/link';
 import Image from 'next/image'; // Import next/image
 import { createSupabaseBrowserClient, getProductImageUrl } from '@/lib/supabaseClient';
import SectionTitle from '@/components/SectionTitle';
import Button from '@/components/Button';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useCartStore } from '@/store/cartStore'; // Import cart store for moving items

// Define type for Wishlist Item with Product details
interface WishlistItem {
  id: string; // Wishlist item ID
  created_at: string;
  product_id: string;
  products: { // Joined product data
    id: string;
    name: string;
    slug: string;
    price: number;
    sale_price?: number | null;
    images: string[];
    sku?: string;
    collection_id?: string;
    // Add other product fields if needed
  } | null;
}

export default function WishlistPage() {
  const router = useRouter();
   const supabase = createSupabaseBrowserClient();
   const addItemToCart = useCartStore((state) => state.addItem); // Get cart action
   // Removed unused user state: const [user, setUser] = useState<User | null>(null);
   const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
   const [loading, setLoading] = useState(true);

  // Fetch user and wishlist items
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        console.error("Session error or no user:", sessionError);
        router.push('/account/login?redirect=/account/wishlist');
         return;
       }
       // Removed setUser call: setUser(session.user);

       // Fetch wishlist items joined with products
      const { data, error } = await supabase
        .from('wishlist_items')
        .select(`
          id,
          created_at,
          product_id,
          products (
            id,
            name,
            slug,
            price,
            sale_price,
            images,
            sku,
            collection_id
          )
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching wishlist:", error);
        toast.error("Could not load your wishlist.");
         setWishlistItems([]);
       } else {
         // More robust mapping: Check product type and assign explicitly
         const validItems: WishlistItem[] = [];
         // Use any to bypass persistent type error
         (data || []).forEach((item: any) => {
           // Check if products data is valid (object, not null/undefined)
           if (item.products && typeof item.products === 'object' && !Array.isArray(item.products)) { // Add !Array.isArray check for safety
             validItems.push({
                 id: item.id,
                 created_at: item.created_at,
                 product_id: item.product_id,
                 products: item.products, // Assign the validated object
             });
           } else {
               console.warn("Wishlist item missing or has invalid product data:", item);
           }
         });
         setWishlistItems(validItems);
       }
       setLoading(false);
    };

    fetchData();
  }, [router, supabase]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
  };

  const handleRemoveItem = async (wishlistItemId: string, productName: string) => {
    try {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('id', wishlistItemId);

      if (error) throw error;

      // Remove item from local state
       setWishlistItems(prevItems => prevItems.filter(item => item.id !== wishlistItemId));
       toast.success(`${productName} removed from wishlist.`);

    } catch (error) { // Explicitly type error later if needed, or use unknown
       const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
       console.error("Error removing wishlist item:", error);
       toast.error(`Failed to remove item: ${errorMessage}`);
    }
  };

  const handleMoveToCart = (item: WishlistItem) => {
    if (!item.products) return;

    const product = item.products;
    const itemToAdd = {
      productId: product.id,
      name: product.name,
      price: product.sale_price ?? product.price,
      size: null, // Wishlist doesn't store size, user needs to select on product page or cart
      quantity: 1,
      image: product.images?.[0],
      slug: product.slug,
      sku: product.sku,
      collection_id: product.collection_id,
    };
     addItemToCart(itemToAdd);
     // Optionally remove from wishlist after adding to cart
     handleRemoveItem(item.id, product.name);
     toast.success(`${product.name} moved to cart. Please select size if required.`); // Changed toast.info to toast.success
   };


  if (loading) {
      return (
          <div className="bg-background-body py-12 lg:py-20">
              <div className="w-full max-w-screen-lg mx-auto px-4 text-center">
                  <p className="text-text-light">Loading wishlist...</p>
              </div>
          </div>
      );
  }

  return (
    <div className="bg-background-body py-12 lg:py-20">
      <div className="w-full max-w-screen-lg mx-auto px-4">
        <SectionTitle centered>My Wishlist</SectionTitle>

        {wishlistItems.length > 0 ? (
          <div className="mt-8 space-y-6 font-poppins">
            {wishlistItems.map((item) => (
              item.products && ( // Render only if product data exists
                 <div key={item.id} className="bg-white p-4 md:p-6 border border-border-light rounded shadow-sm flex flex-col sm:flex-row items-center gap-4">
                   {/* Image */}
                   <Link href={`/shop/products/${item.products.slug}`} className="flex-shrink-0 w-24 h-24 block relative overflow-hidden rounded border border-border-light"> {/* Added relative */}
                    <Image // Use next/image
                      src={getProductImageUrl(item.products.images?.[0])}
                      alt={item.products.name}
                      fill // Use fill layout
                      style={{ objectFit: 'cover' }} // Ensure image covers the area
                      sizes="96px" // Provide size hint
                      className="rounded"
                    />
                  </Link>
                  {/* Details */}
                  <div className="flex-grow text-center sm:text-left">
                    <Link href={`/shop/products/${item.products.slug}`}>
                      <h3 className="font-semibold text-lg hover:text-brand-gold transition-colors">{item.products.name}</h3>
                    </Link>
                    <p className="text-text-dark mt-1 font-medium">{formatCurrency(item.products.sale_price ?? item.products.price)}</p>
                    {/* Add stock status if needed */}
                  </div>
                  {/* Actions */}
                  <div className="flex-shrink-0 flex flex-col sm:flex-row items-center gap-3 mt-4 sm:mt-0">
                     <Button
                        variant="primary"
                        onClick={() => handleMoveToCart(item)}
                        className="w-full sm:w-auto"
                     >
                        Move to Cart
                     </Button>
                     {/* Corrected Button Variant and Styling (Fifth time!) */}
                     <Button
                        variant="outline-light" // Use valid variant
                        onClick={() => handleRemoveItem(item.id, item.products?.name || 'Item')}
                        className="w-full sm:w-auto text-red-600 border-red-300 hover:bg-red-50 hover:border-red-500" // Apply danger styling via className
                     >
                        Remove
                     </Button>
                  </div>
                </div>
              )
            ))}
          </div>
        ) : (
          <div className="text-center mt-8 bg-white p-12 border border-border-light rounded shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Your Wishlist is Empty</h2>
            <p className="text-text-light mb-6">Start adding products you love!</p>
            <Link href="/shop">
                <Button variant="primary">Explore Products</Button>
            </Link>
          </div>
        )}
         <div className="mt-8 text-center">
            <Link href="/account" className="text-brand-gold hover:underline font-poppins text-sm">
                &larr; Back to Account
            </Link>
        </div>
      </div>
    </div>
  );
}
