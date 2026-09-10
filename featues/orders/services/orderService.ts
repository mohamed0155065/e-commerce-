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