// components/admin/AdminOrdersList.tsx
"use client";

/**
 * components/admin/AdminOrdersList.tsx
 * ---------------------------------------------------------------------------
 * Admin dashboard "Orders" section.
 *
 * Responsibility:
 *   - Renders the orders list (customer, address, total, items, status) —
 *     as a table on desktop (>= lg) and as stacked cards on mobile/tablet,
 *     since an HTML table forced into `overflow-x-auto` on a touch device
 *     is a poor interaction (see OrderRow / OrderCard split below).
 *   - Lets the admin change an order's status via a <select>, with an
 *     optimistic UI update + rollback if the server action fails.
 *   - Owns the realtime "automation" layer: it subscribes to Postgres
 *     changes on the `orders` table so that (a) a brand-new order placed by
 *     a customer appears instantly with a toast, and (b) a status change
 *     made by an admin in another tab/device is mirrored here live, without
 *     a manual refresh.
 *
 * System flow / relationships:
 *   app/admin/dashboard/orders/page.tsx  --(server-fetched initialOrders)-->  this component
 *   this component  --(status change)-->  app/admin/action.ts#updateOrderStatusAction
 *                                          --(RLS-guarded UPDATE)--> Supabase `orders`
 *   Supabase Realtime  --(postgres_changes on `orders`)-->  this component (live sync)
 *   lib/supabase.ts provides the browser Supabase client used for the
 *   Realtime subscription (auth cookies from supabaseServer are what make
 *   the underlying RLS policies allow this admin to read/update in the
 *   first place).
 * ---------------------------------------------------------------------------
 */

import Image from "next/image";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Loader2, Package } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { updateOrderStatusAction } from "@/app/admin/action";
import type { Order, OrderItem, OrderStatus } from "@/types";
import OrderStatusBadge from "./OrderStatusBadge";

const STATUS_OPTIONS: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

/**
 * Normalizes `order.items` into an array. Postgres `json`/`jsonb` columns
 * are usually deserialized automatically by supabase-js, but this table has
 * historically also received it as a stringified JSON payload (see
 * services/orderService.ts, which JSON.stringifies before insert), so we
 * defensively parse both shapes here rather than assuming one.
 */
