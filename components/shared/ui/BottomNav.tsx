"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import {
  Camera,
  Gamepad2,
  Heart,
  Home,
  Laptop,
  LayoutGrid,
  PackageSearch,
  ShoppingBag,
  Smartphone,
  Speaker,
  Tablet,
  User,
  Watch,
  X,
} from "lucide-react";

import { useCartStore } from "@/featues/card/store/useCartStore";
import { useWishlistStore } from "@/featues/wishlist/store/useWishlistStore";
import { useHydratedValue } from "@/store/useHydration";
import { useAuthStore } from "@/store/useAuthStore";

const CATEGORIES = [
  { slug: "all", label: "all", icon: PackageSearch },
  { slug: "laptop", label: "laptop", icon: Laptop },
  { slug: "phones", label: "phones", icon: Smartphone },
  { slug: "smart_watches", label: "smart_watches", icon: Watch },
  { slug: "headphones", label: "headphones", icon: Speaker },
  { slug: "earbuds", label: "earbuds", icon: Speaker },
  { slug: "tablets", label: "tablets", icon: Tablet },
  { slug: "gaming", label: "gaming", icon: Gamepad2 },
  { slug: "cameras", label: "cameras", icon: Camera },
];

export const BottomNav = () => {
  const pathname = usePathname();
  const t = useTranslations("common");
  const nav = useTranslations("nav");
  const home = useTranslations("home");
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const userEmail = useAuthStore((state) => state.userEmail);

  const totalItems = useCartStore((state) => state.getTotalItems());
  const safeTotalItems = useHydratedValue(totalItems, 0);
  const wishlistedItems = useWishlistStore((state) => state.items.length);
  const safeWishlistedItems = useHydratedValue(wishlistedItems, 0);

  return (
    <>
      {categoriesOpen && (
        <button
          type="button"
          aria-label={t("close")}
          onClick={() => setCategoriesOpen(false)}
          className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] sm:hidden"
        />
      )}

      {categoriesOpen && (
        <section
          role="dialog"
          aria-modal="true"
          aria-label={t("category")}
          className="fixed inset-x-3 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-50 rounded-[24px] border border-stone-200 bg-[var(--surface)] p-4 shadow-[0_-12px_40px_rgba(0,0,0,.28)] sm:hidden"
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-950">{t("category")}</h2>
            <button
              type="button"
              onClick={() => setCategoriesOpen(false)}
              className="grid h-9 w-9 place-items-center rounded-full bg-stone-100 text-stone-700"
              aria-label={t("close")}
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map(({ slug, label, icon: Icon }) => (
              <Link
                key={slug}
                href={slug === "all" ? "/" : `/?category=${slug}`}
                onClick={() => setCategoriesOpen(false)}
                prefetch={false}
                scroll={false}
                className="flex min-w-0 items-center gap-2.5 rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm font-semibold text-stone-800"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--brand)]/10 text-[var(--brand)]">
                  <Icon size={16} />
                </span>
                <span className="truncate">{home(`categories.${label}`)}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <nav
        aria-label={nav("primaryNavigation")}
        className="fixed inset-x-0 bottom-0 z-40 grid h-16 grid-cols-5 items-stretch border-t border-stone-200 bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden"
      >
        <Link
          href="/"
          prefetch={false}
          scroll={false}
          className={`flex flex-col items-center justify-center gap-1 text-[10px] font-medium ${pathname === "/" ? "text-[var(--brand)]" : "text-stone-500"}`}
        >
          <Home size={19} aria-hidden="true" />
          {t("home")}
        </Link>

        <button
          type="button"
          onClick={() => setCategoriesOpen((open) => !open)}
          className={`flex flex-col items-center justify-center gap-1 text-[10px] font-medium ${categoriesOpen ? "text-[var(--brand)]" : "text-stone-500"}`}
          aria-expanded={categoriesOpen}
        >
          <LayoutGrid size={19} aria-hidden="true" />
          {t("category")}
        </button>

        <Link
          href="/wishlist"
          prefetch={false}
          scroll={false}
          className={`relative flex flex-col items-center justify-center gap-1 text-[10px] font-medium ${pathname === "/wishlist" ? "text-[var(--brand)]" : "text-stone-500"}`}
        >
          <span className="relative">
            <Heart size={19} aria-hidden="true" />
            {safeWishlistedItems > 0 && (
              <span className="absolute -end-3 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--brand)] px-1 text-[8px] font-bold text-white">
                {safeWishlistedItems > 9 ? "9+" : safeWishlistedItems}
              </span>
            )}
          </span>
          {nav("wishlist")}
        </Link>

        <Link
          href="/checkout"
          prefetch={false}
          scroll={false}
          className="relative flex flex-col items-center justify-center gap-1 text-[10px] font-medium text-stone-500"
        >
          <span className="relative">
            <ShoppingBag size={19} aria-hidden="true" />
            {safeTotalItems > 0 && (
              <span className="absolute -end-3 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--brand)] px-1 text-[8px] font-bold text-white">
                {safeTotalItems > 9 ? "9+" : safeTotalItems}
              </span>
            )}
          </span>
          {nav("cart")}
        </Link>

        <Link
          href={userEmail ? "/orders" : "/login"}
          prefetch={false}
          scroll={false}
          className={`flex flex-col items-center justify-center gap-1 text-[10px] font-medium ${pathname === "/login" ? "text-[var(--brand)]" : "text-stone-500"}`}
        >
          <User size={19} aria-hidden="true" />
          {t("account")}
        </Link>
      </nav>
    </>
  );
};