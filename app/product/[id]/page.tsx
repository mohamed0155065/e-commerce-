import { productService } from "@/services/productService";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ShieldCheck, Zap, Star } from "lucide-react";
import AddToCartButton from "@/components/AddToCartButton";
import { RelatedProducts } from "@/components/RelatedProducts";
import { Product } from "@/types";

interface PageProps {
    params: Promise<{ id: string }>;
}
export const dynamic = 'force-dynamic';

/**
 * ProductPage component
 * - Fetches single product by ID
 * - Displays product details: image, description, price, stock status
 * - Shows trust tags (warranty, fast delivery)
 * - Lists related products from same category
 */
export default async function ProductPage({ params }: PageProps) {
    const { id } = await params;

    let product: Product | null = null;
    let related: Product[] = [];

    try {
        // Fetch product by ID
        product = await productService.getById(id);

        if (product) {
            // Fetch all products to filter related ones
            const all = await productService.getAll();
            related = all
                .filter((p) => p.Category === product?.Category && p.id !== id)
                .slice(0, 4); // Show only 4 related products
        }
    } catch (e) {
        console.error("Data fetch error", e);
    }

    if (!product) notFound(); // Return 404 if product not found

    return (
        <main className="min-h-screen bg-[#fafafa] flex flex-col items-center pb-20">

            {/* 1. Breadcrumbs */}
            <nav className="w-full bg-white border-b border-slate-100 mb-10">
                <div className="container mx-auto px-6 h-12 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    <Link href="/" className="hover:text-indigo-600 transition">Store</Link>
                    <ChevronRight size={10} />
                    <span className="text-slate-900">{product.Category}</span>
                </div>
            </nav>

            {/* 2. Product Detail Box */}
            <section className="w-full max-w-5xl px-6">
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-10">

                    {/* Left: Product Image */}
                    <div className="lg:col-span-4 bg-slate-50/50 flex items-center justify-center p-10 border-r border-slate-50">
                        <div className="relative w-full aspect-square max-w-[280px] group">
                            <img
                                src={product.Image}
                                alt={product.Name}
                                className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105 drop-shadow-2xl"
                            />
                        </div>
                    </div>

                    {/* Right: Product Info */}
                    <div className="lg:col-span-6 p-8 lg:p-14 flex flex-col justify-center">

                        {/* Rating and Tag */}
                        <div className="flex items-center gap-1 mb-4">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
                            ))}
                            <span className="text-[10px] font-bold text-slate-400 ml-2 uppercase tracking-widest">
                                Premium Choice
                            </span>
                        </div>

                        {/* Product Name */}
                        <h1 className="text-3xl lg:text-5xl font-black text-slate-950 mb-4 tracking-tighter leading-[1.1]">
                            {product.Name}
                        </h1>

                        {/* Product Description */}
                        <p className="text-sm text-slate-500 leading-relaxed mb-8 max-w-sm font-medium">
                            {product.Description}
                        </p>

                        {/* Price and Stock Status */}
                        <div className="flex items-baseline gap-4 mb-10">
                            <span className="text-4xl font-black text-slate-950 tracking-tighter">
                                ${product.Price.toLocaleString()}
                            </span>
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                                In Stock
                            </span>
                        </div>

                        {/* Add to Cart Button */}
                        <div className="w-full max-w-[240px]">
                            <AddToCartButton product={product} />
                        </div>

                        {/* Trust Tags */}
                        <div className="mt-10 pt-8 border-t border-slate-100 grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                                <ShieldCheck size={18} className="text-indigo-600" />
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                    2 Year Warranty
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Zap size={18} className="text-indigo-600" />
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                    Fast Delivery
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Related Products */}
            {related.length > 0 && (
                <section className="w-full max-w-5xl mt-20 px-6">
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Complete the Look</h2>
                            <p className="text-sm text-slate-400 font-medium">People also bought these items</p>
                        </div>
                        <Link href="/" className="text-indigo-600 font-bold text-xs hover:underline flex items-center gap-1">
                            View All <ChevronRight size={14} />
                        </Link>
                    </div>
                    <RelatedProducts products={related} />
                </section>
            )}
        </main>
    );
}