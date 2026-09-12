"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Heart, LogOut, Package, ShoppingCart, Truck, User } from "lucide-react";
import { useCartStore } from "@/featues/card/store/useCartStore";
import { useWishlistStore } from "@/featues/wishlist/store/useWishlistStore";
import { CartDrawer } from "@/featues/card/components/CartDrawer";
import { SearchBar } from "./SearchBar";
import { supabase } from "@/lib/supabase";

export const Navbar = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const totalItems = useCartStore((state) => state.getTotalItems());
  const totalWishlisted = useWishlistStore((state) => state.items.length);
  const mounted = true;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Close the account dropdown on outside click / Escape.
  useEffect(() => {
    if (!isAccountOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setIsAccountOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsAccountOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isAccountOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserEmail(null);
    setIsAccountOpen(false);
    router.push("/");
    router.refresh();
  };

  const cartLabel = `Open cart with ${totalItems} items`;
  const initial = userEmail ? userEmail.charAt(0).toUpperCase() : "";

  return (
    <header className="sticky top-0 z-50 bg-white">
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

            {mounted && userEmail ? (
              <div className="relative" ref={accountRef}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setIsAccountOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100"
                  aria-label="Account menu"
                  aria-haspopup="menu"
                  aria-expanded={isAccountOpen}
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#14532d] text-xs font-semibold leading-none text-white">
                    {initial}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`hidden transition-transform duration-200 lg:inline ${isAccountOpen ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  />
                </button>

                {isAccountOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-[calc(100%+10px)] w-56 rounded-xl border border-stone-200 bg-white py-1.5 shadow-[0_12px_32px_rgb(28_29_26/0.12)] before:absolute before:-top-1.5 before:right-4 before:h-3 before:w-3 before:rotate-45 before:border-l before:border-t before:border-stone-200 before:bg-white"
                  >


                    <div className="border-t border-stone-100" />

                    <Link
                      href="/orders"
                      role="menuitem"
                      onClick={() => setIsAccountOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 transition-colors hover:bg-stone-50"
                    >
                      <Package size={16} className="text-stone-400" aria-hidden="true" />
                      My Orders
                    </Link>

                    <div className="border-t border-stone-100" />

                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                    >
                      <LogOut size={16} aria-hidden="true" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 text-sm font-medium text-stone-700 hover:text-stone-950"
                aria-label="Sign in"
              >
                <User size={19} aria-hidden="true" />
                <span className="hidden lg:inline">Sign in</span>
              </Link>
            )}
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