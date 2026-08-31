import Link from "next/link";

import {
  ArrowUpRight,
  ClipboardList,
  Clock3,
  DollarSign,
  Package,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  Trophy,
  AlertTriangle,
} from "lucide-react";

import { getSessionUser, supabaseServer } from "@/lib/supabaseServer";
import SalesChart from "./Chart";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export const dynamic = "force-dynamic";

/**
 * Small dashboard read model.
 *
 * We intentionally fetch only the data required by the dashboard, and all
 * of it comes back from a SINGLE `get_admin_dashboard` RPC call. Adding the
 * insight fields below (growth %, best sellers, status breakdown, low
 * stock) does NOT add extra round-trips — they're computed inside that one
 * Postgres function. See supabase_migrations.sql for the query plan notes.
 */
type DashboardData = {
  total_sales: number;
  orders_received: number;
  awaiting_action: number;

  // Nullable: null means "no prior-period data to compare against" (e.g. a
  // brand-new store), which the UI must render distinctly from "0% change".
  sales_growth_pct: number | null;
  orders_growth_pct: number | null;

  avg_order_value: number;

  sales_performance: {
    name: string;
    amount: number;
  }[];

  recent_orders: {
    id: number;
    totalPrice: number;
    status: string;
    created_at: string;
    full_name: string;
  }[];

  top_products: {
    name: string;
    quantity_sold: number;
    revenue: number;
  }[];

  status_breakdown: {
    status: string;
    count: number;
  }[];

  low_stock_products: {
    name: string;
    stock: number;
  }[];
};

const EMPTY_DASHBOARD: DashboardData = {
  total_sales: 0,
  orders_received: 0,
  awaiting_action: 0,
  sales_growth_pct: null,
  orders_growth_pct: null,
  avg_order_value: 0,
  sales_performance: [],
  recent_orders: [],
  top_products: [],
  status_breakdown: [],
  low_stock_products: [],
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  processing: "bg-blue-50 text-blue-700 ring-blue-200",
  shipped: "bg-violet-50 text-violet-700 ring-violet-200",
  delivered: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  cancelled: "bg-red-50 text-red-700 ring-red-200",
};

// Dot colors reused by the status-breakdown bars below — kept as a separate
// map (rather than deriving from STATUS_STYLES) because the badge classes
// above are Tailwind text/bg pairs, while the bars need a flat fill color.
const STATUS_DOT: Record<string, string> = {
  pending: "bg-amber-400",
  processing: "bg-blue-400",
  shipped: "bg-violet-400",
  delivered: "bg-emerald-400",
  cancelled: "bg-red-400",
};

/**
 * Format currency on the server.
 *
 * This page is a Server Component, so formatting values here prevents
 * unnecessary client-side JavaScript.
 */
function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format order dates on the server.
 */
function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

/**
 * Format a growth percentage for display. Returns null (rendered as
 * nothing) when there's no prior-period baseline to compare against,
 * instead of misleadingly showing "0%".
 */
function formatGrowth(value: number | null): string | null {
  if (value === null) return null;
  const sign = value > 0 ? "+" : "";
  return `${sign}${value}%`;
}

