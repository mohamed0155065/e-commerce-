"use server";

import { supabaseServer } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";
import { productSchema } from "@/validators/productSchema";

type ActionState = {
    success: boolean;
    message: string;
};

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
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Authentication required");

        // 2. Extract form data
        const rawData = {
            name: formData.get('name'),
            price: formData.get('price'),
            description: formData.get('description'),
        };

        // Validate form data against schema
        const result = productSchema.safeParse(rawData);
        if (!result.success) {
            return { success: false, message: result.error.errors[0].message };
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

        // 4. Insert the validated product into the database
        const { error: dbError } = await supabase
            .from('product')
            .insert([{
                Name: validated.name,
                Price: validated.price,
                Description: validated.description,
                Image: publicUrl,
                Category: "General"
            }]);

        if (dbError) throw new Error(`Database Error: ${dbError.message}`);

        // Revalidate homepage and admin dashboard
        revalidatePath("/");
        revalidatePath("/admin/dashboard");

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