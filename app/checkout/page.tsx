"use client";

import { useCartStore } from "@/store/useCartStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema } from "@/validators/checkoutSchema";
import type { checkoutInput } from "@/validators/checkoutSchema";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, AlertCircle } from "lucide-react";

export default function CheckoutPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { items, getTotalPrice, clearCart } = useCartStore();
    const router = useRouter();

    const { register, handleSubmit, formState: { errors } } = useForm<checkoutInput>({
        resolver: zodResolver(checkoutSchema),
    });

    const onSubmit = async (formData: checkoutInput) => {
        setIsSubmitting(true);
        try {
            const orderPayload = {
                full_name: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                city: formData.city,
                totalPrice: getTotalPrice(),
                items: items,
            };

            const { error } = await supabase.from('orders').insert([orderPayload]);

            if (error) throw error;

            clearCart();
            router.push("/success");
        } catch (error: any) {
            console.error("Checkout Error:", error);
            alert(`فشل الطلب: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (items.length === 0) return (
        <div className="h-screen flex flex-col items-center justify-center bg-slate-50 text-center px-4">
            <p className="text-xl font-bold text-slate-400 mb-6 tracking-tight">Your cart is currently empty.</p>
            <Link href="/" className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-100 transition hover:scale-105 active:scale-95">
                Go Shopping
            </Link>
        </div>
    );

    return (
        <main className="min-h-screen bg-[#fafafa] py-12 lg:py-20">
            <div className="container mx-auto px-6 max-w-6xl">
                <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-indigo-600 mb-8 transition group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Catalog
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    {/* Form Section */}
                    <div className="lg:col-span-7 bg-white rounded-[2.5rem] p-8 lg:p-12 shadow-sm border border-slate-100">
                        <div className="mb-10">
                            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Shipping <span className="text-indigo-600">Details</span></h1>
                            <p className="text-slate-400 font-medium mt-2">Please provide your delivery information below.</p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Full Name */}
                                <div className="space-y-2">
                                    <label htmlFor="fullName" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                                    <input
                                        id="fullName"
                                        {...register("fullName")}
                                        autoComplete="name"
                                        placeholder="John Doe"
                                        className={`w-full p-4  text-taupe-950 bg-slate-50 rounded-2xl outline-none focus:ring-2 transition ${errors.fullName ? 'ring-2 ring-red-500' : 'focus:ring-indigo-600'}`}
                                    />
                                    {errors.fullName && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.fullName.message}</p>}
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                                    <input
                                        id="email"
                                        type="email"
                                        {...register("email")}
                                        autoComplete="email"
                                        placeholder="john@example.com"
                                        className={`w-full p-4  text-taupe-950 bg-slate-50 rounded-2xl outline-none focus:ring-2 transition ${errors.email ? 'ring-2 ring-red-500' : 'focus:ring-indigo-600'}`}
                                    />
                                    {errors.email && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.email.message}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Phone */}
                                <div className="space-y-2">
                                    <label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
                                    <input
                                        id="phone"
                                        {...register("phone")}
                                        autoComplete="tel"
                                        placeholder="01234567890"
                                        className={`w-full p-4  text-taupe-950 bg-slate-50 rounded-2xl outline-none focus:ring-2 transition ${errors.phone ? 'ring-2 ring-red-500' : 'focus:ring-indigo-600'}`}
                                    />
                                    {errors.phone && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.phone.message}</p>}
                                </div>

                                {/* City */}
                                <div className="space-y-2">
                                    <label htmlFor="city" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">City / Region</label>
                                    <input
                                        id="city"
                                        {...register("city")}
                                        autoComplete="address-level2"
                                        placeholder="Cairo"
                                        className={`w-full p-4  text-taupe-950 bg-slate-50 rounded-2xl outline-none focus:ring-2 transition ${errors.city ? 'ring-2 ring-red-500' : 'focus:ring-indigo-600'}`}
                                    />
                                    {errors.city && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.city.message}</p>}
                                </div>
                            </div>

                            {/* Address */}
                            <div className="space-y-2">
                                <label htmlFor="address" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Detailed Address</label>
                                <textarea
                                    id="address"
                                    {...register("address")}
                                    autoComplete="street-address"
                                    placeholder="Street, Building, Apartment number..."
                                    className={`w-full p-4  text-taupe-950 bg-slate-50 rounded-2xl outline-none h-32 resize-none focus:ring-2 transition ${errors.address ? 'ring-2 ring-red-500' : 'focus:ring-indigo-600'}`}
                                />
                                {errors.address && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.address.message}</p>}
                            </div>

                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full py-5 rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] ${isSubmitting ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-indigo-600 text-white hover:bg-slate-950"
                                        }`}
                                >
                                    {isSubmitting ? "Processing Order..." : `Complete Purchase ($${getTotalPrice().toLocaleString()})`}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Summary Section */}
                    <div className="lg:col-span-5 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 h-fit sticky top-24">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Order <span className="text-indigo-600">Summary</span></h2>
                            <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">{items.length} Items</span>
                        </div>

                        <div className="space-y-6 mb-10 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                            {items.map(item => (
                                <div key={item.id} className="flex gap-4 items-center group">
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 p-2 flex-shrink-0 group-hover:scale-105 transition-transform">
                                        <img src={item.Image} className="w-full h-full object-contain" alt={item.Name} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{item.Name}</h4>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Quantity: {item.quantity}</p>
                                    </div>
                                    <p className="font-black text-slate-900 tracking-tighter">${(item.Price * item.quantity).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4 border-t border-slate-50 pt-8">
                            <div className="flex justify-between text-sm font-bold text-slate-400 uppercase tracking-widest">
                                <span>Subtotal</span>
                                <span className="text-slate-900">${getTotalPrice().toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold text-slate-400 uppercase tracking-widest">
                                <span>Shipping</span>
                                <span className="text-emerald-500">Free</span>
                            </div>
                            <div className="flex justify-between text-3xl font-black text-slate-900 pt-4 border-t border-slate-100 mt-4 tracking-tighter">
                                <span>Total</span>
                                <span className="text-indigo-600">${getTotalPrice().toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}