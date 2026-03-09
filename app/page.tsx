import { productService } from "@/services/productService";
import { ProductCard } from "@/components/ProductCard";
import { SearchBar } from "@/components/SearchBar";

export const dynamic = "force-dynamic";

/**
 * HomePage component
 * - Displays hero section with promotional message
 * - Provides a search bar on mobile
 * - Shows a grid of featured products fetched from productService
 * - Uses dynamic rendering for real-time updates
 */
export default async function HomePage({ searchParams }: any) {
  const { query } = await searchParams;

  // Fetch products (optionally filtered by search query)
  const products = await productService.getAll(query);

  return (
    <main className="min-h-screen">

      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="container mx-auto px-6 text-center">
          <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold uppercase tracking-widest text-violet-600 bg-violet-50 rounded-full">
            The Best 2025 Collection
          </span>

          <h1 className="text-5xl lg:text-7xl font-black text-slate-900 mb-6 tracking-tight">
            Find everything you <br />
            <span className="text-violet-600">love right here.</span>
          </h1>

          <p className="max-w-xl mx-auto text-slate-500 text-lg mb-10 font-medium leading-relaxed">
            High quality products, affordable prices, and fast delivery to your door.
          </p>

          {/* Mobile Search Bar */}
          <div className="lg:hidden max-w-md mx-auto mb-10">
            <SearchBar />
          </div>
        </div>

        {/* Decorative Background Blurs */}
        <div className="absolute top-0 left-0 -z-10 w-64 h-64 bg-violet-100/50 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 right-0 -z-10 w-64 h-64 bg-amber-100/50 blur-[100px] rounded-full" />
      </section>

      {/* Featured Products Section */}
      <section className="container mx-auto px-6 pb-24">
        <div className="flex items-center gap-4 mb-12">
          <h2 className="text-2xl font-black text-slate-900">Featured Products</h2>
          <div className="h-px bg-slate-200 flex-1"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </main>
  );
}