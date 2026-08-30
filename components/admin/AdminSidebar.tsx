"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  LayoutDashboard,
  ClipboardList,
  Boxes,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

const NAV_ITEMS = [
  {
    href: "/admin/dashboard",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/dashboard/orders",
    label: "Orders",
    icon: ClipboardList,
  },
  {
    href: "/admin/dashboard/products",
    label: "Products",
    icon: Boxes,
  },
] as const;

export default function AdminSidebar({
  userEmail,
}: {
  userEmail?: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    /**
     * Prevent double-clicking the logout action.
     *
     * This is both UX and request hygiene:
     * multiple rapid clicks should never create multiple auth requests.
     */
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Admin logout failed:", error);
      setIsLoggingOut(false);
      return;
    }

    /**
     * replace() is preferable to push() for logout.
     *
     * The authenticated page should not remain in the browser history as the
     * primary back-navigation target after signing out.
     */
    router.replace("/admin/login");
    router.refresh();
  };

  const navigation = (
    <nav
      className="space-y-1 px-3"
      aria-label="Admin navigation"
    >
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        /**
         * Exact matching is required for Overview.
         *
         * Otherwise "/admin/dashboard/orders" would also make Overview appear
         * active because "/admin/dashboard" is its prefix.
         */
        const isActive =
          href === "/admin/dashboard"
            ? pathname === href
            : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            aria-current={isActive ? "page" : undefined}
            className={[
              "flex items-center gap-3 rounded-lg px-3 py-2.5",
              "text-sm font-medium",
              "transition-colors duration-150",
              isActive
                ? "bg-[#285943] text-white"
                : "text-stone-700 hover:bg-stone-100 hover:text-stone-950",
            ].join(" ")}
          >
            <Icon
              size={18}
              strokeWidth={1.8}
              aria-hidden="true"
            />

            {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* ------------------------------------------------------------------
          Mobile header

          The desktop sidebar is intentionally hidden on small screens.
          Keeping the navigation out of the initial mobile layout avoids
          wasting horizontal viewport space.
      ------------------------------------------------------------------- */}
      <div className="flex items-center justify-between border-b border-stone-200 bg-white px-5 py-4 lg:hidden">
        <div>
          <p className="text-sm font-semibold tracking-tight">
            Marketly Admin
          </p>

          <p className="mt-0.5 text-xs text-stone-500">
            Store management
          </p>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open admin navigation"
          className="rounded-lg p-2 text-stone-700 hover:bg-stone-100"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* ------------------------------------------------------------------
          Mobile drawer
      ------------------------------------------------------------------- */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Admin navigation"
        >
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-black/30"
            onClick={() => setMobileOpen(false)}
          />

          <aside className="absolute inset-y-0 left-0 flex w-[280px] flex-col border-r border-stone-200 bg-white py-6 shadow-xl">
            <div className="flex items-start justify-between px-4 pb-7">
              <div>
                <p className="text-base font-bold tracking-tight">
                  Marketly Admin
                </p>

                <p className="mt-1 text-xs text-stone-500">
                  Store management
                </p>
              </div>

              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation"
                className="rounded-lg p-2 text-stone-600 hover:bg-stone-100"
              >
                <X size={18} />
              </button>
            </div>

            {navigation}

            <SidebarFooter
              userEmail={userEmail}
              isLoggingOut={isLoggingOut}
              onLogout={handleLogout}
            />
          </aside>
        </div>
      )}

      {/* ------------------------------------------------------------------
          Desktop sidebar

          Width and visual hierarchy intentionally match the original UI:
          white surface + subtle divider + green active navigation item.
      ------------------------------------------------------------------- */}
      <aside className="sticky top-0 hidden h-screen w-[280px] shrink-0 flex-col border-r border-stone-200 bg-white lg:flex">
        <div className="px-4 pb-6 pt-7">
          <p className="text-base font-bold tracking-tight">
            Marketly Admin
          </p>

          <p className="mt-1 text-xs text-stone-500">
            Store management
          </p>
        </div>

        {navigation}

        <SidebarFooter
          userEmail={userEmail}
          isLoggingOut={isLoggingOut}
          onLogout={handleLogout}
        />
      </aside>
    </>
  );
}

function SidebarFooter({
  userEmail,
  isLoggingOut,
  onLogout,
}: {
  userEmail?: string | null;
  isLoggingOut: boolean;
  onLogout: () => void;
}) {
  return (
    <div className="mt-auto border-t border-stone-200 px-4 pb-5 pt-5">
      {userEmail && (
        <p
          className="truncate text-xs text-stone-500"
          title={userEmail}
        >
          {userEmail}
        </p>
      )}

      <button
        type="button"
        onClick={onLogout}
        disabled={isLoggingOut}
        className="mt-4 flex items-center gap-2 px-1 text-sm font-medium text-red-600 transition-colors hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <LogOut
          size={16}
          aria-hidden="true"
        />

        {isLoggingOut ? "Signing out…" : "Log out"}
      </button>
    </div>
  );
}