"use server";

import { revalidatePath } from "next/cache";

import { supabaseServer } from "@/lib/supabaseServer";

import { updateOrderStatus } from "../services/orderService";
import type { order_status } from "../types/orders.types";

/**
 * Order Server Actions
 *
 * Responsibility:
 * - Receive order mutations from the Admin UI.
 * - Authenticate the current user.
 * - Authorize admin operations.
 * - Validate action input.
 * - Delegate database mutations to orderService.
 * - Revalidate affected routes.
 *
 * This file does NOT own:
 * - Supabase queries.
 * - Database mutation implementation.
 * - UI logic.
 *
 * Flow:
 *
 * Admin UI
 *    ↓
 * updateOrderStatusAction
 *    ↓
 * supabaseServer() — one client, created once, carries the admin's session
 *    ↓
 * assertAdmin(client) — verifies role, does not create its own client
 *    ↓
 * Input validation
 *    ↓
 * orderService.updateOrderStatus(client, ...) — same session-bound client
 *    ↓
 * Supabase
 *
 * IMPORTANT: every Supabase call in this flow must use the SAME
 * session-bound client (`supabaseServer()`), created once per action
 * invocation. Using a different client (e.g. the browser client from
 * "@/lib/supabase") for the actual mutation after authorizing with a
 * session-bound client causes the request to hit Supabase with no
 * identity attached — RLS policies that check `auth.uid()` will then
 * silently match zero rows instead of throwing a clear permission error.
 * That mismatch was the root cause of a prior "Cannot coerce the result
 * to a single JSON object" bug: the UPDATE ran anonymously, affected 0
 * rows, and the trailing `.select().single()` had nothing to return.
 */

/**
 * Allowed order lifecycle states.
 *
 * This is an additional server-side validation layer.
 *
 * The UI should not be considered a trusted source for
 * valid order statuses.
 */
const ORDER_STATUSES: order_status[] = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
];

type ServerSupabaseClient = Awaited<ReturnType<typeof supabaseServer>>;

/**
 * Verifies that the current request belongs to an admin user.
 *
 * This check happens on the server because client-side
 * role checks are only UI controls and cannot provide security.
 *
 * Takes the already-created session-bound client rather than creating
 * its own, so authorization and the subsequent mutation always share
 * the same identity/session.
 */
async function assertAdmin(supabase: ServerSupabaseClient) {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Authentication required");
    }

    const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (error || profile?.role !== "admin") {
        throw new Error("Admin privileges required");
    }
}

/**
 * Updates the status of an order.
 *
 * Responsibilities:
 * - Create a single session-bound Supabase client for this invocation.
 * - Verify admin authentication using that client.
 * - Validate the order ID.
 * - Validate the requested status.
 * - Delegate the database mutation to orderService, using the SAME client.
 * - Revalidate affected admin pages.
 */
export async function updateOrderStatusAction(payload: {
    id: number;
    status: order_status;
}) {
    try {
        /**
         * Create the client once. Every downstream call (authorization
         * check + the actual mutation) reuses this exact instance so the
         * admin's session is consistently attached to every request.
         */
        const supabase = await supabaseServer();

        /**
         * Authorization must happen before the database mutation.
         */
        await assertAdmin(supabase);

        if (!payload.id) {
            throw new Error("Order ID is required");
        }

        if (!ORDER_STATUSES.includes(payload.status)) {
            throw new Error("Invalid order status");
        }

        /**
         * The service is responsible for the actual order update.
         * Keep the action focused on authorization and validation,
         * and delegate the mutation to the existing service signature.
         */
        const updatedOrder = await updateOrderStatus(
            supabase,
            payload.id,
            payload.status
        );

        /**
         * Revalidate only routes whose displayed data
         * is affected by the mutation.
         */
        revalidatePath("/admin/dashboard/orders");
        revalidatePath("/admin/dashboard");

        return {
            success: true,
            message: "Order status updated",
            order: updatedOrder,
        };
    } catch (error: unknown) {
        console.error(
            "Update Order Status Error:",
            error
        );

        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to update order status",
        };
    }
}