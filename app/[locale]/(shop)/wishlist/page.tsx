"use client";

import { Heart, ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useWishlistStore } from "@/featues/wishlist/store/useWishlistStore";
import { ProductCard } from "@/featues/card/components/ProductCard";
import { useHydration } from "@/store/useHydration";

export default function WishlistPage() {
  const t = useTranslations("wishlist");
  const items = useWishlistStore((state) => state.items);
  const hydrated = useHydration();
  const visibleItems = hydrated ? items : [];

  return (
    <div className="page-shell pb-20 pt-10">
      <div className="mb-8">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-.02em] text-stone-950">
          {t("title")}
        </h1>
        <p className="mt-2 text-sm text-stone-500">{t("savedCount", { count: visibleItems.length })}</p>
      </div>

      {visibleItems.length === 0 ? (
        <div className="border border-dashed border-stone-300 bg-white px-6 py-20 text-center">
          <Heart className="mx-auto text-stone-400" size={28} />
          <h3 className="mt-4 text-lg font-semibold">
            {t("emptyTitle")}
          </h3>
          <p className="mt-2 text-sm text-stone-500">
            {t("emptyDescription")}
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand)] hover:underline"
          >
            <ArrowLeft size={15} />
            {t("browse")}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 xl:grid-cols-5">
          {visibleItems.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}