"use client"; // Required for using hooks and client-side state (Zustand)

import { Product } from "@/types";
import { useCartStore } from "@/store/useCartStore";
import Link from "next/link";
/**
 * ProductCard Component
 *
 * Displays product information and provides
 * an action to add the product to the cart.
 *
 * This is a Client Component because it:
 * - Uses Zustand (client-side state)
 * - Handles user interactions (onClick)
 */
export const ProductCard = ({ product }: { product: Product }) => {

    /**
     * Selects the addItem action from the cart store.
     * Using selector pattern prevents unnecessary re-renders.
     */
    const addItem = useCartStore((state) => state.addItem);

    return (
        <div className="border p-4 rounded-lg shadow-sm hover:shadow-md transition bg-white">

            {/* Product Image */}
            {/* object-cover ensures the image fills the container without distortion */}

            <Link href={`/product/${product.id}`}>
                <img
                    src={product.Image}
                    alt={product.Name}
                    className="w-full h-48 object-cover rounded"
                />

                {/* Product Name */}
                <h2 className="font-bold mt-2 text-lg">
                    {product.Name}
                </h2></Link>


            <div className="flex justify-between items-center mt-4">

                {/* Product Price */}
                <span className="text-orange-600 font-bold text-xl">
                    ${product.Price}
                </span>

                {/* Add to Cart Button */}
                {/* Triggers addItem from Zustand store */}
                <button
                    onClick={() => addItem(product)}
                    className="bg-black text-white px-4 py-2 rounded-lg hover:bg-red-600 active:scale-95 transition"
                >
                    Add to Cart
                </button>
            </div>
        </div>
    );
};
