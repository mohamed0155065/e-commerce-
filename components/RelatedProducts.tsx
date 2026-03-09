"use client";
import { motion } from 'framer-motion';
import { useCartStore } from '@/store/useCartStore';
import { Product } from '@/types';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export function RelatedProducts({ products }: { products: Product[] }) {
    // Get the addItem function from Zustand cart store
    const addItem = useCartStore((state) => state.addItem);

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Loop through all related products */}
            {products.map((product, index) => (
                <motion.div
                    key={product.id} // Unique key for React rendering
                    initial={{ opacity: 0, y: 15 }} // Initial animation state
                    whileInView={{ opacity: 1, y: 0 }} // Animate when element enters viewport
                    transition={{ delay: index * 0.1 }} // Stagger effect for sequential animation
                    viewport={{ once: true }} // Animate only once
                    className="group bg-white border border-slate-100 rounded-2xl p-3 hover:shadow-xl hover:ring-1 hover:ring-indigo-100 transition-all"
                >
                    {/* Product image wrapped in a Link to product page */}
                    <Link
                        href={`/product/${product.id}`}
                        aria-label={`View details for ${product.Name}`} // Accessibility label
                        className="block aspect-square bg-slate-50 rounded-xl overflow-hidden mb-3 p-4 relative focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                        {/* Product image */}
                        <img
                            src={product.Image}
                            className="w-full h-full object-contain transition-transform group-hover:scale-110 duration-500"
                            alt={product.Name} // Alt text for accessibility
                        />
                    </Link>

                    {/* Product info */}
                    <div className="px-1">
                        {/* Product category */}
                        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter mb-1">
                            {product.Category}
                        </h3>

                        {/* Product name */}
                        <h4 className="text-xs font-bold text-slate-800 truncate mb-2">
                            {product.Name}
                        </h4>

                        {/* Price and Add-to-Cart button */}
                        <div className="flex items-center justify-between mt-auto">
                            {/* Product price */}
                            <p className="text-sm font-black text-slate-900">${product.Price}</p>

                            {/* Add to cart button */}
                            <button
                                onClick={() => addItem(product)} // Add product to cart
                                className="p-1.5 bg-slate-900 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                                aria-label={`Add ${product.Name} to cart`} // Accessibility
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