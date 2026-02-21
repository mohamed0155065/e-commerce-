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
 * The state is persisted in localStorage using Zustand's persist middleware.
 */
export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            /**
             * Initial cart state
             */
            items: [],

            addItem: (product) => {
                // Get current snapshot of cart items
                const currentItems = get().items;

                // Check if product already exists in cart
                const existingItem = currentItems.find(
                    item => item.id === product.id
                );

                if (existingItem) {
                    // If product exists, create a new array
                    // and increment the quantity of the matching item
                    const updatedItems = currentItems.map(item =>
                        item.id === product.id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    );

                    set({ items: updatedItems });
                } else {
                    // If product does not exist, add it with quantity = 1
                    set({
                        items: [
                            ...currentItems,
                            { ...product, quantity: 1 }
                        ]
                    });
                }
            },

            /**
             * Removes a specific item from the cart.
             * Uses filter to maintain immutability.
             */
            removeItem: (id) =>
                set({
                    items: get().items.filter((i) => i.id !== id)
                }),

            /**
             * Clears the cart completely.
             */
            clearCart: () =>
                set({ items: [] }),

            /**
             * Calculates total quantity of items in the cart.
             */
            getTotalItems: () =>
                get().items.reduce(
                    (acc, item) => acc + item.quantity,
                    0
                ),

            /**
             * Calculates total price of all cart items.
             */
            getTotalPrice: () =>
                get().items.reduce(
                    (acc, item) => acc + (item.Price * item.quantity),
                    0
                ),
        }),
        {
            /**
             * Storage key used in localStorage.
             */
            name: 'shopping-cart'
        }
    )
);
