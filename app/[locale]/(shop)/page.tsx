
import { productService } from "@/featues/products/types/services/productService";
import { ProductCard } from "@/featues/card/components/ProductCard";
import {
  ArrowRight,
  ArrowDown,
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

export const revalidate = 60;

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
  const categoryLabel =
    category !== "all" && t.has(`categories.${category}`)
      ? t(`categories.${category}`)
      : t("allProducts");

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
      <section className="relative h-[calc(100dvh-208px)] overflow-hidden bg-[var(--surface)] sm:h-[calc(100dvh-96px)]">
        {/* Decorative shapes only — no images */}
        <div
          className="pointer-events-none absolute -end-24 -top-24 h-72 w-72 rounded-full bg-[var(--brand)]/10 blur-2xl"
          aria-hidden="true"
        />

        <div
          className="pointer-events-none absolute -bottom-32 -start-16 h-72 w-72 rounded-full bg-[var(--brand)]/5 blur-2xl"
          aria-hidden="true"
        />

        <div className="page-shell relative flex h-full flex-col items-center justify-center px-1 py-2 text-center sm:py-8 lg:py-10">
          <p className="eyebrow text-[10px] font-semibold uppercase tracking-[.14em] text-[var(--brand)] sm:text-xs">
            {t("eyebrow")}
          </p>

          <h1 className="mt-2 max-w-2xl text-[2rem] font-bold leading-[1.05] tracking-[-.03em] text-stone-950 sm:mt-4 sm:text-5xl lg:text-[64px]">
            <span className="block">{t("title")}</span>
            <span className="block text-[var(--brand)]">{t("titleAccent")}</span>
          </h1>

          <p className="mt-2 max-w-lg text-xs leading-5 text-stone-600 sm:mt-5 sm:text-base sm:leading-7 lg:text-lg">
            {t("description")}
          </p>

          <div className="mt-3 flex w-full flex-wrap items-center justify-center gap-2 sm:mt-8 sm:w-auto sm:gap-3">
            <a
              href="#products"
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md bg-[var(--brand)] px-3 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--brand-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)] sm:flex-none sm:px-6"
            >
              {t("shopProducts")}
              <ArrowRight size={16} className="rtl-flip" aria-hidden="true" />
            </a>

            <a
              href="#products"
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-3 text-sm font-semibold text-stone-900 transition hover:border-stone-500 hover:bg-stone-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)] sm:flex-none sm:px-6"
            >
              {t("exploreDeals")}
            </a>
          </div>

          <dl className="mt-3 flex max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-1.5 border-t border-[var(--line)] pt-3 text-[10px] font-medium text-stone-700 sm:mt-10 sm:gap-x-8 sm:gap-y-3 sm:pt-6 sm:text-xs">
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

          <a
            href="#products"
            className="absolute bottom-3 flex flex-col items-center gap-1 text-[10px] font-semibold uppercase tracking-[.12em] text-stone-500 transition hover:text-[var(--brand)] sm:bottom-5 sm:gap-2 sm:text-xs"
          >
            <ArrowDown
              size={24}
              className="animate-bounce text-[var(--brand)]"
              strokeWidth={2}
              aria-hidden="true"
            />
            <span>{t("scrollDown")}</span>
          </a>
        </div>
      </section>

      {/* Category icons */}
      <section className="page-shell relative z-10 -mt-8 hidden sm:block sm:mt-0 sm:pt-10">
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
                prefetch={false}
                aria-current={active ? "page" : undefined}
                className={`flex w-20 shrink-0 snap-start flex-col items-center gap-2 rounded-xl border bg-white px-3 py-4 text-center transition hover:border-[var(--brand)] md:w-auto ${active
                  ? "border-[var(--brand)] ring-1 ring-[var(--brand)]"
                  : "border-stone-200"
                  }`}
              >
                <span className="grid h-11 w-11 place-items-center rounded-full bg-[#172554] text-[var(--brand)]">
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
            {hasSearch
              ? t("resultsFor", { query })
              : category === "all"
                ? t("allProducts")
                : categoryLabel}
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
