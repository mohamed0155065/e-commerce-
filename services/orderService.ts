
import { supabase } from "@/lib/supabase"

export const createOrder = async (orderData: any) => {
    const { data, error } = await supabase.
        from('orders')
        .insert([orderData])
        .select()
    if (error) {
        throw new Error(error.message)
    }
    return data
}