export default async function AdminOverviewPage() {
  const user = await getSessionUser();
  const supabase = await supabaseServer();

  /**
   * One database round-trip for the complete dashboard projection.
   *
   * Aggregation stays in PostgreSQL instead of loading all orders
   * into the application server and processing them in JavaScript.
   * This now also includes growth %, best sellers, status breakdown,
   * and low-stock alerts — all computed server-side in the same call.
   */
  const { data, error } = await supabase.rpc("get_admin_dashboard");

  if (error) {
    console.error("ADMIN DASHBOARD ERROR:", error);

    /**
     * Do not render fake financial/order data.
     * Let the Next.js error boundary handle the failure.
     */
    throw new Error("Unable to load dashboard data.");
  }

  const dashboard = (data ?? EMPTY_DASHBOARD) as DashboardData;

  return (
    <div className="space-y-8 pb-10">
      <AdminPageHeader
        title="Overview"
        description="Here's what's happening with your store today. Monitor revenue, orders, and the work that needs attention."
      />
      {/* ------------------------------------------------------------------ */}
      {/* KPI cards                                                          */}
      {/* ------------------------------------------------------------------ */}

      <section
        aria-label="Store metrics"
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      >
        <MetricCard
          label="Total sales"
          value={formatCurrency(Number(dashboard.total_sales) || 0)}
          icon={DollarSign}
          tone="green"
          detail="Across all orders"
          trend={dashboard.sales_growth_pct}
          trendLabel="vs last 7 days"
        />

        <MetricCard
          label="Orders received"
          value={dashboard.orders_received.toLocaleString()}
          icon={ShoppingBag}
          tone="blue"
          detail="All-time order volume"
          trend={dashboard.orders_growth_pct}
          trendLabel="vs last 7 days"
        />

        <MetricCard
          label="Avg. order value"
          value={formatCurrency(Number(dashboard.avg_order_value) || 0)}
          icon={Trophy}
          tone="green"
          detail="Revenue \u00f7 total orders"
        />

        <MetricCard
          label="Awaiting action"
          value={dashboard.awaiting_action.toLocaleString()}
          icon={Clock3}
          tone="amber"
          detail="Pending orders"
          emphasis={dashboard.awaiting_action > 0}
        />
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Analytics + recent orders                                          */}
      {/* ------------------------------------------------------------------ */}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,.8fr)]">
        <SalesChart data={dashboard.sales_performance} />

        <RecentOrders orders={dashboard.recent_orders} />
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* NEW: business insights — best sellers, order pipeline, stock       */}
      {/* ------------------------------------------------------------------ */}

      <section className="grid gap-6 xl:grid-cols-3">
        <TopProducts products={dashboard.top_products} />

        <StatusBreakdown
          breakdown={dashboard.status_breakdown}
          totalOrders={dashboard.orders_received}
        />

        <LowStockAlert products={dashboard.low_stock_products} />
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Quick actions                                                       */}
      {/* ------------------------------------------------------------------ */}

      <QuickActions />
    </div>
  );
}

/* ==========================================================================
   Metric Card
   ========================================================================== */

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
  emphasis = false,
  trend = undefined,
  trendLabel,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof DollarSign;
  tone: "green" | "blue" | "amber";
  emphasis?: boolean;
  /** Growth percentage, null = no baseline, undefined = not applicable to this card */
  trend?: number | null;
  trendLabel?: string;
}) {
  let toneClass = "bg-stone-50 text-stone-700";

  if (tone === "green") {
    toneClass = "bg-emerald-50 text-emerald-700";
  }

  if (tone === "blue") {
    toneClass = "bg-blue-50 text-blue-700";
  }

  if (tone === "amber") {
    toneClass = "bg-amber-50 text-amber-700";
  }

  const detailClass = emphasis
    ? "mt-1 text-xs font-semibold text-amber-700"
    : "mt-1 text-xs text-stone-500";

  const growthText = trend === undefined ? null : formatGrowth(trend);
  const isPositive = typeof trend === "number" && trend >= 0;

  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-[0_8px_30px_rgb(28_29_26/0.04)] transition-shadow duration-200 hover:shadow-[0_12px_36px_rgb(28_29_26/0.07)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-stone-500">{label}</p>

          <p className="mt-2 truncate text-[2rem] font-semibold tracking-[-.045em] text-stone-950">
            {value}
          </p>

          <div className="mt-1 flex items-center gap-2">
            <p className={detailClass}>{detail}</p>

            {/* Growth badge: only rendered when we actually have a baseline
                to compare against, so a new store doesn't see a misleading
                "+0%" or "-100%" on day one. */}
            {growthText && (
              <span
                className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                  isPositive
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
                }`}
                title={trendLabel}
              >
                {isPositive ? (
                  <TrendingUp size={11} strokeWidth={2.5} />
                ) : (
                  <TrendingDown size={11} strokeWidth={2.5} />
                )}
                {growthText}
              </span>
            )}
          </div>
        </div>

        <div
          className={`grid size-11 shrink-0 place-items-center rounded-xl ${toneClass}`}
          aria-hidden="true"
        >
          <Icon size={20} strokeWidth={2} />
        </div>
      </div>
    </article>
  );
}

/* ==========================================================================
   Recent Orders
   ========================================================================== */

function RecentOrders({
  orders,
}: {
  orders: DashboardData["recent_orders"];
}) {
  return (
    <section className="min-w-0 rounded-2xl border border-stone-200 bg-white p-5 shadow-[0_8px_30px_rgb(28_29_26/0.04)]">
      {/* Header */}
      <div>
        <p className="eyebrow">Activity</p>

        <h2 className="mt-1 text-lg font-semibold tracking-tight">
          Recent orders
        </h2>

        <p className="mt-1 text-sm text-stone-500">
          Your latest customer activity.
        </p>
      </div>

      {/* Orders list */}
      <div className="mt-5 divide-y divide-stone-100">
        {orders.length > 0 ? (
          orders.map((order) => (
            <article
              key={order.id}
              className="flex items-center justify-between gap-3 py-4 first:pt-0 last:pb-0"
            >
              {/* Order information */}
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className="grid size-9 shrink-0 place-items-center rounded-lg bg-stone-50 text-stone-500"
                  aria-hidden="true"
                >
                  <ClipboardList size={16} />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-stone-900">
                    #{String(order.id).padStart(3, "0")}
                  </p>

                  <p className="truncate text-xs text-stone-500">
                    {order.full_name || "Customer"} ·{" "}
                    {formatDate(order.created_at)}
                  </p>
                </div>
              </div>

              {/* Price + status */}
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold text-stone-900">
                  {formatCurrency(Number(order.totalPrice) || 0)}
                </p>

                <span
                  className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ring-1 ring-inset ${
                    STATUS_STYLES[order.status] ||
                    "bg-stone-50 text-stone-600 ring-stone-200"
                  }`}
                >
                  {order.status}
                </span>
              </div>
            </article>
          ))
        ) : (
          /* Empty state */
          <div className="py-10 text-center">
            <Package
              className="mx-auto text-stone-300"
              size={28}
              aria-hidden="true"
            />

            <p className="mt-3 text-sm font-medium text-stone-700">
              No orders yet
            </p>

            <p className="mt-1 text-xs text-stone-500">
              New orders will appear here automatically.
            </p>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Primary navigation button                                          */}
      {/* ------------------------------------------------------------------ */}

      <div className="mt-6 border-t border-stone-100 pt-5">
        <Link
          href="/admin/dashboard/orders"
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#285943] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-[#214a38] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#285943] focus-visible:ring-offset-2"
        >
          <span>View all orders</span>

          <ArrowUpRight size={16} strokeWidth={2} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

