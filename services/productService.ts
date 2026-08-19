import { supabase } from "@/lib/supabase";
import type { Product } from "@/types";

const TABLE_NAME = "product";
const PRODUCT_COLUMNS = "id, created_at, updated_at, Name, Price, Description, Image, Category, Stock, Status, Slug";

export const productService = {
    async getAll(search?: string, category?: string, includeInactive = false): Promise<Product[]> {
        // Show only active products by default for storefront usage
        let query = supabase.from(TABLE_NAME).select(PRODUCT_COLUMNS);

        if (!includeInactive) {
            query = query.filter("Status", "eq", "active");
        }

        if (search?.trim()) {
            query = query.filter("Name", "ilike", `%${search.trim()}%`);
        }

        if (category && category !== "all") {
            query = query.filter("Category", "eq", category);
        }

        const { data, error } = await query.returns<Product[]>();
        if (error) throw new Error(`Unable to load products: ${error.message}`);

        return data ?? [];
    },

    async getById(id: string): Promise<Product | null> {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select(PRODUCT_COLUMNS)
            .eq("id", id)
            .maybeSingle()
            .returns<Product>();

        if (error) {
            if (error.code === "PGRST116") return null;
            throw new Error(`Unable to load product: ${error.message}`);
        }

        return data;
    },
};
