import { supabase } from "@/lib/supabase";
import type { Product } from "@/types";

const TABLE_NAME = "product";
const PRODUCT_COLUMNS = "id, created_at, Name, Price, Description, Image";

export const productService = {
    async getAll(search?: string, category?: string): Promise<Product[]> {
        // This projection is the established schema supported by the existing
        // product table. Do not turn a missing optional UI field into a failed
        // catalog query.
        let query = supabase.from(TABLE_NAME).select(PRODUCT_COLUMNS);

        if (search?.trim()) {
            query = query.filter("Name", "ilike", `%${search.trim()}%`);
        }

        if (category && category !== "All") {
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
