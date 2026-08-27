"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, ArrowLeft } from "lucide-react";
import { useWishlistStore } from "@/store/useWishlistStore";
import { ProductCard } from "@/components/ProductCard";

export default function WishlistPage() {
  const items = useWishlistStore((state) => state.items);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="page-shell pb-20 pt-10">
      <div className="mb-8">
        <p className="eyebrow">Saved for later</p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-.02em] text-stone-950">
          Your Wishlist
        </h1>
        {mounted && (
          <p className="mt-2 text-sm text-stone-500">
            {items.length} {items.length === 1 ? "item" : "items"} saved
          </p>
        )}
      </div>

      {!mounted ? null : items.length === 0 ? (
        <div className="border border-dashed border-stone-300 bg-white px-6 py-20 text-center">
          <Heart className="mx-auto text-stone-400" size={28} />
          <h3 className="mt-4 text-lg font-semibold">
            Your wishlist is empty
          </h3>
          <p className="mt-2 text-sm text-stone-500">
            Tap the heart icon on any product to save it here.
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#14532d] hover:underline"
          >
            <ArrowLeft size={15} />
            Browse products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 xl:grid-cols-5">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}