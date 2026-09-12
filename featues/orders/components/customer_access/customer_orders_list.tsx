
"use client";

/**
 * featues/orders/components/customer/MyOrdersList.tsx
 * ---------------------------------------------------------------------------
 * "My Orders" — a signed-in customer's own order history.
 *
 * Responsibility:
 *   - Renders the orders belonging to the current user.
 *   - Subscribes to realtime order updates for this user.
 *
 * What this component intentionally does NOT do:
 *   - It never lets the customer change an order's status.
 * ---------------------------------------------------------------------------
 */

import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import { ChevronDown, MapPin, Package } from "lucide-react";

import { supabase } from "@/lib/supabase";
import type { order, order_item } from "../../types/orders.types";
import OrderStatusBadge from "../admin_access/OrderStatusBadge";

function parseOrderItems(items: order["items"]): order_item[] {
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

export default function MyOrdersList({
  initialOrders,
  userId,
}: {
  initialOrders: order[];
  userId: string;
}) {
  const [orders, setOrders] = useState<order[]>(initialOrders || []);

  const [syncedInitialOrders, setSyncedInitialOrders] =
    useState(initialOrders);

  if (initialOrders !== syncedInitialOrders) {
    setSyncedInitialOrders(initialOrders);
    setOrders(initialOrders || []);
  }

  useEffect(() => {
    const channel = supabase
      .channel(`my-orders-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const updated = payload.new as order;

          setOrders((current) =>
            current.map((o) =>
              o.id === updated.id ? { ...o, ...updated } : o,
            ),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const sortedOrders = useMemo(
    () =>
      [...orders].sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime(),
      ),
    [orders],
  );

  if (sortedOrders.length === 0) {
    return <EmptyState />;
  }

  return (
    <ul className="mt-8 space-y-5">
      {sortedOrders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </ul>
  );
}

const OrderCard = React.memo(function OrderCard({
  order,
}: {
  order: order;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const items = useMemo(
    () => parseOrderItems(order.items),
    [order.items],
  );

  const firstItem = items[0];
  const extraCount = Math.max(items.length - 1, 0);

  const formattedDate = new Date(order.created_at).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  );

  const formattedTotal = `$${Number(
    order.totalPrice || 0,
  ).toLocaleString()}`;

  return (
    <li className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[0_2px_8px_rgb(28_29_26/0.04)] transition-shadow duration-200 hover:shadow-[0_8px_24px_rgb(28_29_26/0.07)]">
      {/* Order header */}
      <div className="border-b border-stone-100 px-4 py-4 sm:px-5 sm:py-4.5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold tracking-[-0.01em] text-stone-900">
              Order #{String(order.id).padStart(3, "0")}
            </p>

            <p className="mt-1 text-xs text-stone-500">
              Placed on {formattedDate}
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2">
            <OrderStatusBadge status={order.status} />

            <p className="text-sm font-semibold tabular-nums text-stone-900">
              {formattedTotal}
            </p>
          </div>
        </div>
      </div>

      {/* Order preview */}
      <div className="flex items-center gap-4 px-4 py-4 sm:px-5 sm:py-5">
        {firstItem ? (
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-stone-200 bg-stone-50">
            <Image
              src={firstItem.Image}
              alt={firstItem.Name}
              fill
              sizes="64px"
              className="object-contain p-1.5"
            />
          </div>
        ) : (
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl border border-stone-200 bg-stone-50">
            <Package
              size={22}
              className="text-stone-300"
              aria-hidden="true"
            />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-stone-900">
            {firstItem?.Name ?? "Item unavailable"}
          </p>

          <p className="mt-1 text-xs text-stone-500">
            {extraCount > 0
              ? `${extraCount} more item${extraCount !== 1 ? "s" : ""}`
              : `Quantity ${firstItem?.quantity ?? 1}`}
          </p>
        </div>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setIsOpen((v) => !v)}
          aria-expanded={isOpen}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-2 text-xs font-medium text-stone-700 transition-all duration-150 hover:border-stone-300 hover:bg-stone-50 active:scale-[0.98]"
        >
          <span className="hidden sm:inline">
            {isOpen ? "Hide details" : "Order details"}
          </span>

          <span className="sm:hidden">
            {isOpen ? "Hide" : "Details"}
          </span>

          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          />
        </button>
      </div>

      {/* Expanded details */}
      {isOpen && (
        <div className="border-t border-stone-100 bg-stone-50/50 px-4 py-5 sm:px-5">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-stone-500">
                Items
              </p>

              <p className="text-xs text-stone-400">
                {items.length} item{items.length !== 1 ? "s" : ""}
              </p>
            </div>

            <ul className="overflow-hidden rounded-xl border border-stone-200 bg-white">
              {items.map((item, idx) => (
                <li
                  key={`${order.id}-${item.id}-${idx}`}
                  className="flex items-center gap-3 px-3 py-3.5 sm:px-4"
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-stone-200 bg-stone-50">
                    <Image
                      src={item.Image}
                      alt={item.Name}
                      fill
                      sizes="48px"
                      className="object-contain p-1"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-stone-800">
                      {item.Name}
                    </p>

                    <p className="mt-0.5 text-xs text-stone-500">
                      Qty {item.quantity}
                    </p>
                  </div>

                  <p className="shrink-0 text-sm font-semibold tabular-nums text-stone-900">
                    $
                    {(
                      Number(item.Price) * Number(item.quantity)
                    ).toLocaleString()}
                  </p>
                </li>
              ))}

              {items.length === 0 && (
                <li className="px-4 py-5 text-sm text-stone-500">
                  No item details available.
                </li>
              )}
            </ul>
          </div>

          {/* Shipping address */}
          <div className="mt-4 rounded-xl border border-stone-200 bg-white p-4">
            <div className="flex items-start gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-stone-100">
                <MapPin
                  size={15}
                  className="text-stone-500"
                  aria-hidden="true"
                />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-stone-500">
                  Shipping address
                </p>

                <p className="mt-1.5 text-sm leading-5 text-stone-700">
                  {order.address}, {order.city}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </li>
  );
});

function EmptyState() {
  return (
    <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-stone-300 bg-stone-50/40 px-6 py-16 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-stone-100">
        <Package
          className="text-stone-400"
          size={25}
          strokeWidth={1.8}
          aria-hidden="true"
        />
      </div>

      <p className="mt-4 text-sm font-semibold text-stone-800">
        No orders yet
      </p>

      <p className="mt-1 max-w-xs text-xs leading-5 text-stone-500">
        Orders you place will appear here so you can easily track their
        status and details.
      </p>
    </div>
  );
}

