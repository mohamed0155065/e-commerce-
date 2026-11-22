"use client";
import { useCartStore } from "@/featues/card/store/useCartStore";
import { Product } from "../types/products.types";
import { ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";

export default function AddToCartButton({ product }: { product: Product }) {
  const common = useTranslations("common");
  const productT = useTranslations("product");
  const addItem = useCartStore((state) => state.addItem);
  const outOfStock = (product.Stock ?? 0) <= 0;

  return (
    <button
      onClick={() => !outOfStock && addItem(product)}
      disabled={outOfStock}
      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--brand)] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-hover)] active:translate-y-px disabled:bg-stone-300 disabled:cursor-not-allowed"
      aria-label={
        outOfStock
          ? productT("unavailable", { name: product.Name })
          : productT("addToCart", { name: product.Name })
      }
    >
      <ShoppingBag size={17} />
      {outOfStock ? common("outOfStock") : common("addToCart")}
    </button>
  );
}