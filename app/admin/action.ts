"use server";

/**
 * app/admin/action.ts
 * ---------------------------------------------------------------------------
 * Server Actions used exclusively by the admin dashboard (app/admin/dashboard).
 * Every function here runs on the server, re-checks authentication (and, for
 * order mutations, the caller's admin role) before touching the database, and
 * calls revalidatePath so the dashboard's server-rendered data stays fresh
 * after a mutation without a full page reload.
 *
 * Role in the system flow:
 *   UI (client components in components/admin/*) --> calls these actions -->
 *   Supabase (via supabaseServer, cookie-authenticated + RLS-protected) -->
 *   revalidatePath refreshes the relevant app/admin/dashboard/** route's
 *   server data (products -> /admin/dashboard/products, order status ->
 *   /admin/dashboard/orders and /admin/dashboard).
 * ---------------------------------------------------------------------------
 */

import { supabaseServer } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";
import { productSchema } from "@/validators/productSchema";
import type { OrderStatus, Order } from "@/types";

type ActionState = {
    success: boolean;
    message: string;
    product?: any;
};

// Keep this list in lockstep with the `orders_status_check` CHECK constraint
// added in supabase_migrations.sql — it's the single source of truth for
// which status transitions the UI/server will accept.
const ORDER_STATUSES: OrderStatus[] = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
];

/**
 * assertAdmin — defense-in-depth role check for order mutations.
 * Middleware already blocks non-admins from reaching /admin/*, and RLS blocks
 * non-admins at the database layer, but re-verifying here means this action
 * stays safe even if it's ever called from a context middleware doesn't cover
 * (e.g. directly invoked, or the matcher config changes later).
 */
async function assertAdmin(supabase: Awaited<ReturnType<typeof supabaseServer>>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Authentication required");

    const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (error || profile?.role !== "admin") {
        throw new Error("Admin privileges required");
    }

    return user;
}

/**
 * Clean and sanitize a file name to remove special characters
 * Converts accents, replaces spaces with dash, and replaces unsupported symbols with underscore
 */
const sanitizeFileName = (fileName: string) => {
    return fileName
        .normalize("NFD")                 // Decompose accented characters
        .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
        .replace(/[^a-zA-Z0-9.\-_]/g, "_") // Replace unsupported characters with underscore
        .replace(/\s+/g, "-");           // Replace spaces with dash
};

/**
 * Add a new product to the database
 * - Validates the form data
 * - Uploads the product image to Supabase storage
 * - Inserts the product into the database
 * - Revalidates relevant pages
 */
export async function addProductAction(prevState: ActionState | null, formData: FormData) {
    try {
        const supabase = await supabaseServer();

        // 1. Verify that the user is authenticated
        // (any authenticated user on this admin-only login form is treated as admin)
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Authentication required");

        // 2. Extract form data
        const rawData = {
            name: formData.get('name'),
            price: formData.get('price'),
            description: formData.get('description'),
            category: formData.get('category'),
            stock: formData.get('stock'),
            status: formData.get('status'),
        };

        // Validate form data against schema
        const result = productSchema.safeParse(rawData);
        if (!result.success) {
            return {
                success: false,
                message: result.error.issues[0].message
            };
        }

        const validated = result.data;

        // Ensure an image file was uploaded
        const imageFile = formData.get('image') as File;
        if (!imageFile || imageFile.size === 0) throw new Error("Image is required");

        // 3. Sanitize image file name and upload to Supabase storage
        const cleanName = sanitizeFileName(imageFile.name);
        const fileName = `${Date.now()}-${cleanName}`;

        const { data: uploadData, error: uploadErr } = await supabase.storage
            .from("product-images")
            .upload(fileName, imageFile);

        if (uploadErr) throw new Error(`Storage Error: ${uploadErr.message}`);

        // Get the public URL of the uploaded image
        const { data: { publicUrl } } = supabase.storage
            .from("product-images")
            .getPublicUrl(uploadData.path);

        // Generate a slug and ensure uniqueness
        const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        let slug = slugify(validated.name);
        const { data: existing } = await supabase.from('product').select('id').eq('Slug', slug).limit(1);
        if (existing && existing.length) {
            slug = `${slug}-${Date.now()}`;
        }

        // 4. Insert the validated product into the database
        const { error: dbError } = await supabase
            .from('product')
            .insert([{
                Name: validated.name,
                Price: validated.price,
                Description: validated.description,
                Image: publicUrl,
                Category: validated.category,
                Stock: validated.stock ?? 0,
                Status: validated.status ?? 'active',
                Slug: slug
            }]);

        if (dbError) throw new Error(`Database Error: ${dbError.message}`);

        // Revalidate homepage and admin dashboard
        revalidatePath("/");
        revalidatePath("/admin/dashboard/products");

        return { success: true, message: "Product published successfully!" };

    } catch (error: any) {
        console.error("Full Error Object:", error);

        // Return first validation error if available
        if (error.errors && error.errors.length > 0) {
            return { success: false, message: error.errors[0].message };
        }

        // Return generic or Supabase error message
        return {
            success: false,
            message: error.message || "Unexpected error occurred"
        };
    }
}

