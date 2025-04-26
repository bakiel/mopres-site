'use client'; // This component handles client-side state and interactions

import React, { useState, useEffect } from 'react'; // Import hooks needed for client component
import Link from 'next/link';
// Removed next/image import
import Button from '@/components/Button';
import { supabase, getProductImageUrl } from '@/lib/supabaseClient';
import { addToCart } from '@/lib/cartUtils';
import type { User } from '@supabase/supabase-js';

// --- Types (Should match types in the parent Server Component) ---
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
  // Add fields for pre-formatted prices
  formattedPrice: string;
  formattedOriginalPrice: string | null;
};

// --- Component Definition ---
// Accept the extended ProductDetail type with formatted prices
export default function ProductDetailsClient({ initialProduct }: { initialProduct: ProductDetail }) {

  const [product, setProduct] = useState<ProductDetail>(initialProduct);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  // Removed currentImageIndex state
  const [isInWishlist, setIsInWishlist] = useState<boolean>(false);
  const [wishlistLoading, setWishlistLoading] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [clientLoading, setClientLoading] = useState(true); // Loading state for client-side fetches (session, wishlist)

  // Client-side effect for user session and wishlist status
  useEffect(() => {
    const fetchClientData = async () => {
      setClientLoading(true);
      let currentUser: User | null = null;
      try {
        // 1. Get user session
        const { data: { session } } = await supabase.auth.getSession();
        currentUser = session?.user ?? null;
        setUser(currentUser);

        // 2. Check wishlist status if user is logged in and product exists
        if (currentUser && product) {
          const { data: wishlistItem, error: wishlistError } = await supabase
            .from('wishlist_items')
            .select('id', { count: 'exact', head: true }) // More efficient check
            .eq('user_id', currentUser.id)
            .eq('product_id', product.id);


          if (wishlistError) {
            console.error("Error checking wishlist:", wishlistError);
          } else {
            setIsInWishlist(!!wishlistItem); // Set based on whether item exists
          }
        }
      } catch (error) {
        console.error("Error fetching client-side data:", error);
      } finally {
        setClientLoading(false);
      }
    };

    fetchClientData();
    // Only re-run when the product ID changes (which it shouldn't after initial load from props)
  }, [product?.id]);

  // Handlers
  const handleSizeSelect = (size: string) => setSelectedSize(size);
  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && value >= 1) setQuantity(value);
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (!selectedSize && product.sizes && product.sizes.length > 0) {
      alert('Please select a size.');
      return;
    }
    const itemToAdd = {
      productId: product.id,
      name: product.name,
      price: product.sale_price ?? product.price,
      size: selectedSize,
      quantity: quantity,
      image: product.images?.[0],
      slug: product.slug
    };
    addToCart(itemToAdd);
    alert(`${quantity} x ${product.name} ${selectedSize ? `(Size: ${selectedSize})` : ''} added to cart.`);
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      alert("Please login to manage your wishlist.");
      // Consider redirecting: import { useRouter } from 'next/navigation'; const router = useRouter(); router.push('/account/login');
      return;
    }
    if (!product) return;

    setWishlistLoading(true);
    try {
      if (isInWishlist) {
        const { error } = await supabase.from('wishlist_items').delete().match({ user_id: user.id, product_id: product.id });
        if (error) throw error;
        setIsInWishlist(false);
        alert(`${product.name} removed from wishlist.`);
      } else {
        const { error } = await supabase.from('wishlist_items').insert({ user_id: user.id, product_id: product.id });
        if (error) throw error;
        setIsInWishlist(true);
        alert(`${product.name} added to wishlist.`);
      }
    } catch (error: any) {
      console.error("Error updating wishlist:", error);
      alert(`Failed to update wishlist: ${error.message}`);
    } finally {
      setWishlistLoading(false);
    }
  };

  // Derived state for rendering (use pre-formatted prices)
  // const displayPrice = product.sale_price ?? product.price; // No longer needed
  const isOnSale = product.sale_price != null && product.sale_price < product.price;

  // Render the UI
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
      {/* Product Image Section */}
      {/* Product Image Section */}
      <div className="product-images">
        {/* Revert to standard img tag */}
        {/* Simplify image rendering: Show only the first image */}
        <div className="main-image mb-4 border border-border-light rounded overflow-hidden shadow-md aspect-square">
          {product.images && product.images.length > 0 ? (
            <img
              // Removed key related to currentImageIndex
              src={getProductImageUrl(product.images[0])} // Directly use the first image
              alt={`${product.name} - Image 1`} // Update alt text
              className="w-full h-full object-cover"
              width={500} // Add explicit width
              height={500} // Add explicit height
            />
          ) : (
            // Fallback for no image
            // Fallback display
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-text-light">No Image Available</span>
            </div>
          )}
        </div>
        {/* Removed thumbnail logic */}
      </div>

      {/* Product Details Section */}
      <div className="product-info">
        <h1 className="font-poppins text-3xl lg:text-4xl font-bold mb-4">{product.name}</h1>
        <div className="price-section mb-6 font-poppins">
          <span className={`text-2xl font-medium ${isOnSale ? 'text-red-600' : 'text-text-dark'}`}>
            {product.formattedPrice} {/* Display pre-formatted price */}
          </span>
          {isOnSale && product.formattedOriginalPrice && (
            <span className="ml-3 text-lg text-text-light line-through">
              {product.formattedOriginalPrice} {/* Display pre-formatted original price */}
            </span>
          )}
        </div>
        {product.description && (
          <div className="description text-text-light leading-relaxed mb-8 font-poppins">
            <h3 className="font-semibold text-text-dark mb-2">Description</h3>
            <p>{product.description}</p>
          </div>
        )}
        {product.sizes && product.sizes.length > 0 && (
          <div className="size-selection mb-6">
            <h3 className="font-semibold text-text-dark mb-3 font-poppins">Select Size (ZA/UK)</h3>
            <div className="flex flex-wrap gap-3">
              {product.sizes.map((size: string) => (
                <button
                  key={size}
                  onClick={() => handleSizeSelect(size)}
                  className={`px-4 py-2 border rounded transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-brand-gold/50 font-poppins ${selectedSize === size ? 'bg-brand-black text-white border-brand-black' : 'bg-white text-text-dark border-border-light hover:border-brand-black'}`}
                >
                  {size}
                </button>
              ))}
            </div>
            <Link href="/policies/sizing" className="text-sm text-brand-gold hover:underline mt-3 inline-block font-poppins">
              View Size Guide
            </Link>
          </div>
        )}
        {product.sizes && product.sizes.length === 0 && (
          <p className="text-text-light text-sm mb-6 font-poppins">Sizing information currently unavailable for this product.</p>
        )}
        {product.sizes === null || product.sizes === undefined && (
          <p className="text-text-light text-sm mb-6 font-poppins">Contact us for sizing details.</p>
        )}
        <div className="quantity-selection mb-8">
          <h3 className="font-semibold text-text-dark mb-3 font-poppins">Quantity</h3>
          <input
            type="number"
            value={quantity}
            onChange={handleQuantityChange}
            min="1"
            aria-label="Quantity"
            className="w-20 py-2 px-3 border border-border-light rounded focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold font-poppins"
          />
        </div>
        <Button
          variant="primary"
          className="w-full lg:w-auto"
          onClick={handleAddToCart}
          disabled={!product.in_stock || (product.sizes && product.sizes.length > 0 && !selectedSize)}
        >
          {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
        </Button>
        {product.in_stock && product.sizes && product.sizes.length > 0 && !selectedSize && (
          <p className="text-sm text-red-600 mt-2 font-poppins">Please select a size.</p>
        )}
        {!product.in_stock && (
          <div className="mt-3">
            <p className="text-sm text-red-600 mb-2 font-poppins">This item is currently out of stock.</p>
            <Link
              href={`https://formspree.io/f/xnndqwjp?product=${encodeURIComponent(product.name)}&sku=${encodeURIComponent(product.sku || 'N/A')}${selectedSize ? `&size=${encodeURIComponent(selectedSize)}` : ''}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="secondary" className="w-full lg:w-auto">
                Notify Me When Available
              </Button>
            </Link>
          </div>
        )}
        {/* Show wishlist button only if client-side loading is done */}
        {!clientLoading && user && (
          <Button
            variant="outline-light"
            className="mt-4 w-full lg:w-auto border-gray-300 text-text-dark hover:bg-gray-100 font-poppins"
            onClick={handleWishlistToggle}
            disabled={wishlistLoading}
          >
            {wishlistLoading
              ? (isInWishlist ? 'Removing...' : 'Adding...')
              : (isInWishlist ? '❤️ Remove from Wishlist' : '🤍 Add to Wishlist')
            }
          </Button>
        )}
         {/* Show placeholder or login prompt if client loading or no user */}
         {clientLoading && <div className="mt-4 h-10 w-full lg:w-auto bg-gray-200 rounded animate-pulse"></div>}
         {!clientLoading && !user && (
             <p className="mt-4 text-sm text-text-light font-poppins">
                 <Link href="/account/login" className="text-brand-gold hover:underline">Login</Link> to add to wishlist.
             </p>
         )}
      </div>
    </div>
  );
}
