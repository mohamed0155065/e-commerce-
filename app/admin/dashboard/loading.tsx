/**
 * Next.js automatically uses this component as the Suspense fallback while
 * the protected dashboard route resolves.
 *
 * This is not merely cosmetic:
 * immediate visual feedback prevents the navigation from feeling blocked by
 * authentication/database latency.
 *
 * The skeleton intentionally approximates the final layout rather than
 * reproducing every pixel. Skeletons should preserve geometry, not become
 * another expensive UI system.
 */
export default function AdminDashboardLoading() {
  return (
    <div
      className="space-y-8 pb-10 animate-pulse"
      aria-label="Loading dashboard"
      aria-busy="true"
    >
      {/* Header */}
      <div className="border-b border-stone-200 pb-7">
        <div className="h-3 w-44 rounded bg-stone-200" />

        <div className="mt-3 h-9 w-64 rounded bg-stone-200" />

        <div className="mt-3 h-4 w-96 max-w-full rounded bg-stone-100" />
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-stone-200 bg-white p-5"
          >
            <div className="h-4 w-24 rounded bg-stone-100" />

            <div className="mt-3 h-9 w-28 rounded bg-stone-200" />

            <div className="mt-2 h-3 w-32 rounded bg-stone-100" />
          </div>
        ))}
      </div>

      {/* Analytics */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,.8fr)]">
        <div className="h-[360px] rounded-2xl border border-stone-200 bg-white p-5">
          <div className="h-4 w-32 rounded bg-stone-200" />

          <div className="mt-2 h-3 w-52 rounded bg-stone-100" />

          <div className="mt-8 h-64 rounded-xl bg-stone-50" />
        </div>

        <div className="h-[360px] rounded-2xl border border-stone-200 bg-white p-5">
          <div className="h-4 w-28 rounded bg-stone-200" />

          <div className="mt-2 h-3 w-44 rounded bg-stone-100" />

          <div className="mt-8 space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-14 rounded-xl bg-stone-50"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="h-40 rounded-2xl border border-stone-200 bg-white p-5">
        <div className="h-4 w-28 rounded bg-stone-200" />

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-20 rounded-xl bg-stone-50"
            />
          ))}
        </div>
      </div>
    </div>
  );
}