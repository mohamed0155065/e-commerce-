"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, ShoppingBag, User } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useHydration } from "@/store/useHydration";
import { useEffect } from "react";
const ITEMS = [
  { href: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
  {
    href: "/#products",
    label: "Shop",
    icon: LayoutGrid,
    match: (p: string) => p === "/",
  },
  { href: "/login", label: "Account", icon: User, match: (p: string) => p.startsWith("/login") },
];



export const BottomNav = () => {
  const pathname = usePathname();
  const mounted = useHydration();
  const totalItems = useCartStore((state) => state.getTotalItems());




  useEffect(() => setMounted(true), []);

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-stretch border-t border-stone-200 bg-white/95 backdrop-blur sm:hidden"
    >
      {ITEMS.map(({ href, label, icon: Icon, match }) => {
        const active = match(pathname);
        return (
          <Link
            key={label}
            href={href}
            className={`flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium ${active ? "text-[#285943]" : "text-stone-500"
              }`}
          >
            <Icon size={19} aria-hidden="true" />
            {label}
          </Link>
        );
      })}
      <Link
        href="/checkout"
        className="relative flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium text-stone-500"
      >
        <ShoppingBag size={19} aria-hidden="true" />
        Cart
        {mounted && totalItems > 0 && (
          <span className="absolute right-6 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-[#285943] px-1 text-[9px] font-bold text-white">
            {totalItems > 9 ? "9+" : totalItems}
          </span>
        )}
      </Link>
    </nav>
  );
};