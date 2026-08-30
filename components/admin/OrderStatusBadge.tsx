// components/admin/OrderStatusBadge.tsx
/**
 * components/admin/OrderStatusBadge.tsx
 * ---------------------------------------------------------------------------
 * Pure, presentational component: maps an OrderStatus to a colored pill.
 * Used only inside AdminOrdersList.tsx (one row per order). Kept as its own
 * file so the color/label mapping has a single source of truth instead of
 * being duplicated inline in the table markup.
 * ---------------------------------------------------------------------------
 */

import type { OrderStatus } from "@/types";

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  shipped: "bg-violet-50 text-violet-700 border-violet-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.pending;
  const label = STATUS_LABELS[status] ?? status;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${style}`}
    >
      {label}
    </span>
  );
}