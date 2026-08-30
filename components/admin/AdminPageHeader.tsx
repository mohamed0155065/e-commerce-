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
    <header>
      {/* Small section identifier from the original design */}
      <p className="eyebrow">
        Marketly administration
      </p>

      <div className="mt-2 flex flex-col gap-4 border-b border-stone-300 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[32px] font-semibold leading-tight tracking-[-0.055em] text-stone-950">
            {title}
          </h1>

          <p className="mt-2 text-sm text-stone-600">
            {description}
          </p>
        </div>

        {userEmail && (
          <p className="shrink-0 text-xs text-stone-500">
            Signed in as {userEmail}
          </p>
        )}
      </div>
    </header>
  );
}