/**
 * Update an existing product
 * - Validates the form data
 * - Optionally uploads a new image (keeps existing image if none provided)
 * - Updates the product row in the database
 * - Revalidates relevant pages
 * - Returns the updated product so the UI can update without a full refresh
 */
export async function updateProductAction(prevState: ActionState | null, formData: FormData) {
    try {
        const supabase = await supabaseServer();

        // 1. Verify authentication
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Authentication required");

        const id = formData.get('id') as string;
        if (!id) throw new Error("Product ID is required");

        // 2. Extract form data
        const rawData = {
            name: formData.get('name'),
            price: formData.get('price'),
            description: formData.get('description'),
            category: formData.get('category'),
            stock: formData.get('stock'),
            status: formData.get('status'),
        };

        // Validate form data against schema
        const result = productSchema.safeParse(rawData);
        if (!result.success) {
            return {
                success: false,
                message: result.error.issues[0].message
            };
        }

        const validated = result.data;

        // 3. Build update payload (without image first)
        const updatePayload: Record<string, any> = {
            Name: validated.name,
            Price: validated.price,
            Description: validated.description,
            Category: validated.category,
            Stock: validated.stock ?? 0,
            Status: validated.status ?? 'active',
        };

        // 4. Only upload/replace image if a new file was provided
        const imageFile = formData.get('image') as File;
        if (imageFile && imageFile.size > 0) {
            const cleanName = sanitizeFileName(imageFile.name);
            const fileName = `${Date.now()}-${cleanName}`;

            const { data: uploadData, error: uploadErr } = await supabase.storage
                .from("product-images")
                .upload(fileName, imageFile);

            if (uploadErr) throw new Error(`Storage Error: ${uploadErr.message}`);

            const { data: { publicUrl } } = supabase.storage
                .from("product-images")
                .getPublicUrl(uploadData.path);

            updatePayload.Image = publicUrl;
        }

        // 5. Update the product in the database and get the updated row back
        console.log("=== UPDATE DEBUG START ===");
        console.log("UPDATE PAYLOAD:", updatePayload);
        console.log("UPDATE ID:", id, "| typeof:", typeof id);

        const { data: updatedProduct, error: dbError } = await supabase
            .from('product')
            .update(updatePayload)
            .eq('id', id)
            .select()
            .single();

        console.log("UPDATE RESULT DATA:", updatedProduct);
        console.log("UPDATE RESULT ERROR:", dbError);
        console.log("=== UPDATE DEBUG END ===");

        if (dbError) throw new Error(`Database Error: ${dbError.message}`);

        // Revalidate homepage and admin dashboard
        revalidatePath("/");
        revalidatePath("/admin/dashboard/products");

        return {
            success: true,
            message: "Product updated successfully!",
            product: updatedProduct,
        };

    } catch (error: any) {
        console.error("Update Product Error:", error);

        if (error.errors && error.errors.length > 0) {
            return { success: false, message: error.errors[0].message };
        }

        return {
            success: false,
            message: error.message || "Unexpected error occurred"
        };
    }
}

