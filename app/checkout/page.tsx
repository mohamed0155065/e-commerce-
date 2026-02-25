"use client";

import { useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema } from "@/validators/checkoutSchema";
import type { checkoutInput } from "@/validators/checkoutSchema";
import { useRouter } from "next/navigation";
import { createOrder } from "@/services/orderService";
import { toast } from "sonner";

export default function CheckoutPage() {
    const { items, getTotalPrice, clearCart } = useCartStore();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<checkoutInput>({
        resolver: zodResolver(checkoutSchema),
    });

    const onSubmit = async (formData: checkoutInput) => {
        if (items.length === 0) return;

        setIsSubmitting(true);

        try {
            const order = {
                full_name: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                city: formData.city,
                address: formData.address,
                total_price: getTotalPrice(),
                items: items.map((item) => ({
                    product_id: item.id,
                    quantity: item.quantity,
                    price: item.Price,
                })),
            };

            await createOrder(order);

            toast.success("Order placed successfully!");
            clearCart();
            router.push("/");
        } catch (error) {
            console.error(error);
            toast.error("Failed to place order. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="p-20 text-center text-lg font-semibold">
                عربتك فارغة، ارجع تسوق الأول!
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 lg:p-12">
            <h1 className="text-3xl font-black mb-10">Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Form Section */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="bg-gray-50 p-8 rounded-2xl border">
                        <h2 className="text-xl font-bold mb-6">Shipping Information</h2>

                        <div className="grid gap-4">
                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Full Name
                                </label>
                                <input
                                    {...register("fullName")}
                                    className={`w-full p-3 border rounded-lg ${errors.fullName ? "border-red-500" : ""
                                        }`}
                                />
                                {errors.fullName && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.fullName.message}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <input
                                    type="email"
                                    {...register("email")}
                                    className={`w-full p-3 border rounded-lg ${errors.email ? "border-red-500" : ""
                                        }`}
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            {/* Phone + City */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        {...register("phone")}
                                        className={`w-full p-3 border rounded-lg ${errors.phone ? "border-red-500" : ""
                                            }`}
                                    />
                                    {errors.phone && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.phone.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        City
                                    </label>
                                    <input
                                        {...register("city")}
                                        className={`w-full p-3 border rounded-lg ${errors.city ? "border-red-500" : ""
                                            }`}
                                    />
                                    {errors.city && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.city.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Full Address
                                </label>
                                <textarea
                                    {...register("address")}
                                    className={`w-full p-3 border rounded-lg h-24 ${errors.address ? "border-red-500" : ""
                                        }`}
                                />
                                {errors.address && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.address.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition disabled:opacity-50"
                    >
                        {isSubmitting
                            ? "Processing..."
                            : `Place Order ($${getTotalPrice()})`}
                    </button>
                </form>

                {/* Order Summary */}
                <div className="bg-white border p-8 rounded-2xl h-fit">
                    <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="flex justify-between mb-4 border-b pb-4"
                        >
                            <div className="flex gap-4">
                                <img
                                    src={item.Image}
                                    className="w-12 h-12 object-cover rounded"
                                    alt={item.Name}
                                />
                                <div>
                                    <p className="font-bold text-sm">{item.Name}</p>
                                    <p className="text-gray-500 text-xs">
                                        Qty: {item.quantity}
                                    </p>
                                </div>
                            </div>
                            <p className="font-bold">
                                ${item.Price * item.quantity}
                            </p>
                        </div>
                    ))}

                    <div className="flex justify-between text-xl font-black mt-6">
                        <span>Total</span>
                        <span>${getTotalPrice()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}