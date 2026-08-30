"use client";

import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

/**
 * AdminShell
 * ---------------------------------------------------------------------
 * Why this exists as its own client component instead of living directly
 * in the (server) dashboard layout:
 *
 * Sidebar collapse and the mobile nav drawer are pure UI state — they have
 * no server dependency and should never force the authenticated layout
 * (which fetches the session user) to become a client component. Isolating
 * that state here keeps `app/admin/dashboard/layout.tsx` a Server Component
 * that does one job: verify auth and pass `userEmail` down.
 *
 * `collapsed` is lifted to this single parent because both the sidebar
 * (which renders differently when collapsed) and the content area (which
 * needs to reclaim the freed-up width) need to agree on the same value.
 */
export default function AdminShell({
  userEmail,
  children,
}: {
  userEmail?: string | null;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f7f7f4] lg:flex">
      <AdminSidebar
        userEmail={userEmail}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((value) => !value)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="min-w-0 flex-1">
        <AdminTopbar
          userEmail={userEmail}
          onOpenMobileNav={() => setMobileOpen(true)}
        />

        <main className="min-w-0 overflow-x-hidden">
          <div className="mx-auto w-full max-w-[1280px] px-6 py-10 lg:px-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}