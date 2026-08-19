"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { CartDrawer } from "./CartDrawer";

export const Navbar = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const totalItems = useCartStore((state) => state.getTotalItems());

  useEffect(() => {
    setMounted(true);
  }, []);

  const cartLabel = mounted
    ? `Open cart with ${totalItems} items`
    : "Open cart";

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-[#f7f7f4]/95 backdrop-blur">
      <div className="page-shell flex h-16 items-center justify-between gap-5">
        <Link
          href="/"
          className="text-xl font-bold tracking-[-.07em] text-stone-900"
          aria-label="Marketly home"
        >
          marketly
          <span className="text-[#285943]">.</span>
        </Link>

        <nav
          className="hidden items-center gap-6 text-sm font-medium text-stone-600 sm:flex"
          aria-label="Main navigation"
        >
          <Link href="/" className="hover:text-stone-950">
            Shop
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="relative inline-flex h-10 items-center gap-2 border border-stone-300 bg-white px-3 text-sm font-semibold text-stone-900 transition hover:border-stone-950"
          aria-label={cartLabel}
          aria-haspopup="dialog"
          aria-expanded={isCartOpen}
        >
          <ShoppingBag size={17} aria-hidden="true" />

          <span className="hidden sm:inline">
            Cart
          </span>

          {mounted && totalItems > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#285943] px-1 text-[10px] text-white">
              {totalItems}
            </span>
          )}
        </button>
      </div>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </header>
  );
};