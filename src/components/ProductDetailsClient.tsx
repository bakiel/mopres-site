'use client'; // This component handles client-side state and interactions

import React, { useState, useEffect } from 'react'; // Import hooks needed for client component
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/Button';
import InnerImageZoom from 'react-inner-image-zoom';
import 'react-inner-image-zoom/lib/styles.min.css'; // Corrected CSS import path
import { createSupabaseBrowserClient, getProductImageUrl } from '@/lib/supabaseClient';
// Remove import { addToCart } from '@/lib/cartUtils';
import { useCartStore } from '@/store/cartStore'; // Import the cart store hook
import type { User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import SizeGuidePopup from './SizeGuidePopup';
import { usePathname } from 'next/navigation'; // Import usePathname

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
  estimated_restock_date?: string | null; // Add the new field
  // Add fields for pre-formatted prices
  formattedPrice: string;
  formattedOriginalPrice: string | null;
};

// --- Component Definition ---
// Accept the extended ProductDetail type with formatted prices
export default function ProductDetailsClient({ initialProduct }: { initialProduct: ProductDetail }) {
  // Create the client instance inside the component
  const supabase = createSupabaseBrowserClient();
  const [product, setProduct] = useState<ProductDetail>(initialProduct);
  const [selectedSize, setSelectedSize] = useState<string | null>(null); // Stores the selected ZA/UK size
  const [quantity, setQuantity] = useState<number>(1);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [displaySizeSystem, setDisplaySizeSystem] = useState<'ZA/UK' | 'EU'>('ZA/UK'); // State for size system view
  const [isInWishlist, setIsInWishlist] = useState<boolean>(false);
  const [wishlistLoading, setWishlistLoading] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [clientLoading, setClientLoading] = useState(true);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const addItemToCart = useCartStore((state) => state.addItem);
  // Waitlist state
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistSelectedSize, setWaitlistSelectedSize] = useState<string | null>(null);
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);

  // Get current URL on client-side
  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  // Client-side effect for user session, wishlist status, and pre-filling waitlist email
  useEffect(() => {
    const fetchClientData = async () => {
      setClientLoading(true);
      let currentUser: User | null = null;
      try {
        // 1. Get user session
        const { data: { session } } = await supabase.auth.getSession();
        currentUser = session?.user ?? null;
        setUser(currentUser);

        // 2. Pre-fill waitlist email if user is logged in
        if (currentUser?.email) {
            setWaitlistEmail(currentUser.email);
        }

        // 3. Check wishlist status if user is logged in and product exists
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

  // --- Size Conversion Logic ---
  // Basic ZA/UK to EU mapping (adjust based on actual brand sizing)
  const zaToEuMap: { [key: string]: string } = {
    '3': '36', '4': '37', '5': '38', '6': '39', '7': '40', '8': '41', '9': '42', '10': '43',
  };

  const convertSize = (size: string, targetSystem: 'ZA/UK' | 'EU'): string => {
    if (targetSystem === 'ZA/UK') {
      return size; // Assume stored size is ZA/UK
    } else {
      return zaToEuMap[size] || size; // Return EU size or original if not found
    }
  };

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
      slug: product.slug,
      sku: product.sku,
      collection_id: product.collection_id, // Add collection_id
    };
    // Use the addItem action from the Zustand store
    addItemToCart(itemToAdd);
    // Toast notification is now handled within the addItem action itself
    // toast.success(`${quantity} x ${product.name} ${selectedSize ? `(Size: ${selectedSize})` : ''} added to cart.`);
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      toast.error("Please login to manage your wishlist.");
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
        toast.success(`${product.name} removed from wishlist.`);
      } else {
        const { error } = await supabase.from('wishlist_items').insert({ user_id: user.id, product_id: product.id });
        if (error) throw error;
        setIsInWishlist(true);
        toast.success(`${product.name} added to wishlist.`);
      }
    } catch (error: any) {
      console.error("Error updating wishlist:", error);
      toast.error(`Failed to update wishlist: ${error.message}`);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleWaitlistSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!product) return;
      if (product.sizes && product.sizes.length > 0 && !waitlistSelectedSize) {
          toast.error("Please select a size for the waitlist notification.");
          return;
      }
      if (!waitlistEmail) {
          toast.error("Please enter your email address.");
          return;
      }

      setWaitlistLoading(true);
      setWaitlistSubmitted(false); // Reset submission status

      try {
          const { error } = await supabase
              .from('waitlist_signups')
              .insert({
                  product_id: product.id,
                  user_email: waitlistEmail,
                  selected_size: waitlistSelectedSize, // Will be null if product has no sizes
              });

          if (error) {
              // Handle potential unique constraint violation (already signed up)
              if (error.code === '23505') { // Unique violation code for PostgreSQL
                  toast.success("You're already on the waitlist for this item/size!");
                  setWaitlistSubmitted(true); // Treat as success
              } else {
                  throw error; // Throw other errors
              }
          } else {
              toast.success("Success! We'll notify you when it's back in stock.");
              setWaitlistSubmitted(true);
          }
      } catch (error: any) {
          console.error("Error signing up for waitlist:", error);
          toast.error(`Failed to sign up: ${error.message}`);
      } finally {
          setWaitlistLoading(false);
      }
  };


  // Derived state for rendering (use pre-formatted prices)
  // const displayPrice = product.sale_price ?? product.price; // No longer needed
  const isOnSale = product.sale_price != null && product.sale_price < product.price;

  // Render the UI
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
      {/* Product Image Section */}
      <div className="product-images">
        {/* Main Image with Zoom */}
        <div className="main-image mb-4 border border-border-light rounded overflow-hidden shadow-md aspect-square relative">
          {product.images && product.images.length > 0 ? (
             <InnerImageZoom
              // Pass alt text via imgAttributes prop
              imgAttributes={{ alt: `${product.name} - Image ${currentImageIndex + 1}` }}
              src={getProductImageUrl(supabase, product.images[currentImageIndex])} // Pass supabase instance
              zoomSrc={getProductImageUrl(supabase, product.images[currentImageIndex])} // Pass supabase instance
              zoomType="hover"
              hideHint={true}
              className="w-full h-full object-cover" // Ensure it fills container
              // You might need to adjust container size or zoom scale
            />
          ) : (
            // Fallback for no image
            (<div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-text-light">No Image Available</span>
            </div>)
          )}
        </div>
            {/* <Image
              src={getProductImageUrl(product.images[currentImageIndex])}
              alt={`${product.name} - Image ${currentImageIndex + 1}`}
              fill
              style={{ objectFit: 'cover' }} // Ensure image covers the area
              sizes="(max-width: 768px) 100vw, 50vw" // Provide sizes hint
              priority={currentImageIndex === 0} // Prioritize the first image
            />
          ) : (
            // Fallback for no image
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-text-light">No Image Available</span>
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {product.images && product.images.length > 1 && (
          <div className="thumbnails grid grid-cols-4 sm:grid-cols-5 gap-2">
            {product.images.map((image, index) => (
              <div
                key={index}
                className={`aspect-square border rounded overflow-hidden cursor-pointer transition-opacity duration-200 ${index === currentImageIndex ? 'border-brand-gold opacity-100' : 'border-border-light opacity-70 hover:opacity-100'}`}
                onClick={() => setCurrentImageIndex(index)}
              >
                <Image
                  src={getProductImageUrl(supabase, image)} // Pass supabase instance
                  alt={`${product.name} - Thumbnail ${index + 1}`}
                  width={100} // Explicit width for thumbnail
                  height={100} // Explicit height for thumbnail
                  style={{ objectFit: 'cover' }}
                />
              </div>
            ))}
          </div>
        )}
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
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-text-dark font-poppins">
                Select Size ({displaySizeSystem})
              </h3>
              {/* Size System Toggle */}
              <div className="text-xs font-poppins">
                <button
                  onClick={() => setDisplaySizeSystem('ZA/UK')}
                  className={`px-2 py-1 rounded ${displaySizeSystem === 'ZA/UK' ? 'bg-gray-200 text-text-dark font-medium' : 'text-text-light hover:text-brand-gold'}`}
                  disabled={displaySizeSystem === 'ZA/UK'}
                >
                  ZA/UK
                </button>
                <span className="mx-1 text-gray-300">|</span>
                <button
                  onClick={() => setDisplaySizeSystem('EU')}
                  className={`px-2 py-1 rounded ${displaySizeSystem === 'EU' ? 'bg-gray-200 text-text-dark font-medium' : 'text-text-light hover:text-brand-gold'}`}
                  disabled={displaySizeSystem === 'EU'}
                >
                  EU
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {/* TODO: Add size conversion logic here */}
              {product.sizes.map((size: string) => (
                <button
                  key={size}
                  // Store the original ZA/UK size on selection, display might be EU
                  onClick={() => handleSizeSelect(size)}
                  // Highlight based on the original ZA/UK size
                  className={`px-4 py-2 border rounded transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-brand-gold/50 font-poppins ${selectedSize === size ? 'bg-brand-black text-white border-brand-black' : 'bg-white text-text-dark border-border-light hover:border-brand-black'}`}
                >
                  {/* Display converted size based on displaySizeSystem */}
                  {convertSize(size, displaySizeSystem)}
                </button>
              ))}
            </div>
            {/* Replace Link with Button to open popup */}
            <button
              onClick={() => setIsSizeGuideOpen(true)}
              className="text-sm text-brand-gold hover:underline mt-3 inline-block font-poppins"
            >
              View Size Guide
            </button>
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
        {/* Out of Stock / Waitlist Form */}
        {!product.in_stock && (
          <div className="mt-6 pt-6 border-t border-border-light">
            <h3 className="font-semibold text-text-dark mb-3 font-poppins">Notify Me When Available</h3>
            {waitlistSubmitted ? (
                 <p className="text-green-600 font-medium font-poppins">Thank you! We'll email you at <span className="font-bold">{waitlistEmail}</span> when this item is back.</p>
            ) : (
                <form onSubmit={handleWaitlistSubmit} className="space-y-4 font-poppins">
                    <p className="text-sm text-text-light">Enter your email and select a size (if applicable) to be notified when this product is back in stock.</p>
                    {/* Size Selector for Waitlist (if product has sizes) */}
                    {product.sizes && product.sizes.length > 0 && (
                         <div>
                            <label htmlFor="waitlistSize" className="block text-sm font-medium text-gray-700 mb-1">Select Size</label>
                            <select
                                id="waitlistSize"
                                value={waitlistSelectedSize || ''}
                                onChange={(e) => setWaitlistSelectedSize(e.target.value)}
                                required
                                className="w-full p-2 border border-border-light rounded bg-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
                            >
                                <option value="" disabled>-- Select Size --</option>
                                {product.sizes.map(size => (
                                    <option key={`waitlist-${size}`} value={size}>
                                        {/* Display based on current view preference */}
                                        {convertSize(size, displaySizeSystem)} ({displaySizeSystem})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                     {/* Email Input */}
                     <div>
                        <label htmlFor="waitlistEmail" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            id="waitlistEmail"
                            value={waitlistEmail}
                            onChange={(e) => setWaitlistEmail(e.target.value)}
                            required
                            placeholder="you@example.com"
                            className="w-full p-2 border border-border-light rounded focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
                            disabled={!!user?.email} // Disable if pre-filled from logged-in user
                        />
                         {user?.email && <p className="text-xs text-gray-500 mt-1">Using your logged-in email.</p>}
                    </div>
                     {/* Submit Button */}
                     <Button type="submit" variant="secondary" className="w-full lg:w-auto" disabled={waitlistLoading}>
                        {waitlistLoading ? 'Submitting...' : 'Notify Me'}
                    </Button>
                </form>
            )}
            {/* Display Estimated Restock Date */}
            {product.estimated_restock_date && !waitlistSubmitted && (
                <p className="text-sm text-text-light mt-3 font-poppins">
                    Estimated back in stock around: {new Date(product.estimated_restock_date).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            )}
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

        {/* Social Sharing */}
        <div className="mt-8 pt-6 border-t border-border-light">
          <h4 className="font-semibold text-text-dark mb-3 font-poppins text-sm">Share this product:</h4>
          <div className="flex items-center space-x-3">
            {/* Facebook */}
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-blue-600 transition-colors"
              aria-label="Share on Facebook"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
            {/* Twitter */}
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(`Check out ${product.name} on MoPres!`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-sky-500 transition-colors"
              aria-label="Share on Twitter"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"></path></svg>
            </a>
            {/* WhatsApp */}
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out ${product.name} on MoPres! ${currentUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-green-500 transition-colors"
              aria-label="Share on WhatsApp"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zM9.57 17.99c-.19 0-.4-.03-.61-.1l-.44-.25-3.11.82.83-3.04-.28-.47a7.88 7.88 0 01-1.17-4.01c0-4.38 3.53-7.94 7.88-7.94s7.88 3.56 7.88 7.94c0 4.38-3.53 7.94-7.88 7.94-.95 0-1.86-.17-2.7-.49zm4.47-5.81c-.26-.13-1.56-.77-1.8-.86-.24-.09-.42-.13-.59.13-.17.26-.68.86-.84 1.03-.15.17-.3.19-.55.06-.25-.13-1.07-.39-2.04-1.26-.75-.67-1.26-1.5-1.41-1.76-.15-.26-.02-.4.11-.54.12-.12.26-.31.39-.47.13-.16.17-.26.26-.44.09-.18 0-.34-.04-.47-.04-.13-.59-1.42-.81-1.95-.21-.52-.43-.45-.59-.46-.15-.01-.33-.01-.5-.01-.17 0-.45.06-.68.31-.23.26-.88.85-.88 2.07 0 1.22.9 2.4 1.03 2.56.13.17 1.76 2.67 4.27 3.78 2.51 1.11 2.51.74 2.96.71.45-.03 1.56-.64 1.78-1.26.22-.62.22-1.15.15-1.26-.07-.12-.26-.19-.5-.31z"></path></svg>
            </a>
            {/* Email */}
             <a
              href={`mailto:?subject=${encodeURIComponent(`Check out ${product.name} on MoPres`)}&body=${encodeURIComponent(`I thought you might like this: ${currentUrl}`)}`}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Share via Email"
            >
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            </a>
          </div>
        </div>

      </div>
      {/* Size Guide Popup */}
      <SizeGuidePopup isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />
    </div>
  );
}
