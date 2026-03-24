"use client";
import { useState, useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { CartDrawer } from "./CartDrawer";
import { SearchBar } from "./SearchBar";

export const Navbar = () => {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const totalItems = useCartStore((state) => state.getTotalItems());

    useEffect(() => { setMounted(true); }, []);

    return (
        <header className="sticky top-0 z-[60] w-full bg-white/80 backdrop-blur-md border-b border-slate-100">
            <div className="container mx-auto px-6 h-20 flex items-center justify-between gap-4">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2" aria-label="Go to homepage">
                    <div className="bg-violet-600 p-2 rounded-xl text-white" aria-hidden="true">
                        <ShoppingBag size={20} />
                    </div>
                    <span className="text-xl font-black uppercase tracking-tighter text-slate-900">
                        Market<span className="text-violet-600">ly</span>
                    </span>
                </Link>


                {/* Cart Button */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="relative p-3 bg-slate-50 rounded-2xl hover:bg-violet-50 transition group"
                        aria-label={`Open shopping cart with ${totalItems} item${totalItems !== 1 ? "s" : ""}`}
                        aria-haspopup="dialog"
                        aria-expanded={isCartOpen}
                    >
                        <ShoppingBag size={22} className="text-slate-700 group-hover:text-violet-600" aria-hidden="true" />
                        {mounted && totalItems > 0 && (
                            <span
                                className="absolute -top-1 -right-1 bg-violet-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold ring-2 ring-white"
                                aria-label={`${totalItems} item${totalItems !== 1 ? "s" : ""} in cart`}
                            >
                                {totalItems}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Cart Drawer */}
            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </header>
    );
};