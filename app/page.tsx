/**
 * HomePage (Server Component)
 * - Fetches products from Supabase via the Service Layer.
 * - Supports real-time filtering through URL Query Parameters.
 * - Utilizes 'force-dynamic' to ensure fresh data on every request.
 */

import { productService } from "@/services/productService";
import { ProductCard } from "@/components/ProductCard";
import { SearchBar } from "@/components/SearchBar";
import { Suspense } from "react";

// Ensures the page is always rendered dynamically to reflect live database changes
export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams
}: {
  searchParams: Promise<{ query?: string }>
}) {
  // Next.js 15 requires awaiting searchParams before accessing properties
  const params = await searchParams;
  const query = params.query || "";

  // Data fetching handled via Service Layer (Abstraction Pattern)
  const products = await productService.getAll(query);

  return (
    <main className="min-h-screen pb-20">

      {/* Hero Section: Brand Identity & Search Engagement */}
      <section className="relative py-16 lg:py-24 overflow-hidden bg-white border-b border-slate-100">
        <div className="container mx-auto px-6 text-center relative z-10">
          <span className="inline-block px-4 py-1.5 mb-6 text-[10px] font-black uppercase tracking-[0.2em] text-violet-600 bg-violet-50 rounded-full">
            The Best 2025 Collection
          </span>

          <h1 className="text-5xl lg:text-8xl font-black text-slate-900 mb-8 tracking-tighter leading-[0.9]">
            Find everything you <br />
            <span className="text-violet-600 font-black">love right here.</span>
          </h1>

          <p className="max-w-xl mx-auto text-slate-400 text-lg mb-12 font-medium leading-relaxed italic">
            Experience premium quality products with express delivery to your doorstep.
          </p>

          {/* SearchBar synced with URL state for better UX and shareability */}
          <div className="max-w-md mx-auto">
            <SearchBar />
          </div>
        </div>

        {/* Decorative elements for modern 'Glassmorphism' look */}
        <div className="absolute top-0 left-0 -z-0 w-80 h-80 bg-violet-100/40 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 -z-0 w-80 h-80 bg-amber-100/30 blur-[120px] rounded-full" />
      </section>

      {/* Product Grid: Displaying dynamic results */}
      <section className="container mx-auto px-6 mt-20">
        <div className="flex items-center gap-4 mb-16">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Featured Products</h2>
          <div className="h-px bg-slate-200 flex-1"></div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{products.length} Items</p>
        </div>

        {products.length === 0 ? (
          <div className="py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No products matched your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

    </main>
  );
}