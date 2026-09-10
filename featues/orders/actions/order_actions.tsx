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
 * Authentication
 *    ↓
 * Authorization
 *    ↓
 * Input validation
 *    ↓
 * orderService.updateOrderStatus()
 *    ↓
 * Supabase
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

/**
 * Verifies that the current request belongs to an admin user.
 *
 * This check happens on the server because client-side
 * role checks are only UI controls and cannot provide security.
 */
async function assertAdmin() {
    const supabase = await supabaseServer();

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
 * - Verify admin authentication.
 * - Validate the order ID.
 * - Validate the requested status.
 * - Delegate the database mutation to orderService.
 * - Revalidate affected admin pages.
 */
export async function updateOrderStatusAction(payload: {
    id: number;
    status: order_status;
}) {
    try {
        /**
         * Authorization must happen before the database mutation.
         */
        await assertAdmin();

        if (!payload.id) {
            throw new Error("Order ID is required");
        }

        if (!ORDER_STATUSES.includes(payload.status)) {
            throw new Error("Invalid order status");
        }

        /**
         * The service is responsible for the actual
         * Supabase update.
         */
        const updatedOrder = await updateOrderStatus(
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