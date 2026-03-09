import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types';

/**
 * CartItem represents a product inside the cart.
 * It extends the base Product type by adding a quantity field.
 */
interface CartItem extends Product {
    quantity: number;
}

/**
 * CartState defines the shape of the shopping cart store.
 */
interface CartState {
    items: CartItem[];

    /**
     * Adds a product to the cart.
     * - If the product already exists, its quantity is incremented.
     * - If it does not exist, it is added with quantity = 1.
     */
    addItem: (product: Product) => void;

    /**
     * Removes a product from the cart by its id.
     * - If the item's quantity > 1, decrement by 1.
     * - If quantity = 1, remove it entirely.
     */
    removeItem: (id: string) => void;

    /**
     * Clears all items from the cart.
     */
    clearCart: () => void;

    /**
     * Returns the total number of items in the cart.
     */
    getTotalItems: () => number;

    /**
     * Returns the total price of all items in the cart.
     */
    getTotalPrice: () => number;
}

/**
 * useCartStore
 *
 * Zustand store responsible for managing shopping cart state.
 * State is persisted in localStorage using Zustand's persist middleware.
 */
export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            // Initial cart state
            items: [],

            /**
             * Add a product to the cart.
             * - Checks if the product already exists.
             * - If yes, increments quantity.
             * - If not, adds a new CartItem with quantity = 1.
             */
            addItem: (product) => {
                const currentItems = get().items;
                const existingItem = currentItems.find(item => item.id === product.id);

                if (existingItem) {
                    // Increment quantity of existing item
                    const updatedItems = currentItems.map(item =>
                        item.id === product.id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    );
                    set({ items: updatedItems });
                } else {
                    // Add new item with quantity = 1
                    set({
                        items: [...currentItems, { ...product, quantity: 1 }]
                    });
                }
            },

            /**
             * Remove a product from the cart.
             * - If quantity > 1, decrement quantity by 1.
             * - If quantity = 1, remove the item completely.
             */
            removeItem: (id: string) => {
                const currentItems = get().items;
                const existingItem = currentItems.find(item => item.id === id);

                if (existingItem && existingItem.quantity > 1) {
                    set({
                        items: currentItems.map(item =>
                            item.id === id ? { ...item, quantity: item.quantity - 1 } : item
                        ),
                    });
                } else {
                    set({
                        items: currentItems.filter(item => item.id !== id),
                    });
                }
            },

            /**
             * Clears the cart completely.
             */
            clearCart: () => set({ items: [] }),

            /**
             * Returns total quantity of items in the cart.
             */
            getTotalItems: () =>
                get().items.reduce((acc, item) => acc + item.quantity, 0),

            /**
             * Returns total price of all items in the cart.
             */
            getTotalPrice: () =>
                get().items.reduce((acc, item) => acc + (item.Price * item.quantity), 0),
        }),
        {
            // Storage key in localStorage for persistence
            name: 'shopping-cart'
        }
    )
);