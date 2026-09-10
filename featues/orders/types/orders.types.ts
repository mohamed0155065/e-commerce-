

/**
 * OrderStatus — the lifecycle an order moves through after checkout.
 * Kept in sync with the `orders_status_check` constraint added in
 * supabase_migrations.sql. Used by:
 *  - components/admin/AdminOrdersList.tsx (status <select> + badge)
 *  - components/admin/OrderStatusBadge.tsx (color mapping)
 *  - app/admin/action.ts (updateOrderStatusAction validation)
 */
export type order_status =
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"

// A single line item as stored inside orders.items (JSON snapshot taken at checkout time,
// so it stays accurate even if the product is later edited/deleted).
export interface order_item {
    id: number | string
    Name: string
    Image: string
    Price: number
    quantity: number
}

/**
 * Order — one row of the `orders` table, as read by the admin dashboard.
 * `items` may arrive from Supabase either as a parsed array or as a raw JSON
 * string depending on the column's driver-level typing, so consumers should
 * normalize it (see AdminOrdersList's `parseOrderItems` helper) before use.
 */
export interface order {
    id: number
    full_name: string
    email: string
    phone: string
    address: string
    city: string
    totalPrice: number
    items: order_item[] | string
    status: order_status
    created_at: string
    is_synced?: boolean
    user_id?: string | null
}