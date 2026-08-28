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