import { supabase } from "@/lib/supabase";
import { productData } from "@/types";

export const adminService = {
    uploadImage: async (file: File) => {
        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`

        const { data, error } = await supabase.storage
            .from('product-images')
            .upload(fileName, file);
        if (error) throw error

        const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(data.path)
        return publicUrl
    },
    addProduct: async (productData: productData) => {
        const { data, error } = await supabase
            .from('products')
            .insert([productData])
            .select()
        if (error) throw error
        return data
    }
}