export async function deleteProductAction(
    payload: { id: string }
) {
    try {
        const supabase = await supabaseServer();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            throw new Error("Authentication required");
        }

        const { data: product, error: productError } =
            await supabase
                .from("product")
                .select("id, Image")
                .eq("id", payload.id)
                .maybeSingle();

        if (productError) {
            throw new Error(productError.message);
        }

        if (!product) {
            throw new Error("Product not found");
        }

        if (product.Image) {
            try {
                if (product.Image.includes("/product-images/")) {
                    const fileName = decodeURIComponent(
                        product.Image.split("/product-images/")[1]
                    );

                    if (fileName) {
                        const { error: storageError } =
                            await supabase.storage
                                .from("product-images")
                                .remove([fileName]);

                        if (storageError) {
                            console.warn(
                                "Failed to remove product image:",
                                storageError.message
                            );
                        }
                    }
                }
            } catch (storageError) {
                console.warn(
                    "Failed to remove product image:",
                    storageError
                );
            }
        }

        const { error: deleteError } = await supabase
            .from("product")
            .delete()
            .eq("id", payload.id);

        if (deleteError) {
            throw new Error(deleteError.message);
        }

        revalidatePath("/");
        revalidatePath("/admin/dashboard/products");

        return {
            success: true,
            message: "Product deleted successfully",
        };
    } catch (error) {
        console.error("Delete product error:", error);

        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to delete product",
        };
    }
}

/**
 * updateOrderStatusAction — moves an order to a new lifecycle status.
 * Called by components/admin/AdminOrdersList.tsx when the admin picks a new
 * value from the per-row status <select>. The client applies the change
 * optimistically and rolls back if this action reports failure.
 *
 * Flow: AdminOrdersList (optimistic UI) -> updateOrderStatusAction (this fn)
 *   -> assertAdmin (role re-check) -> Supabase `orders` UPDATE (RLS-guarded)
 *   -> revalidatePath("/admin/dashboard/orders" and "/admin/dashboard") so
 *      both the orders table and the overview KPIs are fresh on next load
 *   -> other admin tabs pick up the change live via the Realtime subscription
 *      set up in AdminOrdersList (no revalidation needed there).
 */
export async function updateOrderStatusAction(payload: {
    id: number;
    status: OrderStatus;
}): Promise<{ success: boolean; message: string; order?: Order }> {
    try {
        const supabase = await supabaseServer();

        // 1. Re-verify the caller is an authenticated admin (see assertAdmin above)
        await assertAdmin(supabase);

        // 2. Validate the requested status against the known lifecycle values
        //    instead of trusting the client blindly.
        if (!ORDER_STATUSES.includes(payload.status)) {
            throw new Error("Invalid order status");
        }

        if (!payload.id) throw new Error("Order ID is required");

        // 3. Persist the change and return the updated row so the UI can sync
        //    without re-fetching the whole order list.
        const { data: updatedOrder, error } = await supabase
            .from("orders")
            .update({ status: payload.status })
            .eq("id", payload.id)
            .select("*")
            .single();

        if (error) throw new Error(`Database Error: ${error.message}`);

        // 4. Refresh the server-rendered dashboard data for the next full load.
        revalidatePath("/admin/dashboard/orders");
        // The overview's "Orders received" / "Awaiting action" tiles are
        // status-derived, so refresh that route too.
        revalidatePath("/admin/dashboard");

        return {
            success: true,
            message: "Order status updated",
            order: updatedOrder as Order,
        };
    } catch (error) {
        console.error("Update order status error:", error);

        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to update order status",
        };
    }
}