function parseOrderItems(items: Order["items"]): OrderItem[] {
  if (Array.isArray(items)) return items;
  if (typeof items === "string") {
    try {
      const parsed = JSON.parse(items);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export default function AdminOrdersList({
  initialOrders,
}: {
  initialOrders: Order[];
}) {
  const [orders, setOrders] = useState<Order[]>(initialOrders || []);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Tracks status changes this tab just made, so the realtime UPDATE echo
  // for our own write doesn't trigger a redundant "status changed" toast.
  const recentLocalUpdates = useRef<Set<number>>(new Set());

  // Keep local state in sync if the server re-renders the page with fresh
  // data (e.g. after revalidatePath from a server action / navigation).
  // Done during render (React's documented "adjusting state on prop change"
  // pattern) rather than in a useEffect, so it doesn't cause an extra
  // commit/re-render pass every time the parent server component refreshes.
  const [syncedInitialOrders, setSyncedInitialOrders] = useState(initialOrders);
  if (initialOrders !== syncedInitialOrders) {
    setSyncedInitialOrders(initialOrders);
    setOrders(initialOrders || []);
  }

  // ---- Realtime automation: listen for new orders & cross-tab status sync ----
  useEffect(() => {
    const channel = supabase
      .channel("admin-orders-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const newOrder = payload.new as Order;
          setOrders((current) => {
            if (current.some((o) => o.id === newOrder.id)) return current;
            return [newOrder, ...current];
          });
          toast.success(`New order from ${newOrder.full_name || "a customer"}`, {
            description: `$${Number(newOrder.totalPrice || 0).toLocaleString()} · ${newOrder.city || ""}`,
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload) => {
          const updated = payload.new as Order;
          setOrders((current) =>
            current.map((o) => (o.id === updated.id ? { ...o, ...updated } : o))
          );

          // Skip the toast for updates this tab itself just triggered.
          if (recentLocalUpdates.current.has(updated.id)) {
            recentLocalUpdates.current.delete(updated.id);
            return;
          }
          toast.info(`Order #${updated.id} status changed to ${updated.status}`);
        }
      )
      .subscribe();

    // Always tear the channel down on unmount to avoid leaking a socket
    // subscription every time the admin navigates away from the dashboard.
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  /**
   * handleStatusChange — optimistic status update.
   * Stable via useCallback + functional setState (does not depend on
   * `orders`), so passing it down doesn't force every OrderRow to re-render
   * when unrelated rows change.
   */
  const handleStatusChange = useCallback(async (id: number, nextStatus: OrderStatus) => {
    let previousStatus: OrderStatus | undefined;

    setOrders((current) =>
      current.map((o) => {
        if (o.id === id) {
          previousStatus = o.status;
          return { ...o, status: nextStatus };
        }
        return o;
      })
    );
    setUpdatingId(id);
    recentLocalUpdates.current.add(id);

    const result = await updateOrderStatusAction({ id, status: nextStatus });

    if (!result.success) {
      // Roll back on failure so the UI never lies about persisted state.
      setOrders((current) =>
        current.map((o) => (o.id === id && previousStatus ? { ...o, status: previousStatus } : o))
      );
      recentLocalUpdates.current.delete(id);
      toast.error(result.message || "Failed to update order status");
    } else {
      toast.success(`Order #${id} marked as ${nextStatus}`);
    }

    setUpdatingId(null);
  }, []);

  const toggleExpanded = useCallback((id: number) => {
    setExpandedId((current) => (current === id ? null : id));
  }, []);

  const sortedOrders = useMemo(
    () =>
      [...orders].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
    [orders]
  );

  return (
    <section className="rounded-xl border border-stone-200 bg-white p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Orders</h3>
        <span className="text-xs text-stone-500">{sortedOrders.length} total</span>
      </div>

      {sortedOrders.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/*
            -----------------------------------------------------------------
            Mobile / tablet: card list (< lg). Same data + same handlers as
            the desktop table (handleStatusChange, toggleExpanded), just a
            layout better suited to a narrow, touch-driven viewport — a wide
            multi-column table would either truncate the address/contact
            columns unreadably or force sideways scrolling.
            -----------------------------------------------------------------
          */}
          <ul className="mt-4 space-y-3 lg:hidden">
            {sortedOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                isExpanded={expandedId === order.id}
                isUpdating={updatingId === order.id}
                onToggleExpanded={toggleExpanded}
                onStatusChange={handleStatusChange}
              />
            ))}
          </ul>

          {/* Desktop (>= lg): full table, unchanged behaviour. */}
          <div className="mt-4 hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[860px] text-left">
              <thead>
                <tr className="text-sm text-stone-600">
                  <th className="py-3">Customer</th>
                  <th className="py-3">Contact</th>
                  <th className="py-3">Location</th>
                  <th className="py-3">Total</th>
                  <th className="py-3">Placed</th>
                  <th className="py-3">Status</th>
                  <th className="py-3">Items</th>
                </tr>
              </thead>
              <tbody>
                {sortedOrders.map((order) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    isExpanded={expandedId === order.id}
                    isUpdating={updatingId === order.id}
                    onToggleExpanded={toggleExpanded}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

/**
 * OrderRow — isolated + memoized so that updating one order's status (which
 * re-renders the parent's `orders` state) doesn't force React to re-render
 * every other row in a large order list. Only re-renders when its own
 * order/expanded/updating props actually change.
 */
const OrderRow = React.memo(function OrderRow({
  order,
  isExpanded,
  isUpdating,
  onToggleExpanded,
  onStatusChange,
}: {
  order: Order;
  isExpanded: boolean;
  isUpdating: boolean;
  onToggleExpanded: (id: number) => void;
  onStatusChange: (id: number, status: OrderStatus) => void;
}) {
  const items = useMemo(() => parseOrderItems(order.items), [order.items]);

  return (
    <>
      <tr className="border-t align-top">
        <td className="py-3">
          <p className="font-medium">{order.full_name}</p>
          <p className="text-xs text-stone-500">{order.email}</p>
        </td>
        <td className="py-3 text-sm">{order.phone}</td>
        <td className="py-3 text-sm">
          {order.city}
          <p className="text-xs text-stone-500 max-w-[220px] truncate" title={order.address}>
            {order.address}
          </p>
        </td>
        <td className="py-3 font-semibold">${Number(order.totalPrice || 0).toLocaleString()}</td>
        <td className="py-3 text-xs text-stone-500">
          {new Date(order.created_at).toLocaleDateString()}
        </td>
        <td className="py-3">
          <div className="flex items-center gap-2">
            <OrderStatusBadge status={order.status} />
            {isUpdating ? (
              <Loader2 size={14} className="animate-spin text-stone-400" />
            ) : (
              <select
                aria-label={`Change status for order ${order.id}`}
                value={order.status}
                disabled={isUpdating}
                onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus)}
                className="rounded-md border border-stone-200 bg-white px-2 py-1 text-xs disabled:opacity-50"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            )}
          </div>
        </td>
        <td className="py-3">
          <button
            type="button"
            onClick={() => onToggleExpanded(order.id)}
            className="flex items-center gap-1 text-xs text-stone-600 hover:text-[#285943]"
          >
            {items.length} item{items.length !== 1 ? "s" : ""}
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </td>
      </tr>

      {isExpanded && (
        <tr className="bg-stone-50">
          <td colSpan={7} className="px-3 py-4">
            <ItemsList items={items} orderId={order.id} />
          </td>
        </tr>
      )}
    </>
  );
});

/**
 * OrderCard — mobile/tablet equivalent of OrderRow. Same memoization
 * rationale: an optimistic status update on one order shouldn't repaint
 * every other card in the list.
 */
const OrderCard = React.memo(function OrderCard({
  order,
  isExpanded,
  isUpdating,
  onToggleExpanded,
  onStatusChange,
}: {
  order: Order;
  isExpanded: boolean;
  isUpdating: boolean;
  onToggleExpanded: (id: number) => void;
  onStatusChange: (id: number, status: OrderStatus) => void;
}) {
  const items = useMemo(() => parseOrderItems(order.items), [order.items]);

  return (
    <li className="rounded-lg border border-stone-200 p-3 sm:p-4">
      {/* Customer + total */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-stone-900">
            {order.full_name}
          </p>
          <p className="truncate text-xs text-stone-500">{order.email}</p>
        </div>

        <p className="shrink-0 text-sm font-semibold text-stone-900">
          ${Number(order.totalPrice || 0).toLocaleString()}
        </p>
      </div>

      {/* Location + date */}
      <div className="mt-2 text-xs text-stone-500">
        <p className="truncate" title={order.address}>
          {order.city ? `${order.city} · ` : ""}
          {order.address}
        </p>
        <p className="mt-0.5">
          {order.phone} · {new Date(order.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* Status + item toggle */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-3">
        <div className="flex items-center gap-2">
          <OrderStatusBadge status={order.status} />
          {isUpdating ? (
            <Loader2 size={14} className="animate-spin text-stone-400" />
          ) : (
            <select
              aria-label={`Change status for order ${order.id}`}
              value={order.status}
              disabled={isUpdating}
              onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus)}
              className="min-h-8 rounded-md border border-stone-200 bg-white px-2 py-1 text-xs disabled:opacity-50"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          )}
        </div>

        <button
          type="button"
          onClick={() => onToggleExpanded(order.id)}
          className="flex min-h-8 items-center gap-1 text-xs font-medium text-stone-600 hover:text-[#285943]"
        >
          {items.length} item{items.length !== 1 ? "s" : ""}
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-3 border-t border-stone-100 pt-3">
          <ItemsList items={items} orderId={order.id} />
        </div>
      )}
    </li>
  );
});

/**
 * ItemsList — the expanded line-item breakdown, shared verbatim between the
 * desktop table row and the mobile card so the two surfaces never drift.
 */
function ItemsList({ items, orderId }: { items: OrderItem[]; orderId: number }) {
  return (
    <ul className="divide-y divide-stone-200">
      {items.map((item, idx) => (
        <li key={`${orderId}-${item.id}-${idx}`} className="flex items-center gap-3 py-2">
          <div className="relative h-10 w-10 shrink-0 bg-white border border-stone-200">
            <Image src={item.Image} alt={item.Name} fill sizes="40px" className="object-contain" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm">{item.Name}</p>
            <p className="text-xs text-stone-500">Qty {item.quantity}</p>
          </div>
          <p className="text-sm font-medium">
            ${(Number(item.Price) * Number(item.quantity)).toLocaleString()}
          </p>
        </li>
      ))}
      {items.length === 0 && (
        <li className="py-2 text-sm text-stone-500">No item details available.</li>
      )}
    </ul>
  );
}

function EmptyState() {
  return (
    <div className="mt-6 py-10 text-center">
      <Package className="mx-auto text-stone-300" size={28} aria-hidden="true" />
      <p className="mt-3 text-sm font-medium text-stone-700">No orders yet</p>
      <p className="mt-1 text-xs text-stone-500">
        New orders will appear here automatically.
      </p>
    </div>
  );
}