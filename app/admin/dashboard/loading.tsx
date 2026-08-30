// app/admin/dashboard/loading.tsx
/**
 * app/admin/dashboard/loading.tsx
 * ---------------------------------------------------------------------------
 * Next.js special file: automatically wraps every route under
 * app/admin/dashboard/** in a <Suspense> boundary with this as the fallback.
 *
 * Why this matters here specifically: every admin route is `export const
 * dynamic = "force-dynamic"` (required — they're auth-gated and show live
 * data), so none of them can serve a cached/static shell. Without this file,
 * clicking a sidebar link left the browser on a blank page for however long
 * the Supabase auth check + data query took. With it, Next paints this
 * skeleton immediately on navigation and swaps in the real page the moment
 * its data resolves — the perceived "click -> something happens" latency
 * drops to ~0 even though the actual data round trip is unchanged.
 *
 * Intentionally generic (mirrors the common KPI-tiles-then-table shape of
 * all three routes) rather than one skeleton per route, since a rough match
 * that appears instantly beats a pixel-perfect one that's late.
 * ---------------------------------------------------------------------------
 */
export default function AdminDashboardLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-3 w-40 rounded bg-stone-200" />
      <div className="mt-3 flex items-end justify-between gap-4 border-b border-stone-300 pb-7">
        <div>
          <div className="h-8 w-56 rounded bg-stone-200" />
          <div className="mt-3 h-3 w-72 rounded bg-stone-100" />
        </div>
        <div className="h-3 w-40 rounded bg-stone-100" />
      </div>

      <div className="mt-8 grid gap-px border border-stone-200 bg-stone-200 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-white p-6">
            <div className="h-3 w-24 rounded bg-stone-200" />
            <div className="mt-3 h-8 w-20 rounded bg-stone-200" />
          </div>
        ))}
      </div>

      <div className="mt-10 h-64 rounded-xl border border-stone-200 bg-white p-6">
        <div className="h-4 w-32 rounded bg-stone-200" />
        <div className="mt-6 flex h-40 items-end gap-3">
          {[40, 65, 30, 80, 50, 70].map((h, i) => (
            <div key={i} className="w-8 rounded-t bg-stone-100" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}