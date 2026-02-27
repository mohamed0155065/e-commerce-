"use client";
import { motion } from 'framer-motion';
import { useCartStore } from '@/store/useCartStore';
import { Product } from '@/types';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export function RelatedProducts({ products }: { products: Product[] }) {
    const addItem = useCartStore((state) => state.addItem);

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((product, index) => (
                <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="group bg-white border border-slate-100 rounded-2xl p-3 hover:shadow-xl hover:ring-1 hover:ring-indigo-100 transition-all"
                >
                    <Link href={`/product/${product.id}`} className="block aspect-square bg-slate-50 rounded-xl overflow-hidden mb-3 p-4 relative">
                        <img
                            src={product.Image}
                            className="w-full h-full object-contain transition-transform group-hover:scale-110 duration-500"
                        />
                    </Link>
                    <div className="px-1">
                        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter mb-1">{product.Category}</h3>
                        <h4 className="text-xs font-bold text-slate-800 truncate mb-2">{product.Name}</h4>
                        <div className="flex items-center justify-between mt-auto">
                            <p className="text-sm font-black text-slate-900">${product.Price}</p>
                            <button
                                onClick={() => addItem(product)}
                                className="p-1.5 bg-slate-900 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                            >
                                <Plus size={14} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}