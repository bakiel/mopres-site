// Utility functions for managing the shopping cart in localStorage

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  size: string | null; // Size can be null if product doesn't require size selection
  quantity: number;
  image?: string; // Optional image URL for display in cart
  slug: string; // Add slug for linking back to product
  sku?: string; // Add optional sku for invoice generation etc.
}

const CART_STORAGE_KEY = 'mopres_cart';

// Function to get the cart from localStorage
export const getCart = (): CartItem[] => {
  if (typeof window === 'undefined') {
    // Cannot access localStorage on server-side
    return [];
  }
  try {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    return storedCart ? JSON.parse(storedCart) : [];
  } catch (error) {
    console.error("Error reading cart from localStorage:", error);
    // If parsing fails, return an empty cart
    return [];
  }
};

// Function to save the cart to localStorage
const saveCart = (cart: CartItem[]): void => {
   if (typeof window === 'undefined') {
    console.warn("Cannot save cart on server-side.");
    return;
  }
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    // Optional: Dispatch a custom event to notify other components (like header cart icon)
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  } catch (error) {
    console.error("Error saving cart to localStorage:", error);
  }
};

// Function to add an item to the cart
export const addToCart = (itemToAdd: Omit<CartItem, 'quantity'> & { quantity: number }): void => {
  const cart = getCart();
  // Check if item with the same ID and size already exists
  const existingItemIndex = cart.findIndex(
    item => item.productId === itemToAdd.productId && item.size === itemToAdd.size
  );

  if (existingItemIndex > -1) {
    // Item exists, update quantity
    cart[existingItemIndex].quantity += itemToAdd.quantity;
  } else {
    // Item doesn't exist, add it to the cart
    cart.push({ ...itemToAdd });
  }

  saveCart(cart);
};

// Function to remove an item from the cart (by product ID and size)
export const removeFromCart = (productId: string, size: string | null): void => {
  let cart = getCart();
  cart = cart.filter(item => !(item.productId === productId && item.size === size));
  saveCart(cart);
};

// Function to update the quantity of an item in the cart
export const updateCartItemQuantity = (productId: string, size: string | null, newQuantity: number): void => {
  let cart = getCart();
  const itemIndex = cart.findIndex(item => item.productId === productId && item.size === size);

  if (itemIndex > -1) {
    if (newQuantity > 0) {
      cart[itemIndex].quantity = newQuantity;
    } else {
      // If new quantity is 0 or less, remove the item
      cart.splice(itemIndex, 1);
    }
    saveCart(cart);
  }
};

// Function to clear the entire cart
export const clearCart = (): void => {
  saveCart([]);
};

// Function to get the total number of items in the cart
export const getCartItemCount = (): number => {
  const cart = getCart();
  return cart.reduce((total, item) => total + item.quantity, 0);
};

// Function to calculate the total price of the cart
export const getCartTotal = (): number => {
    const cart = getCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
};
