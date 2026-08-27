"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, Heart, ShoppingCart, Truck } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { CartDrawer } from "./CartDrawer";
import { SearchBar } from "./SearchBar";

export const Navbar = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const totalItems = useCartStore((state) => state.getTotalItems());
  const totalWishlisted = useWishlistStore((state) => state.items.length);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cartLabel = mounted
    ? `Open cart with ${totalItems} items`
    : "Open cart";

  return (
    <header className="sticky top-0 z-50 bg-white">
      {/* Announcement bar */}
     <div className="flex h-8 items-center justify-center gap-2 bg-[#0d3d21] px-4 text-xs font-medium text-white">
        <Truck size={14} aria-hidden="true" />
        <span>Free shipping on orders over $50</span>
      </div>

      <div className="border-b border-stone-200">
      <div className="page-shell flex h-16 items-center gap-6">
          <Link
            href="/"
            className="shrink-0 text-xl font-bold tracking-[-.07em] text-stone-900"
            aria-label="Marketly home"
          >
            marketly
            <span className="text-[#14532d]">.</span>
          </Link>

          <nav
            className="hidden shrink-0 items-center gap-6 text-sm font-medium text-stone-700 lg:flex"
            aria-label="Main navigation"
          >
            <Link href="/" className="hover:text-stone-950">
              Shop
            </Link>
            <span className="inline-flex cursor-default items-center gap-1 text-stone-700">
              Categories
              <ChevronDown size={15} aria-hidden="true" />
            </span>
            <Link href="/" className="hover:text-stone-950">
              Deals
            </Link>
            <Link href="/" className="hover:text-stone-950">
              About Us
            </Link>
          </nav>

          <div className="mx-auto hidden max-w-md flex-1 sm:block">
            <SearchBar />
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-5 sm:ml-0">
            <Link
              href="/wishlist"
              className="relative hidden items-center gap-2 text-sm font-medium text-stone-700 hover:text-stone-950 sm:flex"
              aria-label={
                mounted
                  ? `Open wishlist with ${totalWishlisted} items`
                  : "Open wishlist"
              }
            >
              <span className="relative">
                <Heart size={19} aria-hidden="true" />
                {mounted && totalWishlisted > 0 && (
                  <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-[#14532d] px-1 text-[10px] font-semibold text-white">
                    {totalWishlisted}
                  </span>
                )}
              </span>
              <span className="hidden lg:inline">Wishlist</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 text-sm font-medium text-stone-700 hover:text-stone-950"
              aria-label={cartLabel}
              aria-haspopup="dialog"
              aria-expanded={isCartOpen}
            >
              <span className="relative">
                <ShoppingCart size={19} aria-hidden="true" />
                {mounted && totalItems > 0 && (
                  <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-[#14532d] px-1 text-[10px] font-semibold text-white">
                    {totalItems}
                  </span>
                )}
              </span>
              <span className="hidden lg:inline">Cart</span>
            </button>
          </div>
        </div>

        <div className="page-shell pb-3 sm:hidden">
          <SearchBar />
        </div>
      </div>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </header>
  );
};