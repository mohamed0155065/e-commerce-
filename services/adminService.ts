import { supabase } from "@/lib/supabase";
import { productData } from "@/types";

export const adminService = {
    /**
     * Uploads a product image to Supabase storage and returns the public URL
     * @param file - The image file to upload
     * @returns The public URL of the uploaded image
     */
    uploadImage: async (file: File): Promise<string> => {
        // Generate a safe and unique file name
        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;

        // Upload the file to the 'product-images' bucket
        const { data, error } = await supabase.storage
            .from('product-images')
            .upload(fileName, file);

        if (error) throw error;

        // Get the public URL of the uploaded file
        const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(data.path);

        return publicUrl;
    },

    /**
     * Adds a new product to the Supabase 'products' table
     * @param productData - Object containing product information
     * @returns The inserted product record(s)
     */
    addProduct: async (productData: productData) => {
        const { data, error } = await supabase
            .from('products')
            .insert([productData])
            .select(); // Returns the inserted record(s)

        if (error) throw error;

        return data;
    }
};