// app/(shop)/layout.tsx
/**
 * app/(shop)/layout.tsx
 * ---------------------------------------------------------------------------
 * Layout for every customer-facing route (home, product pages, checkout,
 * login/register, wishlist, success). A Next.js *route group* — the "(shop)"
 * folder name does not appear in the URL, it only scopes this layout (and
 * app/(shop)/loading.tsx) to these routes.
 *
 * This is where the storefront's top nav (cart/wishlist/sign-out/search)
 * lives. It intentionally does NOT wrap app/admin/**, which has its own
 * layout (app/admin/dashboard/layout.tsx) with the admin sidebar instead —
 * an admin managing orders has no use for "Cart"/"Wishlist" in their top
 * bar, and showing both navs was confusing (see app/layout.tsx for the split).
 * ---------------------------------------------------------------------------
 */
import { Suspense } from "react";
import { Navbar } from "@/components/Navbar";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={<div className="h-16 border-b border-stone-200 bg-white" />}>
        <Navbar />
      </Suspense>
      {children}
    </>
  );
}