/* ==========================================================================
   NEW: Top Products (best sellers, last 30 days)
   ========================================================================== */

function TopProducts({
  products,
}: {
  products: DashboardData["top_products"];
}) {
  return (
    <section className="min-w-0 rounded-2xl border border-stone-200 bg-white p-5 shadow-[0_8px_30px_rgb(28_29_26/0.04)]">
      <div>
        <p className="eyebrow">Best sellers</p>

        <h2 className="mt-1 text-lg font-semibold tracking-tight">
          Top products
        </h2>

        <p className="mt-1 text-sm text-stone-500">
          Ranked by units sold, last 30 days.
        </p>
      </div>

      <div className="mt-5 divide-y divide-stone-100">
        {products.length > 0 ? (
          products.map((product, index) => (
            <article
              key={product.name}
              className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className="grid size-8 shrink-0 place-items-center rounded-lg bg-stone-50 text-xs font-semibold text-stone-500"
                  aria-hidden="true"
                >
                  {index + 1}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-stone-900">
                    {product.name}
                  </p>
                  <p className="truncate text-xs text-stone-500">
                    {product.quantity_sold} units sold
                  </p>
                </div>
              </div>

              <p className="shrink-0 text-sm font-semibold text-stone-900">
                {formatCurrency(Number(product.revenue) || 0)}
              </p>
            </article>
          ))
        ) : (
          <div className="py-10 text-center">
            <Trophy
              className="mx-auto text-stone-300"
              size={28}
              aria-hidden="true"
            />
            <p className="mt-3 text-sm font-medium text-stone-700">
              No sales yet
            </p>
            <p className="mt-1 text-xs text-stone-500">
              Best sellers will show up once orders come in.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

/* ==========================================================================
   NEW: Order Status Breakdown
   ========================================================================== */

function StatusBreakdown({
  breakdown,
  totalOrders,
}: {
  breakdown: DashboardData["status_breakdown"];
  totalOrders: number;
}) {
  // Preserve a fixed, meaningful order (the order lifecycle) instead of
  // whatever order Postgres's GROUP BY happens to return.
  const orderedStatuses = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  const countByStatus = new Map(
    breakdown.map((row) => [row.status, row.count])
  );

  return (
    <section className="min-w-0 rounded-2xl border border-stone-200 bg-white p-5 shadow-[0_8px_30px_rgb(28_29_26/0.04)]">
      <div>
        <p className="eyebrow">Pipeline</p>

        <h2 className="mt-1 text-lg font-semibold tracking-tight">
          Order status
        </h2>

        <p className="mt-1 text-sm text-stone-500">
          Where every order currently stands.
        </p>
      </div>

      <div className="mt-5 space-y-4">
        {orderedStatuses.map((status) => {
          const count = countByStatus.get(status) ?? 0;
          const percent = totalOrders > 0 ? (count / totalOrders) * 100 : 0;

          return (
            <div key={status}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium capitalize text-stone-700">
                  {status}
                </span>
                <span className="text-stone-500">{count}</span>
              </div>

              <div
                className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-stone-100"
                role="progressbar"
                aria-valuenow={Math.round(percent)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${status} orders`}
              >
                <div
                  className={`h-full rounded-full ${
                    STATUS_DOT[status] || "bg-stone-400"
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ==========================================================================
   NEW: Low Stock Alert
   ========================================================================== */

function LowStockAlert({
  products,
}: {
  products: DashboardData["low_stock_products"];
}) {
  return (
    <section className="min-w-0 rounded-2xl border border-stone-200 bg-white p-5 shadow-[0_8px_30px_rgb(28_29_26/0.04)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Inventory</p>

          <h2 className="mt-1 text-lg font-semibold tracking-tight">
            Low stock
          </h2>

          <p className="mt-1 text-sm text-stone-500">
            Active products with 5 units or fewer.
          </p>
        </div>

        {products.length > 0 && (
          <span
            className="grid size-9 shrink-0 place-items-center rounded-lg bg-amber-50 text-amber-600"
            aria-hidden="true"
          >
            <AlertTriangle size={16} />
          </span>
        )}
      </div>

      <div className="mt-5 divide-y divide-stone-100">
        {products.length > 0 ? (
          products.map((product) => (
            <article
              key={product.name}
              className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <p className="truncate text-sm font-medium text-stone-900">
                {product.name}
              </p>

              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${
                  product.stock === 0
                    ? "bg-red-50 text-red-700 ring-red-200"
                    : "bg-amber-50 text-amber-700 ring-amber-200"
                }`}
              >
                {product.stock === 0
                  ? "Out of stock"
                  : `${product.stock} left`}
              </span>
            </article>
          ))
        ) : (
          <div className="py-10 text-center">
            <Package
              className="mx-auto text-stone-300"
              size={28}
              aria-hidden="true"
            />
            <p className="mt-3 text-sm font-medium text-stone-700">
              Stock levels look healthy
            </p>
            <p className="mt-1 text-xs text-stone-500">
              Nothing is close to running out right now.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 border-t border-stone-100 pt-5">
        <Link
          href="/admin/dashboard/products"
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-stone-200 px-4 py-3 text-sm font-semibold text-stone-700 transition-colors duration-150 hover:bg-stone-50"
        >
          <span>Manage inventory</span>
          <ArrowUpRight size={16} strokeWidth={2} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

/* ==========================================================================
   Quick Actions
   ========================================================================== */

function QuickActions() {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-[0_8px_30px_rgb(28_29_26/0.04)]">
      <div className="flex items-center gap-3">
        <div
          className="grid size-9 place-items-center rounded-lg bg-emerald-50 text-[#285943]"
          aria-hidden="true"
        >
          <Package size={17} />
        </div>

        <div>
          <h2 className="text-base font-semibold">Quick actions</h2>

          <p className="text-xs text-stone-500">
            Jump directly into common store tasks.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <QuickAction
          href="/admin/dashboard/orders"
          title="Manage orders"
          description="Review and update fulfillment status."
        />

        <QuickAction
          href="/admin/dashboard/products"
          title="Manage products"
          description="Edit inventory and catalog details."
        />

        <QuickAction
          href="/admin/dashboard/products"
          title="Add a product"
          description="Publish a new item to your store."
        />
      </div>
    </section>
  );
}

/* ==========================================================================
   Quick Action
   ========================================================================== */

function QuickAction({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-4 rounded-xl border border-stone-200 p-4 transition-[transform,background-color,border-color] duration-150 hover:-translate-y-0.5 hover:border-stone-300 hover:bg-stone-50"
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-stone-900">{title}</p>

        <p className="mt-1 text-xs leading-5 text-stone-500">
          {description}
        </p>
      </div>

      <ArrowUpRight
        className="shrink-0 text-stone-400 transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        size={17}
        aria-hidden="true"
      />
    </Link>
  );
}