
import { productService } from "@/featues/products/types/services/productService";
import { ProductCard } from "@/featues/card/components/ProductCard";
import { SearchBar } from "@/components/shared/ui/SearchBar";
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
import type { Product } from "@/featues/products/types/products.types";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export const dynamic = "force-dynamic";

const CATEGORIES = [
  { slug: "all", label: "all", icon: PackageSearch },
  { slug: "laptop", label: "laptop", icon: Laptop },
  { slug: "phones", label: "phones", icon: Smartphone },
  { slug: "smart_watches", label: "smart_watches", icon: Watch },
  { slug: "headphones", label: "headphones", icon: Headphones },
  { slug: "earbuds", label: "earbuds", icon: Speaker },
  { slug: "tablets", label: "tablets", icon: Tablet },
  { slug: "gaming", label: "gaming", icon: Gamepad2 },
  { slug: "cameras", label: "cameras", icon: Camera },
  { slug: "other", label: "other", icon: PackageSearch },
];

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; category?: string }>;
}) {
  const { query = "", category = "all" } = await searchParams;
  const t = await getTranslations("home");

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
      <section className="relative overflow-hidden bg-[var(--surface)]">
        {/* Decorative shapes only — no images */}
        <div
          className="pointer-events-none absolute -end-24 -top-24 h-72 w-72 rounded-full bg-[var(--brand)]/10 blur-2xl"
          aria-hidden="true"
        />

        <div
          className="pointer-events-none absolute -bottom-32 -start-16 h-72 w-72 rounded-full bg-[var(--brand)]/5 blur-2xl"
          aria-hidden="true"
        />

        <div className="page-shell relative flex flex-col items-center py-14 text-center sm:py-20 lg:py-24">
          <p className="eyebrow text-xs font-semibold uppercase tracking-[.14em] text-[var(--brand)]">
            {t("eyebrow")}
          </p>

          <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-[1.08] tracking-[-.03em] text-stone-950 sm:text-5xl lg:text-[64px]">
            <span className="block">{t("title")}</span>
            <span className="block text-[var(--brand)]">{t("titleAccent")}</span>
          </h1>

          <p className="mt-5 max-w-lg text-base leading-7 text-stone-600 sm:text-lg">
            {t("description")}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#products"
              className="inline-flex items-center gap-2 rounded-md bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--brand-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]"
            >
              {t("shopProducts")}
              <ArrowRight size={16} className="rtl-flip" aria-hidden="true" />
            </a>

            <a
              href="#products"
              className="inline-flex items-center gap-2 rounded-md border border-stone-300 bg-white px-6 py-3 text-sm font-semibold text-stone-900 transition hover:border-stone-500 hover:bg-stone-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]"
            >
              {t("exploreDeals")}
            </a>
          </div>

          <div className="mt-9 w-full max-w-lg sm:hidden">
            <SearchBar />
          </div>

          <dl className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-[var(--line)] pt-6 text-xs font-medium text-stone-700">
            <div className="flex items-center gap-1.5">
              <ShieldCheck
                size={15}
                className="text-[var(--brand)]"
                aria-hidden="true"
              />
              {t("securePayments")}
            </div>

            <div className="flex items-center gap-1.5">
              <RotateCcw
                size={15}
                className="text-[var(--brand)]"
                aria-hidden="true"
              />
              {t("returns")}
            </div>

            <div className="flex items-center gap-1.5">
              <BadgeCheck
                size={15}
                className="text-[var(--brand)]"
                aria-hidden="true"
              />
              {t("genuine")}
            </div>

            <div className="flex items-center gap-1.5">
              <Clock
                size={15}
                className="text-[var(--brand)]"
                aria-hidden="true"
              />
              {t("support")}
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
                scroll={false}
                aria-current={active ? "page" : undefined}
                className={`flex w-20 shrink-0 snap-start flex-col items-center gap-2 rounded-xl border bg-white px-3 py-4 text-center transition hover:border-[var(--brand)] md:w-auto ${active
                  ? "border-[var(--brand)] ring-1 ring-[var(--brand)]"
                  : "border-stone-200"
                  }`}
              >
                <span className="grid h-11 w-11 place-items-center rounded-full bg-[#1F1633] text-[var(--brand)]">
                  <Icon size={20} aria-hidden="true" />
                </span>

                <span className="text-xs font-medium text-stone-800">
                  {t(`categories.${c.label}`)}
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
            {hasSearch ? t("resultsFor", { query }) : t("bestSellers")}
          </h2>
        </div>

        {loadError ? (
          <div className="rounded-xl border border-stone-300 bg-white px-6 py-20 text-center">
            <PackageSearch
              className="mx-auto text-stone-400"
              size={28}
              aria-hidden="true"
            />

            <h3 className="mt-4 text-lg font-semibold text-stone-900">
              {t("unableLoad")}
            </h3>

            <p className="mt-2 text-sm text-stone-500">
              {t("loadError")}
            </p>

            <Link
              href="/"
              className="mt-5 inline-block text-sm font-semibold text-[var(--brand)] hover:underline"
            >
              {t("tryAgain")}
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
            <PackageSearch
              className="mx-auto text-stone-400"
              size={28}
              aria-hidden="true"
            />

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
