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
import { supabaseServer } from "@/lib/supabaseServer";
import AdminOrdersList from "@/components/admin/AdminOrdersList";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import type { Order } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

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