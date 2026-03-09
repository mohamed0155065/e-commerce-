"use client";
import { Product } from "@/types";
import { useCartStore } from "@/store/useCartStore";
import Link from "next/link";
import { Plus } from "lucide-react";

export const ProductCard = ({ product }: { product: Product }) => {
    const addItem = useCartStore((state) => state.addItem);

    return (
        <div className="group bg-white rounded-3xl p-3 border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">

            {/* Image */}
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-50 mb-4">
                <Link href={`/product/${product.id}`} aria-label={`View details for ${product.Name}`}>
                    <img
                        src={product.Image}
                        className="w-full h-full object-contain p-6 transition duration-700 group-hover:scale-110"
                        alt={product.Name}
                    />
                </Link>
                <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-[10px] font-bold text-slate-900 rounded-lg shadow-sm">
                        {product.Category}
                    </span>
                </div>
            </div>

            {/* Info */}
            <div className="px-2 pb-2">
                <h3 className="text-base font-bold text-slate-900 mb-1 truncate">{product.Name}</h3>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4" aria-label="5 star rating">
                    {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-amber-400 text-xs" aria-hidden="true">★</span>
                    ))}
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Price</span>
                        <span className="text-xl font-black text-slate-900 tracking-tighter">${product.Price}</span>
                    </div>

                    <button
                        onClick={() => addItem(product)}
                        className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-100 hover:bg-slate-900 transition-all active:scale-90"
                        aria-label={`Add ${product.Name} to cart`}
                    >
                        <Plus size={22} />
                    </button>
                </div>
            </div>
        </div>
    );
};