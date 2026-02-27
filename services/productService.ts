import { supabase } from "@/lib/supabase";
import type { Product } from "@/types";

const TABLE_NAME = "product";

export const productService = {
    // 🔹 Get All Products
    async getAll(
        search?: string,
        category?: string
    ): Promise<Product[]> {
        try {
            let query = supabase
                .from(TABLE_NAME)
                .select("id, created_at, Name, Price, Description, Image")


            // 🔍 Search
            if (search) {
                query = query.filter('Name', 'ilike', `%${search}%`);
            }

            // 🏷 Category
            if (category && category !== "All") {
                query = query.filter('Category', 'eq', category)
            }

            const { data, error } = await query.returns<Product[]>();

            if (error) throw new Error(error.message);

            return data ?? [];
        } catch (err) {
            console.error("[ProductService:getAll]", err);
            return [];
        }
    },

    // 🔹 Get Product By ID
    async getById(id: string): Promise<Product | null> {
        try {
            const { data, error } = await supabase
                .from(TABLE_NAME)
                .select("id, created_at, Name, Price, Description, Image")
                .eq("id", id)
                .maybeSingle()
                .returns<Product>();

            if (error) {
                if (error.code === "PGRST116") return null;
                throw new Error(error.message);
            }

            return data;
        } catch (err) {
            console.error("[ProductService:getById]", err);
            return null;
        }
    },
};