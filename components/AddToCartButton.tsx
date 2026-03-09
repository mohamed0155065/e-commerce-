"use client";

import { useCartStore } from "@/store/useCartStore";
import { Product } from "@/types";
import { ShoppingCart } from "lucide-react";

/**
 * AddToCartButton
 * - Adds a product to the global cart store
 * - Shows a button with icon and text
 */
export default function AddToCartButton({ product }: { product: Product }) {
    const addItem = useCartStore((state) => state.addItem);

    return (
        <button
            onClick={() => addItem(product)}
            className="flex items-center justify-center gap-3 bg-black text-white px-8 py-5 rounded-2xl font-bold text-xl hover:bg-orange-600 transition-transform active:scale-95 shadow-lg"
            title={`Add ${product.Name} to cart`} // improves accessibility
        >
            <ShoppingCart size={24} />
            Add to Cart
        </button>
    );
}