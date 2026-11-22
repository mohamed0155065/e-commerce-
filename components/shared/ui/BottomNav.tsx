"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Home, LayoutGrid, ShoppingBag, User } from "lucide-react";

import { useCartStore } from "@/featues/card/store/useCartStore";
import { useHydratedValue } from "@/store/useHydration";

const ITEMS = [
  {
    href: "/",
    label: "home",
    icon: Home,
    match: (p: string) => p === "/",
  },
  {
    href: "/#products",
    label: "shop",
    icon: LayoutGrid,
    match: (p: string) => p === "/",
  },
  {
    href: "/login",
    label: "account",
    icon: User,
    match: (p: string) => p.startsWith("/login"),
  },
];

export const BottomNav = () => {
  const pathname = usePathname();
  const t = useTranslations("common");
  const nav = useTranslations("nav");

  const totalItems = useCartStore((state) => state.getTotalItems());
  const safeTotalItems = useHydratedValue(totalItems, 0);

  return (
    <nav
      aria-label={nav("primaryNavigation")}
      className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-stretch border-t border-stone-200 bg-white/95 backdrop-blur sm:hidden"
    >
      {ITEMS.map(({ href, label, icon: Icon, match }) => {
        const active = match(pathname);

        return (
          <Link
            key={label}
            href={href}
            className={`flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium ${active ? "text-[var(--brand)]" : "text-stone-500"
              }`}
          >
            <Icon size={19} aria-hidden="true" />
            {t(label)}
          </Link>
        );
      })}

      <Link
        href="/checkout"
        className="relative flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium text-stone-500"
      >
        <ShoppingBag size={19} aria-hidden="true" />

        {nav("cart")}

        {safeTotalItems > 0 && (
          <span className="absolute end-6 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--brand)] px-1 text-[9px] font-bold text-white">
            {safeTotalItems > 9 ? "9+" : safeTotalItems}
          </span>
        )}
      </Link>
    </nav>
  );
};