import { supabase } from "@/lib/supabase";
import type { Product } from "@/types";

const TABLE_NAME = "product";

export const productService = {
    /**
     * Get all products, optionally filtered by search term or category
     * @param search Optional search string to match product names
     * @param category Optional category filter ("All" means no filter)
     * @returns Array of Product objects
     */
    async getAll(search?: string, category?: string): Promise<Product[]> {
        try {
            // Base query selecting necessary fields
            let query = supabase
                .from(TABLE_NAME)
                .select("id, created_at, Name, Price, Description, Image");

            // Apply search filter if provided
            if (search) {
                query = query.filter('Name', 'ilike', `%${search}%`);
            }

            // Apply category filter if provided and not "All"
            if (category && category !== "All") {
                query = query.filter('Category', 'eq', category);
            }

            // Execute query and typecast result to Product[]
            const { data, error } = await query.returns<Product[]>();

            if (error) throw new Error(error.message);

            return data ?? [];
        } catch (err) {
            console.error("[ProductService:getAll]", err);
            return [];
        }
    },

    /**
     * Get a single product by its ID
     * @param id Product ID
     * @returns Product object or null if not found
     */
    async getById(id: string): Promise<Product | null> {
        try {
            const { data, error } = await supabase
                .from(TABLE_NAME)
                .select("id, created_at, Name, Price, Description, Image")
                .eq("id", id)
                .maybeSingle() // Return single object or null
                .returns<Product>();

            if (error) {
                // Specific error code for "no rows found"
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