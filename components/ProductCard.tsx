"use client"

import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { Product } from "@/types";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useHydration } from "@/store/useHydration";

/**
 * ProductCard is rendered N times per catalog page (a grid of 20-40+ items
 * is typical). Two changes here matter at that scale:
 *
 * 1. `useHydration()` replaces the local mounted/useEffect pair. With the
 *    old pattern, a 40-item grid produced 40 independent post-mount
 *    re-renders; now hydration flips once, from one shared subscription.
 *
 * 2. `React.memo` below stops a card from re-rendering when a SIBLING card
 *    toggles its own wishlist/cart state or when the parent grid re-renders
 *    for an unrelated reason (e.g. a filter changing). Because `product` is
 *    the only prop and it's stable per item, memo is a cheap, safe win here.
 */
const ProductCardImpl = ({ product }: { product: Product }) => {
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const wishlisted = useWishlistStore((state) =>
    state.items.some((item) => item.id === product.id)
  );
  const mounted = useHydration();
  const rating = product.Rating ?? 4.5;
  const outOfStock = (product.Stock ?? 0) <= 0;

  return (
    <article className="group min-w-0 rounded-xl border border-stone-200 bg-white p-3 transition hover:shadow-md">
      <div className="relative">
        <Link
          href={`/product/${product.id}`}
          className="block overflow-hidden rounded-lg bg-[#f5f6f2]"
          aria-label={`View ${product.Name}`}
        >
          <div className="relative aspect-square">
            <Image
              src={product.Image}
              alt={product.Name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-contain p-6 transition duration-500 group-hover:scale-[1.035]"
            />
          </div>
        </Link>

        {outOfStock && (
          <span className="absolute left-2 top-2 rounded-full bg-stone-900/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
            Out of stock
          </span>
        )}

        <button
          type="button"
          onClick={() => toggleWishlist(product)}
          className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-stone-500 shadow-sm transition hover:text-[#b42318]"
          aria-label={mounted && wishlisted ? `Remove ${product.Name} from wishlist` : `Add ${product.Name} to wishlist`}
          aria-pressed={mounted && wishlisted}
        >
          <Heart
            size={16}
            fill={mounted && wishlisted ? "#b42318" : "none"}
            color={mounted && wishlisted ? "#b42318" : "currentColor"}
          />
        </button>
      </div>

      <div className="pt-3">
        {product.Category && (
          <p className="truncate text-[11px] font-medium uppercase tracking-wide text-stone-400">
            {product.Category}
          </p>
        )}

        <Link href={`/product/${product.id}`}>
          <h3 className="mt-1 truncate text-sm font-semibold text-stone-900 hover:text-[#14532d]">
            {product.Name}
          </h3>
        </Link>

        <div className="mt-1.5 flex items-center gap-1">
          <div className="flex items-center gap-0.5 text-[#e6ad42]">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                size={13}
                fill={index < Math.round(rating) ? "#e6ad42" : "none"}
                color="#e6ad42"
              />
            ))}
          </div>
          <span className="text-xs text-stone-400">({rating.toFixed(1)})</span>
        </div>

        <div className="mt-2.5 flex items-center justify-between gap-3">
          <p className="text-base font-semibold tracking-[-.02em] text-stone-900">
            ${product.Price.toLocaleString()}
          </p>
          <button
            onClick={() => !outOfStock && addItem(product)}
            disabled={outOfStock}
            className="grid h-9 w-9 place-items-center rounded-lg bg-[#14532d] text-white transition hover:bg-[#0d3d21] disabled:bg-stone-300 disabled:cursor-not-allowed"
            aria-label={outOfStock ? `${product.Name} is out of stock` : `Add ${product.Name} to cart`}
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </article>
  );
};


export const ProductCard = memo(ProductCardImpl);