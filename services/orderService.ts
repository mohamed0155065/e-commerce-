import { supabase } from "@/lib/supabase";

/**
 * Creates a new order in the 'orders' table
 * @param orderData - Object containing order information including items and total price
 * @returns The newly inserted order record(s)
 */
export const createOrder = async (orderData: any) => {
    // Convert items array to JSON string and ensure totalPrice is a number
    const payload = {
        ...orderData,
        items: JSON.stringify(orderData.items),
        totalPrice: Number(orderData.total_price),
    };

    // Insert the order into the 'orders' table
    const { data, error } = await supabase
        .from("orders")
        .insert([payload])
        .select("*"); // Return the inserted row(s)

    // Throw error if insertion fails
    if (error) throw new Error(error.message);

    return data;
};