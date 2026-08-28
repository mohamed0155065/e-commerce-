"use client";
import { useCartStore } from "@/store/useCartStore";
import { Product } from "@/types";
import { ShoppingBag } from "lucide-react";

export default function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  const outOfStock = (product.Stock ?? 0) <= 0;

  return (
    <button
      onClick={() => !outOfStock && addItem(product)}
      disabled={outOfStock}
      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#14532d] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#0d3d21] active:translate-y-px disabled:bg-stone-300 disabled:cursor-not-allowed"
      aria-label={outOfStock ? `${product.Name} is out of stock` : `Add ${product.Name} to cart`}
    >
      <ShoppingBag size={17} />
      {outOfStock ? "Out of stock" : "Add to cart"}
    </button>
  );
}