"use server";

import { revalidatePath } from "next/cache";

import { supabaseServer } from "@/lib/supabaseServer";

import { productSchema } from "../valiators/product_schema";
import { productService } from "../services/productService";
import type { Product } from "../types/products.types";

/**
 * Product Server Actions
 *
 * Responsibilities:
 * - Authenticate the current request.
 * - Authorize admin-only mutations.
 * - Extract and validate incoming FormData.
 * - Delegate product mutations to productService.
 * - Revalidate routes affected by successful mutations.
 *
 * Does NOT belong here:
 * - Supabase database queries.
 * - Supabase Storage operations.
 * - File naming or upload implementation.
 * - Product persistence logic.
 * - Product business rules.
 *
 * Architecture:
 *
 * Admin UI
 *    ↓
 * Server Action
 *    ├── Authentication
 *    ├── Authorization
 *    ├── Validation
 *    ├── Product Service
 *    └── Cache Revalidation
 *              ↓
 *          Supabase
 */

export type ProductActionState = {
    success: boolean;
    message: string;
    product?: Product;
};

/**
 * Verifies that the current user is authenticated
 * and has administrator privileges.
 *
 * Authentication:
 * - The user must be logged in.
 *
 * Authorization:
 * - The authenticated user's profile must have role = "admin".
 *
 * This check belongs at the Server Action boundary because
 * client-side admin state cannot be trusted.
 */
async function assertAdmin(): Promise<void> {
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
 * Extracts product fields from FormData.
 *
 * Keeping extraction in the Action is intentional:
 * the Action translates the transport format (FormData)
 * into the structured input expected by the service.
 */
function getProductFormData(formData: FormData) {
    return {
        name: formData.get("name"),
        price: formData.get("price"),
        description: formData.get("description"),
        category: formData.get("category"),
        stock: formData.get("stock"),
        status: formData.get("status"),
    };
}

/**
 * Adds a new product.
 *
 * Flow:
 * 1. Authenticate and authorize admin.
 * 2. Extract FormData.
 * 3. Validate product fields.
 * 4. Validate the required image.
 * 5. Delegate creation to productService.
 * 6. Revalidate affected routes.
 */
export async function addProductAction(
    _prevState: ProductActionState | null,
    formData: FormData
): Promise<ProductActionState> {
    try {
        await assertAdmin();

        const rawData = getProductFormData(formData);

        const result = productSchema.safeParse(rawData);

        if (!result.success) {
            return {
                success: false,
                message: result.error.issues[0].message,
            };
        }

        const image = formData.get("image");

        if (!(image instanceof File) || image.size === 0) {
            return {
                success: false,
                message: "Image is required",
            };
        }

        const creatableProductService = productService as unknown as {
            create: (args: {
                data: typeof result.data;
                image: File;
            }) => Promise<Product>;
        };

        if (typeof creatableProductService.create !== "function") {
            return {
                success: false,
                message: "Create product is not supported by this service",
            };
        }

        const product = await creatableProductService.create({
            data: result.data,
            image,
        });

        revalidatePath("/");
        revalidatePath("/admin/dashboard/products");

        return {
            success: true,
            message: "Product published successfully!",
            product,
        };
    } catch (error: unknown) {
        console.error("Add Product Error:", error);

        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Unexpected error occurred",
        };
    }
}

/**
 * Updates an existing product.
 *
 * Flow:
 * 1. Authenticate and authorize admin.
 * 2. Validate product ID.
 * 3. Extract and validate product data.
 * 4. Read optional replacement image.
 * 5. Delegate the mutation to productService.
 * 6. Revalidate affected routes.
 */
export async function updateProductAction(
    _prevState: ProductActionState | null,
    formData: FormData
): Promise<ProductActionState> {
    try {
        await assertAdmin();

        const id = formData.get("id");

        if (typeof id !== "string" || !id.trim()) {
            return {
                success: false,
                message: "Product ID is required",
            };
        }

        const rawData = getProductFormData(formData);

        const result = productSchema.safeParse(rawData);

        if (!result.success) {
            return {
                success: false,
                message: result.error.issues[0].message,
            };
        }

        const image = formData.get("image");

        const imageFile =
            image instanceof File && image.size > 0
                ? image
                : undefined;

        const updatableProductService = productService as unknown as {
            update: (args: {
                id: string;
                data: typeof result.data;
                image?: File;
            }) => Promise<Product>;
        };

        if (typeof updatableProductService.update !== "function") {
            return {
                success: false,
                message: "Update product is not supported by this service",
            };
        }

        const product = await updatableProductService.update({
            id,
            data: result.data,
            image: imageFile,
        });

        revalidatePath("/");
        revalidatePath("/admin/dashboard/products");

        return {
            success: true,
            message: "Product updated successfully!",
            product,
        };
    } catch (error: unknown) {
        console.error("Update Product Error:", error);

        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Unexpected error occurred",
        };
    }
}

/**
 * Deletes an existing product.
 *
 * The Action only validates the request and delegates deletion.
 * Product lookup, image cleanup, and database deletion belong
 * to productService.
 */
export async function deleteProductAction(payload: {
    id: string;
}): Promise<ProductActionState> {
    try {
        await assertAdmin();

        if (!payload.id.trim()) {
            return {
                success: false,
                message: "Product ID is required",
            };
        }

        const deleteableProductService = productService as unknown as {
            delete: (id: string) => Promise<void>;
        };

        if (typeof deleteableProductService.delete !== "function") {
            return {
                success: false,
                message: "Delete product is not supported by this service",
            };
        }

        await deleteableProductService.delete(payload.id);

        revalidatePath("/");
        revalidatePath("/admin/dashboard/products");

        return {
            success: true,
            message: "Product deleted successfully",
        };
    } catch (error: unknown) {
        console.error("Delete Product Error:", error);

        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to delete product",
        };
    }
}