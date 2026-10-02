import { supabaseServer } from "@/lib/supabaseServer";
import type { Product } from "../products.types";

const TABLE_NAME = "product";
const STORAGE_BUCKET = "product-images";

const PRODUCT_COLUMNS =
    "id, created_at, updated_at, Name, Price, Description, Image, Category, Stock, Status, Slug";

const slugify = (value: string) => {
    const base = value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    return base || `product-${Date.now()}`;
};

const getStoragePathFromUrl = (url?: string) => {
    if (!url) return null;

    const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
    const index = url.indexOf(marker);

    if (index === -1) return null;

    return decodeURIComponent(url.slice(index + marker.length));
};

const uploadImageToStorage = async (file: File) => {
    const supabase = await supabaseServer();
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type || "application/octet-stream",
        });

    if (uploadError) {
        throw new Error(`Unable to upload image: ${uploadError.message}`);
    }

    const { data } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(uploadData.path);

    return data.publicUrl;
};

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

        if (!includeInactive) {
            query = query.eq("Status", "active");
        }

        if (normalizedSearch) {
            query = query.ilike("Name", `%${normalizedSearch}%`);
        }

        if (
            normalizedCategory &&
            normalizedCategory !== "all"
        ) {
            query = query.eq("Category", normalizedCategory);
        }

        const { data, error } = await query.returns<Product[]>();

        if (error) {
            console.error("PRODUCTS ERROR:", error);
            throw new Error(`Unable to load products: ${error.message}`);
        }

        return data ?? [];
    },

    async getById(id: string): Promise<Product | null> {
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

            throw new Error(`Unable to load product: ${error.message}`);
        }

        return data;
    },

    async create({
        data,
        image,
    }: {
        data: {
            name: string;
            price: number;
            description: string;
            category: string;
            stock?: number;
            status?: "active" | "inactive";
        };
        image: File;
    }): Promise<Product> {
        const supabase = await supabaseServer();
        const imageUrl = await uploadImageToStorage(image);

        const normalizedSlug = slugify(data.name);
        const payload = {
            Name: data.name,
            Price: Number(data.price),
            Description: data.description,
            Category: data.category,
            Stock: Number(data.stock ?? 0),
            Status: data.status ?? "active",
            Slug: normalizedSlug,
            Image: imageUrl,
        };

        const { data: created, error } = await supabase
            .from(TABLE_NAME)
            .insert([payload])
            .select(PRODUCT_COLUMNS)
            .single();

        if (error) {
            throw new Error(`Unable to create product: ${error.message}`);
        }

        return created as Product;
    },

    async update({
        id,
        data,
        image,
    }: {
        id: string;
        data: {
            name: string;
            price: number;
            description: string;
            category: string;
            stock?: number;
            status?: "active" | "inactive";
        };
        image?: File;
    }): Promise<Product> {
        const supabase = await supabaseServer();

        const existingProduct = await supabase
            .from(TABLE_NAME)
            .select("Image")
            .eq("id", id)
            .maybeSingle();

        if (existingProduct.error && existingProduct.error.code !== "PGRST116") {
            throw new Error(`Unable to fetch product: ${existingProduct.error.message}`);
        }

        let imageUrl = existingProduct?.data?.Image ?? "";

        if (image) {
            const previousPath = getStoragePathFromUrl(imageUrl);

            if (previousPath) {
                try {
                    await supabase.storage.from(STORAGE_BUCKET).remove([previousPath]);
                } catch {
                    // Ignore cleanup failures, continue with update.
                }
            }

            imageUrl = await uploadImageToStorage(image);
        }

        const payload = {
            Name: data.name,
            Price: Number(data.price),
            Description: data.description,
            Category: data.category,
            Stock: Number(data.stock ?? 0),
            Status: data.status ?? "active",
            Slug: slugify(data.name),
            Image: imageUrl,
        };

        const { data: updated, error } = await supabase
            .from(TABLE_NAME)
            .update(payload)
            .eq("id", id)
            .select(PRODUCT_COLUMNS)
            .single();

        if (error) {
            throw new Error(`Unable to update product: ${error.message}`);
        }

        return updated as Product;
    },

    async delete(id: string): Promise<void> {
        const supabase = await supabaseServer();

        const { data: productToDelete, error: fetchError } = await supabase
            .from(TABLE_NAME)
            .select("Image")
            .eq("id", id)
            .maybeSingle();

        if (fetchError && fetchError.code !== "PGRST116") {
            throw new Error(`Unable to fetch product before delete: ${fetchError.message}`);
        }

        const imagePath = getStoragePathFromUrl(productToDelete?.Image);

        if (imagePath) {
            try {
                await supabase.storage.from(STORAGE_BUCKET).remove([imagePath]);
            } catch {
                // Ignore storage cleanup errors and continue with row deletion.
            }
        }

        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq("id", id);

        if (error) {
            throw new Error(`Unable to delete product: ${error.message}`);
        }
    },
};