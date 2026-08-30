export interface Product {
    id: string
    Name: string
    Image: string
    Price: number
    Category?: string
    Description: string
    Stock?: number
    Status?: "active" | "inactive"
    Slug?: string
    created_at?: string
    updated_at?: string
    Rating?: number
}
export interface Category {
    id: string
    name: string
    slug: string
}
export interface productData {
    name: string
    price: number
    image: string
    description: string
}

/**
 * OrderStatus — the lifecycle an order moves through after checkout.
 * Kept in sync with the `orders_status_check` constraint added in
 * supabase_migrations.sql. Used by:
 *  - components/admin/AdminOrdersList.tsx (status <select> + badge)
 *  - components/admin/OrderStatusBadge.tsx (color mapping)
 *  - app/admin/action.ts (updateOrderStatusAction validation)
 */
export type OrderStatus =
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"

// A single line item as stored inside orders.items (JSON snapshot taken at checkout time,
// so it stays accurate even if the product is later edited/deleted).
export interface OrderItem {
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
export interface Order {
    id: number
    full_name: string
    email: string
    phone: string
    address: string
    city: string
    totalPrice: number
    items: OrderItem[] | string
    status: OrderStatus
    created_at: string
    is_synced?: boolean
    user_id?: string | null
}