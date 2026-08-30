import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types';

interface CartItem extends Product {
    quantity: number;
}

interface CartState {
    items: CartItem[];
    addItem: (product: Product) => void;
    removeItem: (id: string) => void;
    /**
     * Removes every unit of a single line item in one state update.
     *
     * Before this action existed, "remove this line entirely" was done in
     * CartDrawer with `for (let i = 0; i < item.quantity; i++) removeItem(id)`.
     * That is O(quantity) calls to `set()` for something that only ever needs
     * O(1): it re-derives the same "items minus this id" array repeatedly
     * instead of doing it once. React 18 batches the resulting re-renders
     * inside one event handler, so it "worked", but it is still needless
     * array churn and needless work for the persist middleware, which
     * serializes to localStorage on every `set()` call.
     */
    removeAllOfItem: (id: string) => void;
    clearCart: () => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (product) => {
                const currentItems = get().items;
                const existingItem = currentItems.find(item => item.id === product.id);
                const maxStock = product.Stock ?? Infinity;

                if (existingItem) {
                    if (existingItem.quantity >= maxStock) return;
                    const updatedItems = currentItems.map(item =>
                        item.id === product.id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    );
                    set({ items: updatedItems });
                } else {
                    if (maxStock <= 0) return;
                    set({
                        items: [...currentItems, { ...product, quantity: 1 }]
                    });
                }
            },

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

            removeAllOfItem: (id: string) => {
                set({ items: get().items.filter(item => item.id !== id) });
            },

            clearCart: () => set({ items: [] }),

            getTotalItems: () =>
                get().items.reduce((acc, item) => acc + item.quantity, 0),

            getTotalPrice: () =>
                get().items.reduce((acc, item) => acc + (item.Price * item.quantity), 0),
        }),
        {
            name: 'shopping-cart'
        }
    )
);