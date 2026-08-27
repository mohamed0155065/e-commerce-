import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { notFound } from "next/navigation";

import { productService } from "@/services/productService";
import AddToCartButton from "@/components/AddToCartButton";
import { WishlistButton } from "@/components/WishlistButton";
import { RelatedProducts } from "@/components/RelatedProducts";
import { Product } from "@/types";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await productService.getById(id);

  if (!product) {
    notFound();
  }

  const related: Product[] = product.Category
    ? (await productService.getAll())
        .filter(
          (item) =>
            item.Category === product.Category && item.id !== product.id
        )
        .slice(0, 4)
    : [];

  const inStock = typeof product.Stock === "number" && product.Stock > 0;
  const stockKnown = typeof product.Stock === "number";

  return (
    <div className="pb-10">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="border-b border-stone-200 bg-white">
        <div className="page-shell flex h-9 items-center gap-2 overflow-x-auto text-xs text-stone-500">
          <Link
            href="/"
            className="shrink-0 whitespace-nowrap transition-colors hover:text-[#14532d]"
          >
            Shop
          </Link>

          {product.Category && (
            <>
              <ChevronRight size={14} className="shrink-0 text-stone-300" aria-hidden="true" />
              <Link
                href={`/?category=${encodeURIComponent(product.Category)}`}
                className="shrink-0 whitespace-nowrap capitalize transition-colors hover:text-[#14532d]"
              >
                {product.Category}
              </Link>
            </>
          )}

          <ChevronRight size={14} className="shrink-0 text-stone-300" aria-hidden="true" />

          <span className="truncate whitespace-nowrap text-stone-700" aria-current="page">
            {product.Name}
          </span>
        </div>
      </nav>

      {/* Product */}
      <section className="page-shell grid gap-6 py-4 lg:grid-cols-[0.85fr_1fr] lg:items-stretch lg:gap-8 lg:py-6">
        {/* Product Image */}
        <div className="relative">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-stone-200 bg-white lg:aspect-auto lg:h-full">
            {product.Category && (
              <span className="absolute left-4 top-4 z-10 rounded-full border border-stone-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-stone-600 shadow-sm">
                {product.Category}
              </span>
            )}

            {product.Image ? (
              <Image
                src={product.Image}
                alt={product.Name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-contain p-5 sm:p-6 lg:p-7"
              />
            ) : (
              <div className="grid h-full place-items-center text-sm text-stone-400">
                No image available
              </div>
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className="flex flex-col justify-center">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              {product.Category && (
                <p className="eyebrow text-[11px] font-semibold uppercase tracking-[.14em] text-[#14532d]">
                  {product.Category}
                </p>
              )}

              <h1
                className={`${
                  product.Category ? "mt-1.5" : ""
                } text-2xl font-bold leading-tight tracking-[-.02em] text-stone-950 sm:text-3xl lg:text-[34px]`}
              >
                {product.Name}
              </h1>
            </div>

            <div className="shrink-0">
              <WishlistButton product={product} />
            </div>
          </div>

          {/* Description */}
          {product.Description && (
            <p className="mt-2.5 max-w-xl text-sm leading-6 text-stone-600 line-clamp-2">
              {product.Description}
            </p>
          )}

          {/* Price */}
          <div className="mt-4 border-y border-stone-200 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-stone-400">
                  Price
                </p>

                <p className="mt-0.5 text-2xl font-bold tracking-[-.03em] text-stone-950 sm:text-3xl">
                  ${product.Price.toLocaleString()}
                </p>
              </div>

              {stockKnown && (
                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    inStock
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {inStock ? `${product.Stock} in stock` : "Out of stock"}
                </span>
              )}
            </div>
          </div>

          {/* Add to Cart */}
          <div className="mt-4 max-w-xl">
            <AddToCartButton product={product} />
          </div>

          {/* Product Info */}
          {(product.Category || stockKnown || product.Slug) && (
            <div className="mt-4 overflow-hidden rounded-xl border border-stone-200 bg-white">
              {product.Category && (
                <div className="flex items-center justify-between gap-4 border-b border-stone-200 px-4 py-2.5 last:border-b-0">
                  <span className="text-sm text-stone-500">Category</span>
                  <span className="truncate text-right text-sm font-semibold capitalize text-stone-900">
                    {product.Category}
                  </span>
                </div>
              )}

              {stockKnown && (
                <div className="flex items-center justify-between gap-4 border-b border-stone-200 px-4 py-2.5 last:border-b-0">
                  <span className="text-sm text-stone-500">Availability</span>
                  <span
                    className={`text-sm font-semibold ${
                      inStock ? "text-green-700" : "text-red-600"
                    }`}
                  >
                    {inStock ? `${product.Stock} in stock` : "Out of stock"}
                  </span>
                </div>
              )}

              {product.Slug && (
                <div className="flex items-center justify-between gap-4 px-4 py-2.5 last:border-b-0">
                  <span className="text-sm text-stone-500">SKU</span>
                  <span className="max-w-[55%] truncate text-right text-sm font-semibold text-stone-900">
                    {product.Slug}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Benefits */}
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-stone-600">
            <span className="inline-flex items-center gap-1.5">
              <Truck size={15} className="text-[#14532d]" aria-hidden="true" />
              Free shipping
            </span>

            <span className="inline-flex items-center gap-1.5">
              <RotateCcw size={15} className="text-[#14532d]" aria-hidden="true" />
              30-day returns
            </span>

            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-[#14532d]" aria-hidden="true" />
              Secure checkout
            </span>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="page-shell border-t border-stone-200 pt-10">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              {product.Category && (
                <p className="eyebrow text-xs font-semibold uppercase tracking-[.14em] text-[#14532d]">
                  More in {product.Category}
                </p>
              )}

              <h2 className="mt-1.5 text-2xl font-bold tracking-[-.02em] text-stone-950">
                You might also like
              </h2>
            </div>

            <Link
              href="/"
              className="text-sm font-semibold text-[#14532d] hover:underline"
            >
              View all
            </Link>
          </div>

          <RelatedProducts products={related} />
        </section>
      )}
    </div>
  );
}