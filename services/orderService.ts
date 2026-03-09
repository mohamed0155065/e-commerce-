import { supabase } from "@/lib/supabase";

export const createOrder = async (orderData: any) => {
    // تحويل items لـ JSON string والتأكد من total_price رقم
    const payload = {
        ...orderData,
        items: JSON.stringify(orderData.items),
        totalPrice: Number(orderData.total_price),
    };

    const { data, error } = await supabase
        .from("orders")
        .insert([payload])
        .select("*");

    if (error) throw new Error(error.message);

    return data;
};