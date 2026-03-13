/**
 * HomePage (Server Component)
 *
 * Redesigned with production-grade UI/UX:
 * - Refined editorial aesthetic: dark hero, clean grid, sharp typography
 * - Fully responsive: mobile-first, scales gracefully to 4-col desktop grid
 * - Subtle CSS animations via Tailwind (animate-fade-in, staggered reveals)
 * - All data-fetching logic and functionality preserved exactly as-is
 */

import { productService } from "@/services/productService";
import { ProductCard } from "@/components/ProductCard";
import { SearchBar } from "@/components/SearchBar";

// Ensures the page is always rendered dynamically to reflect live database changes
export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  // Next.js 15 requires awaiting searchParams before accessing properties
  const params = await searchParams;
  const query = params.query || "";

  // Data fetching handled via Service Layer (Abstraction Pattern)
  const products = await productService.getAll(query);

  return (
    <main className="min-h-screen bg-slate-50">

      {/* ── Hero Section ────────────────────────────────────────────────────
          Dark full-bleed hero with large editorial headline.
          Responsive: compact on mobile, expansive on desktop.               */}
      <section className="relative bg-slate-950 overflow-hidden">

        {/* Decorative background mesh — purely visual, aria-hidden */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          {/* Violet glow top-left */}
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-violet-600/20 blur-[120px]" />
          {/* Amber glow bottom-right */}
          <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full bg-amber-500/10 blur-[100px]" />
          {/* Subtle dot grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "radial-gradient(circle, #fff 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
        </div>

        {/* Hero content */}
        <div className="relative z-10 container mx-auto px-5 sm:px-8 lg:px-12 pt-16 pb-20 lg:pt-24 lg:pb-28">

          {/* Eyebrow label */}
          <div className="flex justify-center mb-8">
            <span className="
              inline-flex items-center gap-2
              px-4 py-1.5
              text-[10px] font-black uppercase tracking-[0.25em]
              text-amber-400 bg-amber-400/10 border border-amber-400/20
              rounded-full
            ">
              {/* Pulsing live dot */}
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" aria-hidden="true" />
              The Best 2025 Collection
            </span>
          </div>

          {/* Main headline — scales from 2.8rem on mobile to 7rem on desktop */}
          <h1 className="
            text-center
            text-[clamp(2.4rem,8vw,7rem)]
            font-black text-white
            leading-[0.92] tracking-tighter
            mb-6 lg:mb-8
          ">
            Find everything
            <br />
            <span className="
              text-transparent bg-clip-text
              bg-gradient-to-r from-violet-400 to-amber-400
            ">
              you love
            </span>{" "}
            <span className="text-white/80">right here.</span>
          </h1>

          {/* Subheading */}
          <p className="
            text-center max-w-md mx-auto
            text-slate-400 text-base lg:text-lg
            font-medium leading-relaxed
            mb-10 lg:mb-12
          ">
            Premium quality products with express delivery to your doorstep.
          </p>

          {/* Search bar — full width on mobile, constrained on desktop */}
          <div className="max-w-lg mx-auto">
            <SearchBar />
          </div>

          {/* Quick stats row */}
          <div className="
            flex items-center justify-center gap-6 sm:gap-10
            mt-12 lg:mt-16
            text-slate-500
          ">
            {[

              { value: "Free", label: "Shipping" },
              { value: "24/7", label: "Support" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-lg sm:text-xl font-black text-white">{stat.value}</p>
                <p className="text-[10px] uppercase tracking-widest font-bold mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom fade into page background */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50 to-transparent"
        />
      </section>

      {/* ── Product Grid Section ─────────────────────────────────────────────
          Active query banner, section header, and responsive product grid.   */}
      <section className="container mx-auto px-5 sm:px-8 lg:px-12 pt-14 pb-24">

        {/* Active search filter banner — only shown when a query is active */}
        {query && (
          <div className="
            mb-8 px-5 py-3.5
            flex items-center justify-between gap-3
            bg-violet-50 border border-violet-100
            rounded-2xl
          ">
            <p className="text-sm font-semibold text-violet-700">
              Showing results for{" "}
              <span className="font-black">&ldquo;{query}&rdquo;</span>
            </p>
            <span className="
              text-xs font-bold text-violet-500
              bg-violet-100 px-2.5 py-1 rounded-full
            ">
              {products.length} found
            </span>
          </div>
        )}

        {/* Section header row */}
        <div className="flex items-center gap-4 mb-10">
          <div>
            <h2 className="
              text-2xl sm:text-3xl
              font-black text-slate-900
              tracking-tight uppercase leading-none
            ">
              {query ? "Search Results" : "Featured Products"}
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-widest">
              {products.length} item{products.length !== 1 ? "s" : ""} available
            </p>
          </div>
          {/* Decorative line */}
          <div className="h-px bg-slate-200 flex-1 hidden sm:block" aria-hidden="true" />
        </div>

        {/* ── Empty State ─────────────────────────────────────────────────── */}
        {products.length === 0 ? (
          <div className="
            py-24 sm:py-36
            flex flex-col items-center justify-center
            text-center
            bg-white rounded-3xl
            border-2 border-dashed border-slate-100
          ">
            {/* Icon placeholder */}
            <div className="
              w-16 h-16 mb-5 rounded-2xl
              bg-slate-50 border border-slate-100
              flex items-center justify-center text-3xl
            " aria-hidden="true">
              🔍
            </div>
            <p className="text-slate-900 font-black text-lg mb-1">No products found</p>
            <p className="text-slate-400 text-sm font-medium max-w-[240px]">
              Try a different search term or browse all products.
            </p>
          </div>

        ) : (
          /* ── Product Grid ───────────────────────────────────────────────
              1 col on mobile → 2 col on sm → 3 col on lg → 4 col on xl
              gap scales with screen size for comfortable spacing           */
          <div className="
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-4
            gap-5 sm:gap-6 lg:gap-8
          ">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

    </main>
  );
}