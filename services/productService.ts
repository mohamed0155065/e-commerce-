import { supabaseServer } from "@/lib/supabaseServer";
import type { Product } from "@/types";

const TABLE_NAME = "product";

const PRODUCT_COLUMNS =
    "id, created_at, updated_at, Name, Price, Description, Image, Category, Stock, Status, Slug";

export const productService = {
    async getAll(
        search?: string,
        category?: string,
        includeInactive = false
    ): Promise<Product[]> {
        const supabase = await supabaseServer();

        let query = supabase
            .from(TABLE_NAME)
            .select(PRODUCT_COLUMNS);

        const normalizedSearch = search?.trim() || "";
        const normalizedCategory = category?.trim() || "";

        // Show only active products by default
        if (!includeInactive) {
            query = query.eq("Status", "active");
        }

        // Search by product name
        if (normalizedSearch) {
            query = query.ilike(
                "Name",
                `%${normalizedSearch}%`
            );
        }

        // Filter by category
        if (
            normalizedCategory &&
            normalizedCategory !== "all"
        ) {
            query = query.eq(
                "Category",
                normalizedCategory
            );
        }

        const { data, error } = await query
            .returns<Product[]>();

        if (error) {
            console.error("PRODUCTS ERROR:", error);

            throw new Error(
                `Unable to load products: ${error.message}`
            );
        }

        console.log("PRODUCTS DATA:", data);
        console.log("PRODUCT COUNT:", data?.length);
        console.log(
            "PRODUCT SEARCH:",
            normalizedSearch
        );
        console.log(
            "PRODUCT CATEGORY:",
            normalizedCategory
        );

        return data ?? [];
    },

    async getById(
        id: string
    ): Promise<Product | null> {
        const supabase = await supabaseServer();

        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select(PRODUCT_COLUMNS)
            .eq("id", id)
            .maybeSingle()
            .returns<Product>();

        if (error) {
            if (error.code === "PGRST116") {
                return null;
            }

            throw new Error(
                `Unable to load product: ${error.message}`
            );
        }

        return data;
    },
};