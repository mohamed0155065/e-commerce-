"use client";
import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { CartDrawer } from "./CartDrawer";

export const Navbar = () => {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const totalItems = useCartStore((state) => state.getTotalItems());

    return (
        <nav className="border-b p-4 sticky top-0 bg-white z-[50]">
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-2xl font-black italic text-orange-600">PRO-STORE</h1>

                <button
                    onClick={() => setIsCartOpen(true)} // لما يدوس يفتح
                    className="relative p-2"
                >
                    <ShoppingCart />
                    {totalItems > 0 && (
                        <span className="absolute -top-1 -right-1 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                            {totalItems}
                        </span>
                    )}
                </button>
            </div>

            {/* بننادي اللوحة هنا ونبعت لها الحالة */}
            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </nav>
    );
};