// app/admin/dashboard/page.tsx
/**
 * app/admin/dashboard/page.tsx  ->  route: /admin/dashboard  (Overview tab)
 * ---------------------------------------------------------------------------
 * Server Component. Fetches only what the overview needs: KPI numbers
 * (total sales, orders received, awaiting action) and the last 6 orders for
 * the sales chart — it no longer also loads/renders the full orders table or
 * the product catalog, those now live at their own routes:
 *   /admin/dashboard/orders    -> app/admin/dashboard/orders/page.tsx
 *   /admin/dashboard/products  -> app/admin/dashboard/products/page.tsx
 *
 * Wrapped by app/admin/dashboard/layout.tsx, which handles the auth guard
 * and renders the sidebar — this file only owns the Overview content.
 * ---------------------------------------------------------------------------
 */
import { supabaseServer } from "@/lib/supabaseServer";
import SalesChart from "./Chart";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: orders } = await supabase
    .from("orders")
    .select("id, full_name, totalPrice, status, created_at")
    .order("created_at", { ascending: false });

  const totalRevenue = orders?.reduce((sum, order) => sum + (order.totalPrice || 0), 0) || 0;
  const totalOrders = orders?.length || 0;
  const pendingOrders = orders?.filter((o) => o.status === "pending").length || 0;
  const chartData =
    orders
      ?.slice(0, 6)
      .reverse()
      .map((order) => ({
        name: order.full_name?.split(" ")[0] || "Customer",
        amount: order.totalPrice,
      })) || [];

  return (
    <>
      <AdminPageHeader
        title="Store overview"
        description="A concise view of current store activity."
        userEmail={user?.email}
      />

      <div className="mt-8 grid gap-px border border-stone-200 bg-stone-200 sm:grid-cols-3">
        <div className="bg-white p-6">
          <p className="eyebrow">Total sales</p>
          <p className="mt-3 text-3xl font-semibold tracking-[-.05em]">
            ${totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6">
          <p className="eyebrow">Orders received</p>
          <p className="mt-3 text-3xl font-semibold tracking-[-.05em]">{totalOrders}</p>
        </div>
        <div className="bg-white p-6">
          <p className="eyebrow">Awaiting action</p>
          <p className="mt-3 text-3xl font-semibold tracking-[-.05em]">{pendingOrders}</p>
        </div>
      </div>

      <div className="mt-10">{chartData.length > 0 && <SalesChart data={chartData} />}</div>
    </>
  );
}