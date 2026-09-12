import type { SupabaseClient } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";

import type { order, order_status } from "../types/orders.types";

/**
 * Order Service
 *
 * Responsibility:
 * - Contains database operations related to orders.
 * - Provides a single place for order mutations.
 *
 * Does NOT belong here:
 * - Authentication / authorization.
 * - Next.js cache revalidation.
 * - FormData handling.
 * - UI-related logic.
 *
 * Flow:
 * Server Action
 *     ↓
 * Authorization / validation
 *     ↓
 * Order Service
 *     ↓
 * Supabase
 */

/**
 * Creates a new order in the "orders" table.
 *
 * Responsibilities:
 * - Prepare the order payload before persistence.
 * - Serialize the items array because the current database
 *   representation expects JSON data.
 * - Ensure totalPrice is stored as a number.
 * - Insert the order into Supabase.
 *
 * @param orderData - Validated order data.
 * @returns The newly created order record.
 */
export const createOrder = async (orderData: order) => {
    const payload = {
        ...orderData,

        // The database currently receives the order items
        // as a JSON string.
        items: JSON.stringify(orderData.items),

        // Ensure the persisted value is numeric.
        totalPrice: Number(orderData.totalPrice),
    };

    const { data, error } = await supabase
        .from("orders")
        .insert([payload])
        .select("*");

    if (error) {
        throw new Error(`Unable to create order: ${error.message}`);
    }

    return data;
};

/**
 * Updates the status of an existing order.
 *
 * Responsibility:
 * - Perform the database mutation only.
 *
 * Authentication and authorization are intentionally handled
 * outside this service because this service should not decide
 * whether the current user is allowed to perform the operation.
 *
 * @param id - The order ID.
 * @param status - The new order status.
 * @returns The updated order record.
 */
export const updateOrderStatus = async (
    id: number,
    status: order_status
) => {
    const { data, error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", id)
        .select("*")
        .single();

    if (error) {
        throw new Error(`Unable to update order status: ${error.message}`);
    }

    return data;
};

/**
 * Fetches every order placed by a specific user (their personal order
 * history), most recent first.
 *
 * Responsibility:
 * - Perform the database query only.
 *
 * The `client` is injected rather than imported directly so this can be
 * called either with the request-scoped `supabaseServer()` client (Server
 * Component page render) or with the browser `supabase` client.
 *
 * Row Level Security ("orders_select_own" policy) is the real security
 * boundary — it ensures a signed-in user can only ever be returned rows
 * where `user_id = auth.uid()`, no matter what id is passed in.
 *
 * @param client - A Supabase client bound to the current user's session.
 * @param userId - The id of the user whose orders to fetch.
 * @returns The user's orders, newest first.
 */
export const getOrdersByUser = async (
    client: SupabaseClient,
    userId: string
): Promise<order[]> => {
    const { data, error } = await client
        .from("orders")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    if (error) {
        throw new Error(`Unable to fetch orders: ${error.message}`);
    }

    return (data ?? []) as order[];
};