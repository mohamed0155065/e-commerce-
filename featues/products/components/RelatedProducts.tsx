"use client";

import { Product } from "../types/products.types";
import { ProductCard } from "@/featues/card/components/ProductCard";

export function RelatedProducts({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 sm:gap-x-5">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
        />
      ))}
    </div>
  );
}