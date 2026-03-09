"use client";

import { useCartStore } from "@/store/useCartStore";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export const CartDrawer = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const { items, addItem, removeItem, getTotalPrice } = useCartStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    if (!mounted) return null;

    return (
        <>
            {/* 1. الستارة الخلفية - أغمق شوية عشان تبرز العرض الجديد */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/70  backdrop-blur-md transition-opacity duration-500"
                    onClick={onClose}
                />
            )}

            {/* 2. الـ Mega Drawer - العرض زاد لـ max-w-xl (حوالي 576px) */}
            <div className={`fixed top-0 right-0 h-screen w-full max-w-xl bg-white  shadow-2xl transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isOpen ? "translate-x-0" : "translate-x-full"}`}>

                {/* Container الأساسي واخد h-full و flex-col */}
                <div className="flex flex-col h-full">

                    {/* Header ثابت (Fixed Height) */}
                    <div className="px-8 py-7 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200">
                                <ShoppingBag size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">My Basket</h2>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{items.length} Items Selected</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-3 hover:bg-slate-50 rounded-full transition-all text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-100"
                        >
                            <X size={26} />
                        </button>
                    </div>

                    {/* الوسط: قائمة المنتجات - هي الوحيدة اللي بتعمل Scroll */}
                    <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar bg-white">
                        {items.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center">
                                <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                    <ShoppingBag size={50} className="text-slate-200" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Your basket is empty</h3>
                                <p className="text-slate-400 max-w-[250px] mb-8">Looks like you haven't added anything to your cart yet.</p>
                                <button onClick={onClose} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-600 transition">
                                    Browse Shop
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-6 items-center group">
                                        {/* صورة المنتج - حجم أكبر وأوضح */}
                                        <div className="w-32 h-32 bg-slate-50 rounded-[2rem] overflow-hidden border border-slate-100 flex-shrink-0 p-4 transition-transform group-hover:scale-105">
                                            <img src={item.Image} className="w-full h-full object-contain" alt={item.Name} />
                                        </div>

                                        {/* تفاصيل المنتج */}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-black text-slate-900 text-lg leading-tight mb-1">{item.Name}</h3>
                                                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded">
                                                        {item.Category}
                                                    </span>
                                                </div>
                                                <p className="text-xl font-black text-slate-900">${(item.Price * item.quantity).toLocaleString()}</p>
                                            </div>

                                            <div className="flex items-center justify-between mt-4">
                                                {/* أزرار التحكم - تصميم بريميوم */}
                                                <div className="flex items-center bg-slate-100 rounded-2xl p-1 gap-1">
                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-slate-400 hover:text-red-600 shadow-sm transition-colors"
                                                    >
                                                        {item.quantity === 1 ? <Trash2 size={16} /> : <Minus size={16} />}
                                                    </button>
                                                    <span className="text-sm font-black text-slate-900 w-10 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => addItem(item)}
                                                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-slate-400 hover:text-indigo-600 shadow-sm transition-colors"
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </div>


                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* الـ Footer الثابت في الأسفل (Shrink-0) */}
                    {items.length > 0 && (
                        <div className="px-8 py-8 border-t border-slate-100 bg-white shrink-0 shadow-[0_-20px_40px_rgba(0,0,0,0.02)]">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Total Amount</p>
                                    <h4 className="text-3xl font-black text-slate-900 tracking-tighter">
                                        ${getTotalPrice().toLocaleString()}
                                    </h4>
                                </div>
                                <div className="text-right">
                                    <p className="text-emerald-500 text-xs font-bold uppercase tracking-widest">Free Shipping</p>
                                    <p className="text-slate-400 text-[10px] font-medium mt-1">VAT Included</p>
                                </div>
                            </div>

                            <Link
                                href="/checkout"
                                onClick={onClose}
                                className="w-full bg-slate-950 text-white py-5 rounded-[2rem] font-bold flex items-center justify-center gap-4 hover:bg-indigo-600 transition-all active:scale-[0.98] shadow-2xl shadow-indigo-100 group text-lg"
                            >
                                Proceed to Checkout
                                <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform duration-300" />
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};