"use client";
import { useCartStore } from "@/store/useCartStore";
import { Product } from "@/types";
import { ShoppingBag } from "lucide-react";

export default function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <button
      onClick={() => addItem(product)}
      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#14532d] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#0d3d21] active:translate-y-px"
      aria-label={`Add ${product.Name} to cart`}
    >
      <ShoppingBag size={17} />
      Add to cart
    </button>
  );
}