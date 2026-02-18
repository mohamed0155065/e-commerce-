import { supabase } from '@/lib/supabase';
import type { product } from '@/types';

const TABLE_NAME = 'product';

export async function getProducts(): Promise<product[]> {
    try {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select(`id,created_at,Name,Price,Description,Image`)
            .returns<product[]>();

        if (error) {
            throw new Error(error.message);
        }

        return data ?? [];
    } catch (err) {
        console.error('[ProductService:getProducts]', err);
        return [];
    }
}
