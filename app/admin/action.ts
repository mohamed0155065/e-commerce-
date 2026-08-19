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

        // 1. Verify that the user is authenticated and is an admin
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Authentication required");

        // check profile for admin role
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
        if (!profile || profile.role !== 'admin') throw new Error('Not authorized');

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

export async function deleteProductAction(prevState: ActionState | null, payload: { id: string }) {
    try {
        const supabase = await supabaseServer();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Authentication required');

        // check admin role
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
        if (!profile || profile.role !== 'admin') throw new Error('Not authorized');

        // fetch product to remove image
        const { data: product } = await supabase.from('product').select('id, Image').eq('id', payload.id).maybeSingle();
        if (!product) throw new Error('Product not found');

        // if image is stored in bucket, attempt to remove it (best-effort)
        try {
            if (product.Image && product.Image.includes('product-images')) {
                // naive extraction of file name from URL
                const parts = product.Image.split('/');
                const fileName = parts[parts.length - 1];
                await supabase.storage.from('product-images').remove([fileName]);
            }
        } catch (e) {
            // ignore storage removal errors
        }

        const { error } = await supabase.from('product').delete().eq('id', payload.id);
        if (error) throw new Error(error.message);

        revalidatePath('/');
        revalidatePath('/admin/dashboard');

        return { success: true, message: 'Product deleted' };
    } catch (error: any) {
        return { success: false, message: error.message || 'Failed to delete' };
    }
}