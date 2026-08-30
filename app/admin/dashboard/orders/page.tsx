// app/admin/dashboard/orders/page.tsx
/**
 * app/admin/dashboard/orders/page.tsx  ->  route: /admin/dashboard/orders
 * ---------------------------------------------------------------------------
 * Server Component. Fetches the full order list (all columns, since
 * AdminOrdersList needs contact info, address, and items — unlike the
 * overview's slimmed-down select) and hands it to the client component that
 * owns status changes + the realtime feed.
 *
 * Wrapped by app/admin/dashboard/layout.tsx (auth guard + sidebar).
 * ---------------------------------------------------------------------------
 */
import { supabaseServer, getSessionUser } from "@/lib/supabaseServer";
import AdminOrdersList from "@/components/admin/AdminOrdersList";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import type { Order } from "@/types";

export const dynamic = "force-dynamic";

// Safety cap on the initial fetch — the realtime subscription in
// AdminOrdersList prepends anything newer live, so this only bounds how
// much history loads on first paint as order volume grows. Raise it (or
// swap for real pagination) if the admin needs to browse further back.
const INITIAL_ORDERS_LIMIT = 200;

export default async function AdminOrdersPage() {
  // getSessionUser() is request-cached (see lib/supabaseServer.ts) — reuses
  // the layout's already-verified user instead of a second Auth round trip.
  const user = await getSessionUser();
  const supabase = await supabaseServer();

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(INITIAL_ORDERS_LIMIT);

  return (
    <>
      <AdminPageHeader
        title="Orders"
        description="Track incoming orders and update their fulfillment status."
        userEmail={user?.email}
      />

      <div className="mt-8">
        <AdminOrdersList initialOrders={(orders ?? []) as Order[]} />
      </div>
    </>
  );
}