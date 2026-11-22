"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, Heart, LogOut, Package, ShoppingCart, Truck, User } from "lucide-react";
import { useCartStore } from "@/featues/card/store/useCartStore";
import { useWishlistStore } from "@/featues/wishlist/store/useWishlistStore";
import { CartDrawer } from "@/featues/card/components/CartDrawer";
import { SearchBar } from "./SearchBar";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { supabase } from "@/lib/supabase";
import { useHydratedValue, useHydration } from "@/store/useHydration";
import { Link, useRouter } from "@/i18n/navigation";

export const Navbar = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const t = useTranslations("nav");
  const common = useTranslations("common");

  const totalItems = useCartStore((state) => state.getTotalItems());
  const totalWishlisted = useWishlistStore((state) => state.items.length);
  const mounted = useHydration();
  const safeTotalItems = useHydratedValue(totalItems, 0);
  const safeTotalWishlisted = useHydratedValue(totalWishlisted, 0);

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

  const cartLabel = mounted
    ? t("openCart", { count: safeTotalItems })
    : t("cart");
  const initial = userEmail ? userEmail.charAt(0).toUpperCase() : "";

  return (
    <header className="sticky top-0 z-50 bg-white">
      <div className="flex h-8 items-center justify-center gap-2 bg-[var(--brand)] px-4 text-xs font-medium text-white">
        <Truck size={14} aria-hidden="true" />
        <span>{t("shippingBanner")}</span>
      </div>

      <div className="border-b border-stone-200">
        <div className="page-shell flex h-16 items-center gap-6">
          <Link
            href="/"
            className="shrink-0 text-xl font-bold tracking-[-.07em] text-stone-900"
            aria-label={`Marketly ${common("home")}`}
          >
            marketly
            <span className="text-[var(--brand)]">.</span>
          </Link>


          <div className="mx-auto hidden max-w-md flex-1 sm:block">
            <SearchBar />
          </div>

          <div className="ms-auto flex shrink-0 items-center gap-5 sm:ms-0">
            <LocaleSwitcher />
            <Link
              href="/wishlist"
              className="relative hidden items-center gap-2 text-sm font-medium text-stone-700 hover:text-stone-950 sm:flex"
              aria-label={mounted ? t("openWishlist", { count: safeTotalWishlisted }) : t("wishlist")}
            >
              <span className="relative">
                <Heart size={19} aria-hidden="true" />
                {mounted && safeTotalWishlisted > 0 && (
                  <span className="absolute -end-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--brand)] px-1 text-[10px] font-semibold text-white">
                    {safeTotalWishlisted}
                  </span>
                )}
              </span>
              <span className="hidden lg:inline">{t("wishlist")}</span>
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
                {mounted && safeTotalItems > 0 && (
                  <span className="absolute -end-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--brand)] px-1 text-[10px] font-semibold text-white">
                    {safeTotalItems}
                  </span>
                )}
              </span>
              <span className="hidden lg:inline">{t("cart")}</span>
            </button>

            {mounted && userEmail ? (
              <div className="relative" ref={accountRef}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setIsAccountOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-full py-1 ps-1 pe-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100"
                  aria-label={t("accountMenu")}
                  aria-haspopup="menu"
                  aria-expanded={isAccountOpen}
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--brand)] text-xs font-semibold leading-none text-white">
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
                    className="absolute end-0 top-[calc(100%+10px)] w-56 rounded-xl border border-stone-200 bg-white py-1.5 shadow-[0_12px_32px_rgb(28_29_26/0.12)] before:absolute before:-top-1.5 before:end-4 before:h-3 before:w-3 before:rotate-45 before:border-s before:border-t before:border-stone-200 before:bg-white"
                  >


                    <div className="border-t border-stone-100" />

                    <Link
                      href="/orders"
                      role="menuitem"
                      onClick={() => setIsAccountOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 transition-colors hover:bg-stone-50"
                    >
                      <Package size={16} className="text-stone-400" aria-hidden="true" />
                      {t("myOrders")}
                    </Link>

                    <div className="border-t border-stone-100" />

                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-start text-sm text-red-600 transition-colors hover:bg-red-50"
                    >
                      <LogOut size={16} aria-hidden="true" />
                      {t("signOut")}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 text-sm font-medium text-stone-700 hover:text-stone-950"
                aria-label={t("signIn")}
              >
                <User size={19} aria-hidden="true" />
                <span className="hidden lg:inline">{t("signIn")}</span>
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