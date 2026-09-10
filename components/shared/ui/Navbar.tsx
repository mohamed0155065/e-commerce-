"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Heart, ShoppingCart, Truck, User, LogOut } from "lucide-react";
import { useCartStore } from "@/featues/card/store/useCartStore";
import { useWishlistStore } from "@/featues/wishlist/store/useWishlistStore";
import { CartDrawer } from "@/featues/card/components/CartDrawer";
import { SearchBar } from "./SearchBar";
import { supabase } from "@/lib/supabase";

export const Navbar = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserEmail(null);
    router.push("/");
    router.refresh();
  };

  const cartLabel = `Open cart with ${totalItems} items`;

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
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm font-medium text-stone-700 hover:text-stone-950"
                aria-label="Sign out"
              >
                <LogOut size={19} aria-hidden="true" />
                <span className="hidden lg:inline">Sign out</span>
              </button>
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