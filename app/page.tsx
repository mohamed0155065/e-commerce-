import { productService } from "@/services/productService";
import { ProductCard } from "@/components/ProductCard";
import { SearchBar } from "@/components/SearchBar";
import { ArrowRight, PackageSearch } from "lucide-react";
import type { Product } from "@/types";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage({ searchParams }: { searchParams: Promise<{ query?: string, category?: string }> }) {
  const { query = "", category = "all" } = await searchParams;
  const hasSearch = Boolean(query.trim());
  let products: Product[] = [];
  let loadError = false;

  try {
    products = await productService.getAll(query, category);
  } catch (error) {
    console.error("[HomePage:products]", error);
    loadError = true;
  }

  return <div className="pb-20">
    <section className="border-b border-stone-200 bg-[#e9eee9]"><div className="page-shell grid min-h-[420px] items-end gap-8 py-12 sm:grid-cols-[1.2fr_.8fr] sm:py-20">
      <div><p className="eyebrow mb-5">Online store</p><h1 className="max-w-xl text-4xl font-semibold leading-[1.02] tracking-[-.065em] text-stone-950 sm:text-6xl">Discover what&apos;s in store.</h1><p className="mt-6 max-w-md text-base leading-7 text-stone-600">Browse the current product collection, compare details, and add what you need to your cart.</p><div className="mt-8 max-w-lg"><SearchBar /></div></div>
      <div className="border-l border-[#b9c8ba] py-4 pl-6 sm:mb-2 sm:pl-8"><p className="text-sm font-medium text-stone-800">Simple product discovery.</p><p className="mt-2 text-sm leading-6 text-stone-600">Search the catalog or explore every available product below.</p><a href="#products" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#285943] hover:text-[#1d4534]">Explore products <ArrowRight size={16} /></a></div>
    </div></section>
    <section id="products" className="page-shell pt-14"><div className="mb-9 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">{hasSearch ? "Search results" : "The collection"}</p><h2 className="mt-2 text-3xl font-semibold tracking-[-.045em] text-stone-950">{hasSearch ? `Results for “${query}”` : "Products worth keeping"}</h2></div>{!loadError && <p className="text-sm text-stone-500">{products.length} {products.length === 1 ? "item" : "items"}</p>}</div>
      {/* Category navigation */}
      <nav className="mb-6 flex gap-3 flex-wrap">
        {[
          { slug: 'all', label: 'All' },
          { slug: 'laptop', label: 'Laptop' },
          { slug: 'phones', label: 'Phones' },
          { slug: 'smart_watches', label: 'Smart Watches' },
          { slug: 'headphones', label: 'Headphones' },
          { slug: 'earbuds', label: 'Earbuds' },
          { slug: 'other', label: 'Other' },
        ].map((c) => (
          <Link
            key={c.slug}
            href={`/?category=${c.slug}`}
            className={`inline-block rounded-full border px-4 py-1 text-sm ${category === c.slug ? 'bg-[#285943] text-white' : 'bg-white text-stone-700'}`}
          >
            {c.label}
          </Link>
        ))}
      </nav>
      {loadError ? <div className="border border-stone-300 bg-white px-6 py-20 text-center"><PackageSearch className="mx-auto text-stone-400" size={28}/><h3 className="mt-4 text-lg font-semibold">Unable to load products</h3><p className="mt-2 text-sm text-stone-500">Please check your connection and try again.</p><Link href="/" className="mt-5 inline-block text-sm font-semibold text-[#285943] hover:underline">Try again</Link></div> : products.length ? <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="border border-dashed border-stone-300 bg-white px-6 py-20 text-center"><PackageSearch className="mx-auto text-stone-400" size={28}/><h3 className="mt-4 text-lg font-semibold">{hasSearch ? "No products matched your search" : "No products available"}</h3><p className="mt-2 text-sm text-stone-500">{hasSearch ? "Try another search term, or clear your search to browse everything." : "Please check back soon for new products."}</p></div>}
    </section>
  </div>;
}
