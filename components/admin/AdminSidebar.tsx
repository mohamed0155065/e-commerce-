"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  LayoutDashboard,
  ClipboardList,
  Boxes,
  LogOut,
  X,
  ChevronLeft,
  ShoppingBag,
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
  collapsed,
  onToggleCollapsed,
  mobileOpen,
  onCloseMobile,
}: {
  userEmail?: string | null;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

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

  const navigation = (showLabels: boolean) => (
    <nav className="space-y-1 px-3" aria-label="Admin navigation">
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
            onClick={onCloseMobile}
            aria-current={isActive ? "page" : undefined}
            title={showLabels ? undefined : label}
            className={[
              "flex items-center gap-3 rounded-xl px-3 py-2.5",
              "text-sm font-medium",
              "transition-colors duration-150",
              !showLabels && "justify-center",
              isActive
                ? "bg-white/10 text-white"
                : "text-emerald-100/70 hover:bg-white/5 hover:text-white",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
            {showLabels && label}
          </Link>
        );
      })}
    </nav>
  );

  const logoBlock = (showLabels: boolean) => (
    <div
      className={`flex items-center gap-3 px-4 pb-6 pt-7 ${
        !showLabels ? "justify-center px-0" : ""
      }`}
    >
      <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-[#14532d]">
        <ShoppingBag size={18} strokeWidth={2} aria-hidden="true" />
      </div>

      {showLabels && (
        <div className="min-w-0">
          <p className="truncate text-sm font-bold tracking-tight text-white">
            Marketly Admin
          </p>
          <p className="truncate text-xs text-emerald-100/60">
            Store management
          </p>
        </div>
      )}
    </div>
  );

  const footer = (showLabels: boolean) => (
    <div className="mt-auto border-t border-white/10 px-4 pb-5 pt-4">
      <div className={`flex items-center gap-3 ${!showLabels ? "justify-center" : ""}`}>
        <div
          className="grid size-9 shrink-0 place-items-center rounded-full bg-emerald-700 text-sm font-semibold text-white"
          aria-hidden="true"
        >
          {(userEmail?.[0] ?? "A").toUpperCase()}
        </div>

        {showLabels && (
          <div className="min-w-0">
            <p
              className="truncate text-xs font-medium text-white"
              title={userEmail ?? undefined}
            >
              {userEmail ?? "Admin"}
            </p>
            <p className="text-[11px] text-emerald-100/60">Store Owner</p>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        title={showLabels ? undefined : "Log out"}
        className={`mt-4 flex items-center gap-2 text-sm font-medium text-red-300 transition-colors hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-50 ${
          !showLabels ? "justify-center" : ""
        }`}
      >
        <LogOut size={16} aria-hidden="true" />
        {showLabels && (isLoggingOut ? "Signing out…" : "Log out")}
      </button>
    </div>
  );

  return (
    <>
      {/* ------------------------------------------------------------------
          Mobile drawer
          The desktop sidebar is intentionally hidden on small screens; the
          hamburger trigger now lives in AdminTopbar so it works on every
          admin page, not just Overview.
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
            onClick={onCloseMobile}
          />

          <aside className="absolute inset-y-0 left-0 flex w-[280px] flex-col bg-gradient-to-b from-[#0d3d21#0d3d21] to-[#123a28] py-2 shadow-xl">
            <div className="flex items-center justify-between">
              {logoBlock(true)}

              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Close navigation"
                className="mr-2 rounded-lg p-2 text-emerald-100/70 hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {navigation(true)}
            {footer(true)}
          </aside>
        </div>
      )}

      {/* ------------------------------------------------------------------
          Desktop sidebar

          Dark green surface + logo mark + collapsible width, matching the
          reference design. Width transitions are CSS-only (no layout
          thrashing from JS-driven resize) so collapsing feels instant.
      ------------------------------------------------------------------- */}
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 flex-col bg-gradient-to-b from-[#0d3d21] to-[#123a28] transition-[width] duration-200 lg:flex ${
          collapsed ? "w-[84px]" : "w-[280px]"
        }`}
      >
        <div className="flex items-center justify-between">
          {logoBlock(!collapsed)}

          {!collapsed && (
            <button
              type="button"
              onClick={onToggleCollapsed}
              aria-label="Collapse sidebar"
              className="mr-3 grid size-7 shrink-0 place-items-center rounded-lg bg-white/10 text-emerald-100/80 hover:bg-white/20 hover:text-white"
            >
              <ChevronLeft size={15} />
            </button>
          )}
        </div>

        {collapsed && (
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-label="Expand sidebar"
            className="mx-auto mb-4 grid size-7 place-items-center rounded-lg bg-white/10 text-emerald-100/80 hover:bg-white/20 hover:text-white"
          >
            <ChevronLeft size={15} className="rotate-180" />
          </button>
        )}

        {navigation(!collapsed)}
        {footer(!collapsed)}
      </aside>
    </>
  );
}