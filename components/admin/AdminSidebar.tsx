// components/admin/AdminSidebar.tsx
"use client";

/**
 * components/admin/AdminSidebar.tsx
 * ---------------------------------------------------------------------------
 * Left-hand navigation for the admin dashboard, rendered by
 * app/admin/dashboard/layout.tsx around every /admin/dashboard/* route.
 *
 * Real routing: each nav item is a <Link> to its own route (/admin/dashboard,
 * /admin/dashboard/orders, /admin/dashboard/products) and the active item is
 * derived from usePathname() — not scroll position. Navigating updates the
 * URL, works with back/forward, and each route's page.tsx fetches only its
 * own data (see the three page files under app/admin/dashboard/).
 *
 * Also owns:
 *   - Mobile collapse into an off-canvas drawer (hamburger + backdrop),
 *     since a permanent 256px rail doesn't fit small screens.
 *   - Sign-out (Supabase auth.signOut + redirect to /admin/login), replacing
 *     the orphaned app/admin/LogOutButton.tsx which nothing else renders.
 * ---------------------------------------------------------------------------
 */

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
  { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/dashboard/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/dashboard/products", label: "Products", icon: Boxes },
] as const;

export default function AdminSidebar({ userEmail }: { userEmail?: string | null }) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const navList = (
    <nav className="flex-1 space-y-1 px-3">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        // Overview's route ("/admin/dashboard") is a prefix of the other two
        // routes, so it needs an exact match; the nested routes can match by
        // prefix (harmless here since there are no further sub-routes yet).
        const isActive = href === "/admin/dashboard" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setIsMobileOpen(false)}
            aria-current={isActive ? "page" : undefined}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-[#285943] text-white"
                : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
            }`}
          >
            <Icon size={17} />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile top bar: hamburger toggle only, shown below lg breakpoint */}
      <div className="flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3 lg:hidden">
        <p className="text-sm font-semibold tracking-tight">Marketly Admin</p>
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          aria-label="Open navigation"
          className="rounded-md p-2 text-stone-600 hover:bg-stone-100"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile off-canvas drawer + backdrop */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-white py-4 shadow-xl">
            <div className="flex items-center justify-between px-4 pb-4">
              <p className="text-sm font-semibold tracking-tight">Marketly Admin</p>
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                aria-label="Close navigation"
                className="rounded-md p-2 text-stone-600 hover:bg-stone-100"
              >
                <X size={18} />
              </button>
            </div>
            {navList}
            <SidebarFooter userEmail={userEmail} isLoggingOut={isLoggingOut} onLogout={handleLogout} />
          </aside>
        </div>
      )}

      {/* Desktop persistent sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-stone-200 bg-white py-6 lg:flex">
        <div className="px-4 pb-6">
          <p className="text-sm font-semibold tracking-tight">Marketly Admin</p>
          <p className="mt-1 text-xs text-stone-500">Store management</p>
        </div>
        {navList}
        <SidebarFooter userEmail={userEmail} isLoggingOut={isLoggingOut} onLogout={handleLogout} />
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
    <div className="mt-auto space-y-3 border-t border-stone-200 px-4 pt-4">
      {userEmail && <p className="truncate text-xs text-stone-500" title={userEmail}>{userEmail}</p>}
      <button
        type="button"
        onClick={onLogout}
        disabled={isLoggingOut}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        <LogOut size={16} />
        {isLoggingOut ? "Signing out…" : "Log out"}
      </button>
    </div>
  );
}