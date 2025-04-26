'use client';

import React, { useState, useEffect } from 'react'; // Import useState, useEffect
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore, CartItem } from '@/store/cartStore';
import { createSupabaseBrowserClient, getProductImageUrl } from '@/lib/supabaseClient'; // Import client factory
import Button from './Button';

// SVG Icon for Close
const CloseIcon: React.FC = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
);

// SVG Icon for Trash
const TrashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);


const CartSidebar: React.FC = () => {
  const {
    items,
    savedItems, // Get saved items
    isSidebarOpen,
    closeSidebar,
    removeItem,
    updateQuantity,
    saveItemForLater, // Get new action
    moveSavedItemToCart, // Get new action
    removeSavedItem, // Get new action
    getTotalItems,
    getTotalPrice,
    addItem, // Need addItem for cross-sell
  } = useCartStore();
  const supabase = createSupabaseBrowserClient(); // Create client instance

  const [crossSellItems, setCrossSellItems] = useState<CartItem[]>([]); // State for recommendations
  const [isLoadingCrossSell, setIsLoadingCrossSell] = useState(false);

  // Fetch cross-sell items when cart items change or sidebar opens
  useEffect(() => {
    const fetchCrossSell = async () => {
      if (!isSidebarOpen || items.length === 0) {
        setCrossSellItems([]); // Clear if sidebar closed or cart empty
        return;
      }

      setIsLoadingCrossSell(true);
      try {
        // Get collection IDs from items in cart
        const collectionIds = [...new Set(items.map(item => item.collection_id).filter(Boolean))]; // Get unique, non-null collection IDs
        const productIdsInCart = items.map(item => item.productId);

        if (collectionIds.length > 0) {
          const { data, error } = await supabase
            .from('products')
            .select('id, name, slug, price, images, collection_id, sku') // Select needed fields
            .in('collection_id', collectionIds) // In collections of cart items
            .not('id', 'in', `(${productIdsInCart.join(',')})`) // Exclude items already in cart
            .limit(3); // Limit recommendations

          if (error) throw error;

          // Map data to CartItem structure (or a simpler recommendation structure)
          const recommendations = (data || []).map(p => ({
              productId: p.id,
              name: p.name,
              price: p.price, // Assuming price is not null
              size: null, // Cross-sell doesn't pre-select size
              quantity: 1, // Default quantity
              image: p.images?.[0],
              slug: p.slug,
              sku: p.sku,
              collection_id: p.collection_id // Keep collection_id if needed
          }));
          setCrossSellItems(recommendations);
        } else {
             setCrossSellItems([]); // No collections to base recommendations on
        }
      } catch (error) {
        console.error("Error fetching cross-sell items:", error);
        setCrossSellItems([]); // Clear on error
      } finally {
        setIsLoadingCrossSell(false);
      }
    };

    fetchCrossSell();
  }, [items, isSidebarOpen]); // Re-run when items or sidebar state change


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
  };

  // Shipping Cost Calculation
  const subtotal = getTotalPrice();
  const standardShippingCost = 150;
  const freeShippingThreshold = 2000;
  const shippingCost = subtotal >= freeShippingThreshold ? 0 : standardShippingCost;
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercentage = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-[1050] transition-opacity duration-300 ease-in-out ${
          isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={closeSidebar}
        aria-hidden={!isSidebarOpen}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-[1051] transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        } flex flex-col`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-sidebar-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border-light flex-shrink-0">
          <h2 id="cart-sidebar-title" className="text-lg font-semibold font-montserrat text-text-dark">
            Shopping Cart ({getTotalItems()})
          </h2>
          <button
            onClick={closeSidebar}
            className="text-gray-500 hover:text-gray-800 transition-colors"
            aria-label="Close cart sidebar"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-grow overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="text-center text-text-light py-10">
              <p className="mb-4 font-poppins">Your cart is empty.</p>
              <Button variant="secondary" onClick={closeSidebar} href="/shop">
                Continue Shopping
              </Button>
            </div>
          ) : (
            items.map((item) => (
              <div key={`${item.productId}-${item.size || 'no-size'}`} className="flex items-start gap-4 border-b border-border-light pb-4 last:border-b-0">
                {/* Image */}
                <Link href={`/shop/products/${item.slug || item.productId}`} onClick={closeSidebar} className="flex-shrink-0">
                  <Image
                    src={getProductImageUrl(item.image)}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="w-20 h-20 object-cover rounded border border-border-light"
                  />
                </Link>

                {/* Details */}
                <div className="flex-grow">
                  <Link href={`/shop/products/${item.slug || item.productId}`} onClick={closeSidebar} className="hover:text-brand-gold">
                    <h3 className="font-medium text-sm text-text-dark mb-1 font-poppins line-clamp-2">{item.name}</h3>
                  </Link>
                  {item.size && <p className="text-xs text-text-light mb-1 font-poppins">Size: {item.size}</p>}
                  <p className="text-sm text-brand-gold font-medium mb-2 font-poppins">{formatCurrency(item.price)}</p>

                  {/* Quantity & Remove */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-border-light rounded">
                      <button
                        onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                        className="px-2 py-1 text-text-dark hover:bg-gray-100 disabled:text-gray-300"
                        disabled={item.quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-sm font-medium font-poppins">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                        className="px-2 py-1 text-text-dark hover:bg-gray-100"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId, item.size)}
                      className="text-red-500 hover:text-red-700 transition-colors ml-3"
                        aria-label="Remove item"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                   {/* Save for Later Button */}
                   <button
                      onClick={() => saveItemForLater(item.productId, item.size)}
                      className="text-xs text-blue-600 hover:underline mt-2"
                    >
                      Save for Later
                    </button>
                </div>
              </div>
            ))
          )}

          {/* Saved for Later Section */}
          {savedItems.length > 0 && (
            <div className="mt-8 pt-6 border-t border-border-light">
              <h3 className="text-base font-semibold font-montserrat text-text-dark mb-4">Saved for Later ({savedItems.length})</h3>
              <div className="space-y-4">
                {savedItems.map((item) => (
                  <div key={`saved-${item.productId}-${item.size || 'no-size'}`} className="flex items-start gap-4 border-b border-border-light pb-4 last:border-b-0">
                    {/* Image */}
                    <Link href={`/shop/products/${item.slug || item.productId}`} onClick={closeSidebar} className="flex-shrink-0">
                      <Image
                        src={getProductImageUrl(item.image)}
                        alt={item.name}
                        width={60} // Slightly smaller image for saved items
                        height={60}
                        className="w-15 h-15 object-cover rounded border border-border-light"
                      />
                    </Link>
                    {/* Details */}
                    <div className="flex-grow">
                      <Link href={`/shop/products/${item.slug || item.productId}`} onClick={closeSidebar} className="hover:text-brand-gold">
                        <h4 className="font-medium text-sm text-text-dark mb-1 font-poppins line-clamp-2">{item.name}</h4>
                      </Link>
                      {item.size && <p className="text-xs text-text-light mb-1 font-poppins">Size: {item.size}</p>}
                      <p className="text-sm text-brand-gold font-medium mb-2 font-poppins">{formatCurrency(item.price)}</p>
                      {/* Action Buttons */}
                      <div className="flex items-center space-x-3 mt-2">
                         <button
                           onClick={() => moveSavedItemToCart(item.productId, item.size)}
                           className="text-xs text-blue-600 hover:underline"
                         >
                           Move to Cart
                         </button>
                         <button
                           onClick={() => removeSavedItem(item.productId, item.size)}
                           className="text-xs text-red-500 hover:underline"
                         >
                           Remove
                         </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cross-Sell Section */}
          {crossSellItems.length > 0 && (
             <div className="mt-8 pt-6 border-t border-border-light">
               <h3 className="text-base font-semibold font-montserrat text-text-dark mb-4">You Might Also Like</h3>
               <div className="space-y-4">
                 {crossSellItems.map((item) => (
                   <div key={`cross-${item.productId}`} className="flex items-center gap-3">
                     <Link href={`/shop/products/${item.slug || item.productId}`} onClick={closeSidebar} className="flex-shrink-0">
                       <Image
                         src={getProductImageUrl(item.image)}
                         alt={item.name}
                         width={50}
                         height={50}
                         className="w-12 h-12 object-cover rounded border border-border-light"
                       />
                     </Link>
                     <div className="flex-grow">
                       <Link href={`/shop/products/${item.slug || item.productId}`} onClick={closeSidebar} className="hover:text-brand-gold">
                         <h4 className="font-medium text-xs text-text-dark mb-1 font-poppins line-clamp-1">{item.name}</h4>
                       </Link>
                       <p className="text-xs text-brand-gold font-medium font-poppins">{formatCurrency(item.price)}</p>
                     </div>
                      {/* Simple Add button - assumes no size selection needed here */}
                      <Button
                         variant="secondary"
                         // Removed size="xs" prop
                         className="text-xs ml-auto px-3 py-1" // Added some padding for better click area
                        onClick={() => addItem(item)} // Use addItem from store
                     >
                       Add
                     </Button>
                   </div>
                 ))}
               </div>
             </div>
          )}
           {isLoadingCrossSell && <p className="text-sm text-center text-text-light mt-4">Loading recommendations...</p>}


        </div>

        {/* Footer (Only shows active cart total) */}
        {items.length > 0 && (
          <div className="p-5 border-t border-border-light flex-shrink-0 bg-gray-50">
            <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-dark font-poppins">Subtotal:</span>
                  <span className="text-sm font-medium text-text-dark font-poppins">{formatCurrency(subtotal)}</span>
                </div>
                 <div className="flex justify-between items-center">
                  <span className="text-sm text-text-dark font-poppins">Est. Shipping:</span>
                  <span className="text-sm font-medium text-text-dark font-poppins">
                    {subtotal >= freeShippingThreshold ? 'FREE' : formatCurrency(shippingCost)}
                  </span>
                </div>
                {/* Free Shipping Progress Bar */}
                {subtotal < freeShippingThreshold && amountNeededForFreeShipping > 0 && (
                    <div className="mt-3">
                        <p className="text-xs text-center text-text-light mb-1 font-poppins">
                            Add <span className="font-medium text-brand-gold">{formatCurrency(amountNeededForFreeShipping)}</span> more for FREE shipping!
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                                className="bg-brand-gold h-1.5 rounded-full transition-all duration-300 ease-in-out"
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>
                    </div>
                )}
                 {subtotal >= freeShippingThreshold && (
                     <p className="text-xs text-center text-green-600 mt-3 font-poppins font-medium">
                         🎉 You've qualified for FREE shipping!
                     </p>
                 )}
                 {/* Optional: Display total */}
                 {/* <div className="flex justify-between items-center border-t border-border-light pt-2 mt-2">
                   <span className="text-base font-semibold text-text-dark font-poppins">Est. Total:</span>
                   <span className="text-lg font-semibold text-brand-gold font-poppins">{formatCurrency(subtotal + shippingCost)}</span>
                 </div> */}
            </div>
            <p className="text-xs text-text-light mb-4 text-center font-poppins">Final shipping & taxes calculated at checkout.</p>
            <Link href="/checkout/cart" onClick={closeSidebar} legacyBehavior>
              <Button variant="secondary" className="w-full mb-2">View Cart Page</Button>
            </Link>
            <Link href="/checkout/delivery" onClick={closeSidebar} legacyBehavior>
               <Button variant="primary" className="w-full">Proceed to Checkout</Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
