import { productService } from "@/services/productService";
import { ProductCard } from "@/components/ProductCard";
import { SearchBar } from "@/components/SearchBar";
import { ArrowRight, PackageSearch, Truck, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage({ searchParams }: { searchParams: Promise<{ query?: string }> }) {
  const { query = "" } = await searchParams;
  const products = await productService.getAll(query);
  return <div className="pb-20">
    <section className="border-b border-stone-200 bg-[#e9eee9]"><div className="page-shell grid min-h-[420px] items-end gap-8 py-12 sm:grid-cols-[1.2fr_.8fr] sm:py-20">
      <div><p className="eyebrow mb-5">Goods for the every day</p><h1 className="max-w-xl text-4xl font-semibold leading-[1.02] tracking-[-.065em] text-stone-950 sm:text-6xl">The useful things, chosen well.</h1><p className="mt-6 max-w-md text-base leading-7 text-stone-600">A carefully edited collection of considered essentials made to earn their place in your day.</p><div className="mt-8 max-w-lg"><SearchBar /></div></div>
      <div className="border-l border-[#b9c8ba] py-4 pl-6 sm:mb-2 sm:pl-8"><p className="text-sm font-medium text-stone-800">No noise. No endless scrolling.</p><p className="mt-2 text-sm leading-6 text-stone-600">Just dependable products and a straightforward way to get them home.</p><a href="#products" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#285943] hover:text-[#1d4534]">Browse the collection <ArrowRight size={16} /></a></div>
    </div></section>
    <section id="products" className="page-shell pt-14"><div className="mb-9 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">{query ? "Search results" : "The collection"}</p><h2 className="mt-2 text-3xl font-semibold tracking-[-.045em] text-stone-950">{query ? `Results for “${query}”` : "Products worth keeping"}</h2></div><p className="text-sm text-stone-500">{products.length} {products.length === 1 ? "item" : "items"}</p></div>
      {products.length ? <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="border border-dashed border-stone-300 bg-white px-6 py-20 text-center"><PackageSearch className="mx-auto text-stone-400" size={28}/><h3 className="mt-4 text-lg font-semibold">Nothing matched that search</h3><p className="mt-2 text-sm text-stone-500">Try another word, or return to the full collection.</p></div>}
    </section>
    <section className="page-shell mt-20 grid border-y border-stone-200 sm:grid-cols-3"><div className="flex gap-3 py-6 sm:border-r sm:border-stone-200"><Truck className="text-[#285943]" size={20}/><div><p className="text-sm font-semibold">Free delivery</p><p className="mt-1 text-xs leading-5 text-stone-500">On every order, always.</p></div></div><div className="flex gap-3 py-6 sm:border-r sm:border-stone-200 sm:px-6"><ShieldCheck className="text-[#285943]" size={20}/><div><p className="text-sm font-semibold">Buy with confidence</p><p className="mt-1 text-xs leading-5 text-stone-500">Clear support when you need it.</p></div></div><div className="py-6 sm:pl-6"><p className="text-sm font-semibold">A better standard</p><p className="mt-1 text-xs leading-5 text-stone-500">Practical products, thoughtfully presented.</p></div></section>
  </div>;
}
