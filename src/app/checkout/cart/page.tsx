'use client'; // This page needs client-side access to localStorage

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/Button';
import SectionTitle from '@/components/SectionTitle';
import { getCart, removeFromCart, updateCartItemQuantity, getCartTotal, CartItem } from '@/lib/cartUtils'; // Import cart utilities
import { supabase, getProductImageUrl } from '@/lib/supabaseClient'; // Import Supabase client and shared function

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load cart items from localStorage on component mount
  useEffect(() => {
    setCartItems(getCart());
    setLoading(false);

    // Optional: Listen for cart updates triggered by cartUtils
    const handleCartUpdate = () => {
        setCartItems(getCart());
    };
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => {
        window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  const handleRemove = (productId: string, size: string | null) => {
    removeFromCart(productId, size);
    // State will update via the 'cartUpdated' event listener or manually:
    // setCartItems(getCart());
  };

  const handleQuantityChange = (productId: string, size: string | null, newQuantity: number) => {
    if (newQuantity >= 1) {
      updateCartItemQuantity(productId, size, newQuantity);
      // setCartItems(getCart());
    } else {
      // Optionally remove if quantity becomes 0 or less
      handleRemove(productId, size);
    }
  };

  const cartTotal = getCartTotal();

  const formatCurrency = (amount: number) => {
     return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
  }

  if (loading) {
      return (
          <div className="bg-background-body py-12 lg:py-20">
              <div className="w-full max-w-screen-xl mx-auto px-4 text-center">
                  <p className="text-text-light">Loading cart...</p>
              </div>
          </div>
      );
  }

  return (
    <div className="bg-background-body py-12 lg:py-20">
      <div className="w-full max-w-screen-lg mx-auto px-4"> {/* Slightly wider container */}
        <SectionTitle centered>Shopping Cart</SectionTitle>

        {cartItems.length > 0 ? (
          <div className="mt-8 font-poppins"> {/* Added font-poppins */}
            {/* Cart Items Table/List */}
            <div className="space-y-6">
              {cartItems.map((item) => (
                <div key={`${item.productId}-${item.size || 'no-size'}`} className="flex flex-col md:flex-row items-center gap-4 md:gap-6 bg-white p-4 border border-border-light rounded shadow-sm">
                  {/* Image */}
                  <Link href={`/shop/products/${item.slug}`} className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 block overflow-hidden rounded border border-border-light">
                    <img
                      src={getProductImageUrl(item.image)} // Use function to get Supabase URL or fallback
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </Link>
                  {/* Details */}
                  <div className="flex-grow text-center md:text-left">
                    <Link href={`/shop/products/${item.slug}`}>
                      <h3 className="font-semibold text-lg hover:text-brand-gold transition-colors">{item.name}</h3>
                    </Link>
                    {item.size && <p className="text-sm text-text-light mt-1 font-poppins">Size: {item.size}</p>} {/* Added font-poppins */}
                    <p className="text-text-dark mt-1 font-medium">{formatCurrency(item.price)}</p>
                  </div>
                  {/* Quantity */}
                  <div className="flex items-center gap-2 flex-shrink-0 my-2 md:my-0">
                     <label htmlFor={`quantity-${item.productId}-${item.size}`} className="sr-only">Quantity</label>
                     <input
                        type="number"
                        id={`quantity-${item.productId}-${item.size}`}
                        value={item.quantity}
                         onChange={(e) => handleQuantityChange(item.productId, item.size, parseInt(e.target.value, 10))}
                         min="1"
                         className="w-16 py-1 px-2 border border-border-light rounded focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold text-center font-poppins"
                      /> {/* Added font-poppins */}
                   </div>
                   {/* Total Price per Item */}
                   <div className="flex-shrink-0 w-24 text-center md:text-right font-medium">
                       {formatCurrency(item.price * item.quantity)}
                   </div>
                  {/* Remove Button */}
                  <div className="flex-shrink-0">
                    <Button
                      variant="outline-light"
                      onClick={() => handleRemove(item.productId, item.size)}
                      className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-500 px-3 py-1 text-sm" // Smaller padding
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary & Checkout */}
            <div className="mt-10 pt-6 border-t border-border-light flex flex-col md:flex-row justify-between items-center">
              <div className="text-lg font-semibold mb-4 md:mb-0">
                Subtotal: <span className="text-xl">{formatCurrency(cartTotal)}</span>
              </div>
              <div>
                <Link href="/shop" className="mr-4">
                    <Button variant="secondary">Continue Shopping</Button>
                </Link>
                <Link href="/checkout/delivery">
                    <Button variant="primary">Proceed to Checkout</Button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center mt-8 bg-white p-12 border border-border-light rounded shadow-sm font-poppins"> {/* Added font-poppins */}
            <h2 className="text-xl font-semibold mb-4">Your cart is empty.</h2>
            <p className="text-text-light mb-6">Looks like you haven't added anything to your cart yet.</p>
            <Link href="/shop">
                <Button variant="primary">Start Shopping</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
