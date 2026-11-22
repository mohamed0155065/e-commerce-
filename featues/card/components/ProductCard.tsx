"use client"

import Image from "next/image";
import { memo } from "react";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatUSD } from "@/i18n/formatters";
import { Product } from "../../products/types/products.types";
import { useCartStore } from "../store/useCartStore";
import { useWishlistStore } from "@/featues/wishlist/store/useWishlistStore";
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
  const locale = useLocale();
  const t = useTranslations("product");
  const common = useTranslations("common");
  const categories = useTranslations("home");
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
          className="block overflow-hidden rounded-lg bg-[var(--canvas)]"
          aria-label={`${product.Name}`}
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
          <span className="absolute start-2 top-2 rounded-full bg-[#09090B]/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
            {common("outOfStock")}
          </span>
        )}

        <button
          type="button"
          onClick={() => toggleWishlist(product)}
          className="absolute end-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-stone-500 shadow-sm transition hover:text-[#b42318]"
          aria-label={
            mounted && wishlisted
              ? t("removeFromWishlist", { name: product.Name })
              : t("addToWishlist", { name: product.Name })
          }
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
            {categories.has(`categories.${product.Category}`)
              ? categories(`categories.${product.Category}`)
              : product.Category.replaceAll("_", " ")}
          </p>
        )}

        <Link href={`/product/${product.id}`}>
          <h3 className="mt-1 truncate text-sm font-semibold text-stone-900 hover:text-[var(--brand)]">
            {product.Name}
          </h3>
        </Link>

        <div className="mt-1.5 flex items-center gap-1">
          <div className="flex items-center gap-0.5 text-[var(--accent)]">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                size={13}
                fill={index < Math.round(rating) ? "var(--accent)" : "none"}
                color="var(--accent)"
              />
            ))}
          </div>
          <span className="text-xs text-stone-400" aria-label={t("rating", { rating })}>
            ({rating.toFixed(1)})
          </span>
        </div>

        <div className="mt-2.5 flex items-center justify-between gap-3">
          <p className="text-base font-semibold tracking-[-.02em] text-stone-900">
            {formatUSD(locale, product.Price)}
          </p>
          <button
            onClick={() => !outOfStock && addItem(product)}
            disabled={outOfStock}
            className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--brand)] text-white transition hover:bg-[var(--brand-hover)] disabled:bg-stone-300 disabled:cursor-not-allowed"
            aria-label={
              outOfStock
                ? t("unavailable", { name: product.Name })
                : t("addToCart", { name: product.Name })
            }
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </article>
  );
};


export const ProductCard = memo(ProductCardImpl);