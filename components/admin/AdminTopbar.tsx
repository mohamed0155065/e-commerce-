"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, Menu } from "lucide-react";

/**
 * Route -> heading map for the top bar title.
 *
 * Deliberately a plain object instead of fetching a title from each page:
 * the title is purely presentational chrome, so it belongs with the other
 * chrome (this component), not duplicated as a prop threaded through every
 * admin route.
 */
const PAGE_TITLES: Record<string, string> = {
    "/admin/dashboard": "Dashboard",
    "/admin/dashboard/orders": "Orders",
    "/admin/dashboard/products": "Products",
};

export default function AdminTopbar({
    userEmail,
    onOpenMobileNav,
}: {
    userEmail?: string | null;
    onOpenMobileNav: () => void;
}) {
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);

    const title =
        PAGE_TITLES[pathname] ??
        (pathname.startsWith("/admin/dashboard/orders")
            ? "Orders"
            : pathname.startsWith("/admin/dashboard/products")
                ? "Products"
                : "Dashboard");

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-stone-200 bg-white px-4 lg:px-8">
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={onOpenMobileNav}
                    aria-label="Open admin navigation"
                    className="rounded-lg p-2 text-stone-600 hover:bg-stone-100 lg:hidden"
                >
                    <Menu size={20} />
                </button>

                <h1 className="text-[15px] font-semibold text-stone-900">{title}</h1>
            </div>

            <div className="flex items-center gap-4">
                <button
                    type="button"
                    aria-label="Notifications"
                    className="relative grid size-9 place-items-center rounded-full text-stone-500 hover:bg-stone-100 hover:text-stone-800"
                >
                    <Bell size={18} />
                    <span
                        className="absolute right-2 top-2 size-2 rounded-full bg-emerald-500 ring-2 ring-white"
                        aria-hidden="true"
                    />
                </button>

                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setMenuOpen((value) => !value)}
                        aria-haspopup="menu"
                        aria-expanded={menuOpen}
                        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-stone-100"
                    >
                        <div className="grid size-8 shrink-0 place-items-center rounded-full bg-[#14532d] text-xs font-semibold text-white">
                            {(userEmail?.[0] ?? "A").toUpperCase()}
                        </div>

                        <span className="hidden max-w-[180px] truncate text-sm font-medium text-stone-700 sm:inline">
                            {userEmail ?? "Admin"}
                        </span>

                        <ChevronDown size={14} className="text-stone-500" />
                    </button>

                    {menuOpen && (
                        <>
                            {/* Click-away layer. A plain fixed overlay is enough here —
                  this menu has a single, low-stakes item (email display),
                  so a full popover/focus-trap library would be overkill. */}
                            <button
                                type="button"
                                aria-hidden="true"
                                tabIndex={-1}
                                className="fixed inset-0 z-40 cursor-default"
                                onClick={() => setMenuOpen(false)}
                            />

                            <div
                                role="menu"
                                className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-stone-200 bg-white p-2 shadow-lg"
                            >
                                <p className="truncate px-2 py-1.5 text-xs text-stone-500">
                                    Signed in as
                                </p>
                                <p
                                    className="truncate px-2 pb-1.5 text-sm font-medium text-stone-900"
                                    title={userEmail ?? undefined}
                                >
                                    {userEmail ?? "Admin"}
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}