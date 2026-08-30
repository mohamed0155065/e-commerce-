// components/admin/AdminPageHeader.tsx
/**
 * components/admin/AdminPageHeader.tsx
 * ---------------------------------------------------------------------------
 * Small server component: the "MARKETLY ADMINISTRATION / <title> / signed in
 * as <email>" header block repeated (with a different title/description) at
 * the top of every route under app/admin/dashboard/*. Pulled out into its
 * own file purely to avoid copy-pasting this markup across page.tsx,
 * orders/page.tsx, and products/page.tsx now that each is its own route.
 * ---------------------------------------------------------------------------
 */
export default function AdminPageHeader({
  title,
  description,
  userEmail,
}: {
  title: string;
  description: string;
  userEmail?: string | null;
}) {
  return (
    <>
      <p className="eyebrow">Marketly administration</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4 border-b border-stone-300 pb-7">
        <div>
          <h1 className="text-3xl font-semibold tracking-[-.055em]">{title}</h1>
          <p className="mt-2 text-sm text-stone-600">{description}</p>
        </div>
        {userEmail && <p className="text-xs text-stone-500">Signed in as {userEmail}</p>}
      </div>
    </>
  );
}