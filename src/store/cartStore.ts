import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import toast from 'react-hot-toast';

// Define the structure of a cart item
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  size: string | null; // Allow null if size isn't applicable/selected
  quantity: number;
  image?: string;
  slug?: string;
  sku?: string;
  collection_id?: string; // Add collection_id
}

// Define the state structure for the cart store
interface CartState {
  items: CartItem[];
  savedItems: CartItem[]; // Add state for saved items
  isSidebarOpen: boolean;
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void; // Allow adding with optional initial quantity
  removeItem: (productId: string, size: string | null) => void;
  updateQuantity: (productId: string, size: string | null, quantity: number) => void;
  clearCart: () => void;
  saveItemForLater: (productId: string, size: string | null) => void; // New action
  moveSavedItemToCart: (productId: string, size: string | null) => void; // New action
  removeSavedItem: (productId: string, size: string | null) => void; // New action
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  getTotalItems: () => number; // Calculates active cart items
  getTotalPrice: () => number; // Calculates active cart price
}

// Create the Zustand store with persistence
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      savedItems: [], // Initialize saved items
      isSidebarOpen: false,

      // Action to add an item or update quantity if it exists
      addItem: (newItem) => {
        const { productId, size } = newItem;
        const quantityToAdd = newItem.quantity ?? 1; // Default to adding 1
        const existingItemIndex = get().items.findIndex(
          (item) => item.productId === productId && item.size === size
        );

        let updatedItems;
        if (existingItemIndex > -1) {
          // Item with the same ID and size exists, update quantity
          updatedItems = [...get().items];
          const existingItem = updatedItems[existingItemIndex];
          updatedItems[existingItemIndex] = {
            ...existingItem,
            quantity: existingItem.quantity + quantityToAdd,
          };
           toast.success(`${newItem.name} quantity updated in cart.`);
        } else {
          // Item is new, add it to the cart
          updatedItems = [...get().items, { ...newItem, quantity: quantityToAdd }];
           toast.success(`${newItem.name} ${newItem.size ? `(Size: ${newItem.size})` : ''} added to cart.`);
        }

        set({ items: updatedItems, isSidebarOpen: true }); // Open sidebar on add
      },

      // Action to remove an item completely
      removeItem: (productId, size) => {
        const updatedItems = get().items.filter(
          (item) => !(item.productId === productId && item.size === size)
        );
        set({ items: updatedItems });
        toast.success(`Item removed from cart.`);
         // Close sidebar if cart becomes empty? Optional.
         // if (updatedItems.length === 0) {
         //   set({ isSidebarOpen: false });
         // }
      },

      // Action to update the quantity of a specific item
      updateQuantity: (productId, size, quantity) => {
        if (quantity < 1) {
          // If quantity is less than 1, remove the item
          get().removeItem(productId, size);
          return;
        }
        const updatedItems = get().items.map((item) =>
          item.productId === productId && item.size === size
            ? { ...item, quantity }
            : item
        );
        set({ items: updatedItems });
      },

      // Action to clear the entire cart (only active items)
      clearCart: () => {
        set({ items: [] }); // Keep saved items, maybe close sidebar?
        toast.success('Active cart cleared.');
        // Optionally clear saved items too: set({ items: [], savedItems: [] });
      },

      // Action to move an item from cart to saved list
      saveItemForLater: (productId, size) => {
        const itemToSave = get().items.find(
          (item) => item.productId === productId && item.size === size
        );
        if (!itemToSave) return;

        const updatedItems = get().items.filter(
          (item) => !(item.productId === productId && item.size === size)
        );
        const updatedSavedItems = [...get().savedItems, itemToSave]; // Add to saved

        set({ items: updatedItems, savedItems: updatedSavedItems });
        toast.success(`${itemToSave.name} saved for later.`);
      },

       // Action to move an item from saved list back to cart
       moveSavedItemToCart: (productId, size) => {
        const itemToMove = get().savedItems.find(
          (item) => item.productId === productId && item.size === size
        );
        if (!itemToMove) return;

        const updatedSavedItems = get().savedItems.filter(
          (item) => !(item.productId === productId && item.size === size)
        );
         // Use addItem logic to handle potential merging if item already exists in cart
         get().addItem(itemToMove);
         // Remove from saved items *after* adding back to cart
         set({ savedItems: updatedSavedItems });
         // Toast is handled by addItem
       },

       // Action to remove an item permanently from the saved list
       removeSavedItem: (productId, size) => {
         const itemToRemove = get().savedItems.find(
           (item) => item.productId === productId && item.size === size
         );
         if (!itemToRemove) return;

         const updatedSavedItems = get().savedItems.filter(
           (item) => !(item.productId === productId && item.size === size)
         );
         set({ savedItems: updatedSavedItems });
         toast.success(`${itemToRemove.name} removed from saved items.`);
       },


      // Action to toggle sidebar visibility
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

      // Action to explicitly open the sidebar
      openSidebar: () => set({ isSidebarOpen: true }),

      // Action to explicitly close the sidebar
      closeSidebar: () => set({ isSidebarOpen: false }),

      // Selector to get the total number of items (sum of quantities)
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      // Selector to get the total price of all items
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'mopres-cart-storage', // Unique name for localStorage key
      storage: createJSONStorage(() => localStorage), // Use localStorage for persistence
    }
  )
);
