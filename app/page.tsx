import { productService } from "@/services/productService";
import { ProductCard } from "@/components/ProductCard";
import { SearchBar } from "@/components/SearchBar";
import {
  ArrowRight,
  Headphones,
  Laptop,
  Camera,
  Gamepad2,
  PackageSearch,
  Smartphone,
  Speaker,
  Tablet,
  Watch,
  ShieldCheck,
  RotateCcw,
  BadgeCheck,
  Clock,
} from "lucide-react";
import type { Product } from "@/types";
import Link from "next/link";

export const dynamic = "force-dynamic";

const CATEGORIES = [
  { slug: "all", label: "All", icon: PackageSearch },
  { slug: "laptop", label: "Laptops", icon: Laptop },
  { slug: "phones", label: "Phones", icon: Smartphone },
  { slug: "smart_watches", label: "Smartwatches", icon: Watch },
  { slug: "headphones", label: "Headphones", icon: Headphones },
  { slug: "earbuds", label: "Earbuds", icon: Speaker },
  { slug: "tablets", label: "Tablets", icon: Tablet },
  { slug: "gaming", label: "Gaming", icon: Gamepad2 },
  { slug: "cameras", label: "Cameras", icon: Camera },
  { slug: "other", label: "Other", icon: PackageSearch },
];

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; category?: string }>;
}) {
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

  return (
    <div className="pb-20">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#ccd7ce]">
        {/* Decorative shapes only — no images */}
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#14532d]/10 blur-2xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-[#14532d]/5 blur-2xl"
          aria-hidden="true"
        />

        <div className="page-shell relative flex flex-col items-center py-14 text-center sm:py-20 lg:py-24">
          <p className="eyebrow text-xs font-semibold uppercase tracking-[.14em] text-[#14532d]">
            Online store
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-[1.08] tracking-[-.03em] text-stone-950 sm:text-5xl lg:text-[64px]">
            Shop the latest <span className="text-[#14532d]">tech.</span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-stone-600 sm:text-lg">
            Find top laptops, phones, accessories and more. Compare, choose
            and add to cart with ease.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#products"
              className="inline-flex items-center gap-2 rounded-md bg-[#14532d] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0d3d21] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#14532d]"
            >
              Shop products
              <ArrowRight size={16} aria-hidden="true" />
            </a>
            <a
              href="#products"
              className="inline-flex items-center gap-2 rounded-md border border-stone-300 bg-white px-6 py-3 text-sm font-semibold text-stone-900 transition hover:border-stone-500 hover:bg-stone-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#14532d]"
            >
              Explore deals
            </a>
          </div>

          <div className="mt-9 w-full max-w-lg sm:hidden">
            <SearchBar />
          </div>

          <dl className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-[#b9cbbb] pt-6 text-xs font-medium text-stone-700">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-[#14532d]" aria-hidden="true" />
              Secure payments
            </div>
            <div className="flex items-center gap-1.5">
              <RotateCcw size={15} className="text-[#14532d]" aria-hidden="true" />
              7-day returns
            </div>
            <div className="flex items-center gap-1.5">
              <BadgeCheck size={15} className="text-[#14532d]" aria-hidden="true" />
              Genuine products
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={15} className="text-[#14532d]" aria-hidden="true" />
              24/7 support
            </div>
          </dl>
        </div>
      </section>

      {/* Category icons */}
      <section className="page-shell relative z-10 -mt-8 sm:mt-0 sm:pt-10">
        <div
          className="
            -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1
            md:mx-0 md:grid md:grid-cols-5 md:gap-3 md:overflow-visible md:px-0
            lg:grid-cols-10
          "
        >
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            const active = category === c.slug;
            return (
              <Link
                key={c.slug}
                href={`/?category=${c.slug}`}
                aria-current={active ? "page" : undefined}
                className={`flex w-20 shrink-0 snap-start flex-col items-center gap-2 rounded-xl border bg-white px-3 py-4 text-center transition hover:border-[#14532d] md:w-auto ${
                  active
                    ? "border-[#14532d] ring-1 ring-[#14532d]"
                    : "border-stone-200"
                }`}
              >
                <span className="grid h-11 w-11 place-items-center rounded-full bg-[#e9f0ea] text-[#14532d]">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <span className="text-xs font-medium text-stone-800">
                  {c.label}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Products */}
      <section id="products" className="page-shell pt-12">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-[-.02em] text-stone-950">
            {hasSearch ? `Results for "${query}"` : "Best Sellers"}
          </h2>
          {!loadError && (
            <p className="text-sm text-stone-500">
              {products.length} {products.length === 1 ? "item" : "items"}
            </p>
          )}
        </div>

        {loadError ? (
          <div className="rounded-xl border border-stone-300 bg-white px-6 py-20 text-center">
            <PackageSearch className="mx-auto text-stone-400" size={28} aria-hidden="true" />
            <h3 className="mt-4 text-lg font-semibold text-stone-900">
              Unable to load products
            </h3>
            <p className="mt-2 text-sm text-stone-500">
              Please check your connection and try again.
            </p>
            <Link
              href="/"
              className="mt-5 inline-block text-sm font-semibold text-[#14532d] hover:underline"
            >
              Try again
            </Link>
          </div>
        ) : products.length ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 xl:grid-cols-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-stone-300 bg-white px-6 py-20 text-center">
            <PackageSearch className="mx-auto text-stone-400" size={28} aria-hidden="true" />
            <h3 className="mt-4 text-lg font-semibold text-stone-900">
              {hasSearch
                ? "No products matched your search"
                : "No products available"}
            </h3>
            <p className="mt-2 text-sm text-stone-500">
              {hasSearch
                ? "Try another search term, or clear your search to browse everything."
                : "Please check back soon for new products."}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}