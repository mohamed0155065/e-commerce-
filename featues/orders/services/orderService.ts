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
 * Client usage rule:
 * - `createOrder` intentionally uses the shared browser `supabase` client
 *   because it's called from a public-facing checkout flow covered by the
 *   "anon can insert" RLS policies — no user session is expected or
 *   required there.
 * - `updateOrderStatus` and `getOrdersByUser`, on the other hand, operate
 *   under RLS policies that check `auth.uid()` (admin-only update,
 *   user-scoped select). Those MUST receive their Supabase client as a
 *   parameter from the caller (a Server Action using `supabaseServer()`),
 *   rather than importing the browser client directly. Importing the
 *   browser client for these would silently run the request with no
 *   session attached, causing RLS to match zero rows instead of failing
 *   loudly — this previously surfaced as a confusing "Cannot coerce the
 *   result to a single JSON object" error on status updates.
 *
 * Flow:
 * Server Action
 *     ↓
 * Authorization / validation
 *     ↓
 * Order Service (uses the client passed in by the caller)
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
 * Uses the shared browser client on purpose: this is called from the
 * public checkout flow, covered by the "anon can insert" RLS policy, and
 * does not require (or expect) a signed-in session.
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
 * The `client` is injected rather than imported directly because this
 * mutation is gated by an admin-only RLS policy that checks
 * `auth.uid()`. The caller (a Server Action) must create the client via
 * `supabaseServer()` so the admin's session cookies are attached to the
 * request — using the plain browser client here would run the UPDATE
 * with no identity, and RLS would match zero rows instead of raising a
 * clear permission error.
 *
 * @param client - A session-bound Supabase client (e.g. from `supabaseServer()`).
 * @param id - The order ID.
 * @param status - The new order status.
 * @returns The updated order record.
 */
export const updateOrderStatus = async (
    client: SupabaseClient,
    id: number,
    status: order_status
) => {
    const { data, error } = await client
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