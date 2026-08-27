import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types';

/**
 * WishlistState defines the shape of the wishlist store.
 */
interface WishlistState {
    items: Product[];

    /**
     * Adds a product to the wishlist.
     * Does nothing if the product is already in the wishlist.
     */
    addItem: (product: Product) => void;

    /**
     * Removes a product from the wishlist by its id.
     */
    removeItem: (id: string) => void;

    /**
     * Adds the product if it's not in the wishlist yet,
     * removes it if it already is. Used by the heart icon toggle.
     */
    toggleItem: (product: Product) => void;

    /**
     * Returns true if the given product id is currently wishlisted.
     */
    isWishlisted: (id: string) => boolean;

    /**
     * Clears the wishlist completely.
     */
    clearWishlist: () => void;

    /**
     * Returns the total number of wishlisted items.
     */
    getTotalItems: () => number;
}

/**
 * useWishlistStore
 *
 * Zustand store responsible for managing the wishlist state.
 * State is persisted in localStorage using Zustand's persist middleware,
 * the same way useCartStore persists the cart.
 */
export const useWishlistStore = create<WishlistState>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (product) => {
                const currentItems = get().items;
                const alreadyIn = currentItems.some((item) => item.id === product.id);

                if (!alreadyIn) {
                    set({ items: [...currentItems, product] });
                }
            },

            removeItem: (id) => {
                set({ items: get().items.filter((item) => item.id !== id) });
            },

            toggleItem: (product) => {
                const currentItems = get().items;
                const alreadyIn = currentItems.some((item) => item.id === product.id);

                if (alreadyIn) {
                    set({ items: currentItems.filter((item) => item.id !== product.id) });
                } else {
                    set({ items: [...currentItems, product] });
                }
            },

            isWishlisted: (id) => get().items.some((item) => item.id === id),

            clearWishlist: () => set({ items: [] }),

            getTotalItems: () => get().items.length,
        }),
        {
            // Storage key in localStorage for persistence
            name: 'wishlist',
        }
    )
);