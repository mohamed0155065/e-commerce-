import { supabase } from '@/lib/supabase';
import type { Product } from '@/types';

const TABLE_NAME = 'product';

export async function getProducts(): Promise<Product[]> {
    try {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select(`id,created_at,Name,Price,Description,Image`)
            .returns<Product[]>();

        if (error) {
            throw new Error(error.message);
        }

        return data ?? [];
    } catch (err) {
        console.error('[ProductService:getProducts]', err);
        return [];
    }
}
