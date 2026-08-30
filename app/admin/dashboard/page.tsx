import Link from "next/link";

import {
  ArrowUpRight,
  ClipboardList,
  Clock3,
  DollarSign,
  Package,
  ShoppingBag,
} from "lucide-react";

import { getSessionUser, supabaseServer } from "@/lib/supabaseServer";
import SalesChart from "./Chart";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export const dynamic = "force-dynamic";

/**
 * Small dashboard read model.
 *
 * We intentionally fetch only the data required by the dashboard.
 * This avoids loading unnecessary order/customer fields into the
 * server component and keeps the RSC payload small.
 */
type DashboardData = {
  total_sales: number;
  orders_received: number;
  awaiting_action: number;

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
};

const EMPTY_DASHBOARD: DashboardData = {
  total_sales: 0,
  orders_received: 0,
  awaiting_action: 0,
  sales_performance: [],
  recent_orders: [],
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  processing: "bg-blue-50 text-blue-700 ring-blue-200",
  shipped: "bg-violet-50 text-violet-700 ring-violet-200",
  delivered: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  cancelled: "bg-red-50 text-red-700 ring-red-200",
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

export default async function AdminOverviewPage() {
  const user = await getSessionUser();
  const supabase = await supabaseServer();

  /**
   * One database round-trip for the complete dashboard projection.
   *
   * Aggregation stays in PostgreSQL instead of loading all orders
   * into the application server and processing them in JavaScript.
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
        title="HERE'S WHAT'S HAPPENING WITH YOUR STORE TODAY"
        description="Monitor revenue, orders, and the work that needs attention."
        userEmail={user?.email}
      />

      {/* ------------------------------------------------------------------ */}
      {/* KPI cards                                                          */}
      {/* 1 column on mobile, 2 on small tablets, 3 from `lg` — avoids       */}
      {/* jumping straight from a single column to three.                    */}
      {/* ------------------------------------------------------------------ */}

      <section
        aria-label="Store metrics"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <MetricCard
          label="Total sales"
          value={formatCurrency(Number(dashboard.total_sales) || 0)}
          icon={DollarSign}
          tone="green"
          detail="Across all orders"
        />

        <MetricCard
          label="Orders received"
          value={dashboard.orders_received.toLocaleString()}
          icon={ShoppingBag}
          tone="blue"
          detail="All-time order volume"
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
      {/* Stacked on everything below `lg`; side-by-side from `lg` up.       */}
      {/* ------------------------------------------------------------------ */}

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,.8fr)]">
        <SalesChart data={dashboard.sales_performance} />

        <RecentOrders orders={dashboard.recent_orders} />
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
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof DollarSign;
  tone: "green" | "blue" | "amber";
  emphasis?: boolean;
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

  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-[0_8px_30px_rgb(28_29_26/0.04)] transition-shadow duration-200 hover:shadow-[0_12px_36px_rgb(28_29_26/0.07)]">
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-stone-500">
            {label}
          </p>

          {/* Smaller on mobile so a value like "$12,500" plus the icon
              never fight for width inside a narrow card. */}
          <p className="mt-2 truncate text-[1.65rem] font-semibold tracking-[-.03em] text-stone-950 sm:text-[2rem] sm:tracking-[-.045em]">
            {value}
          </p>

          <p className={detailClass}>{detail}</p>
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
                  className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ring-1 ring-inset ${STATUS_STYLES[order.status] ||
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

          <ArrowUpRight
            size={16}
            strokeWidth={2}
            aria-hidden="true"
          />
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
          <h2 className="text-base font-semibold">
            Quick actions
          </h2>

          <p className="text-xs text-stone-500">
            Jump directly into common store tasks.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
        <p className="text-sm font-semibold text-stone-900">
          {title}
        </p>

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