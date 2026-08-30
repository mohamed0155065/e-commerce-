
import type { ReactNode } from "react";

export default function AdminPageHeader({
  eyebrow = "WELCOME BACK",
  title,
  description,
  rightSlot,
}: {
  eyebrow?: string;
  title: string;
  description: string;

  /**
   * Optional page-specific action rendered on the right side of the header.
   *
   * Keeping this generic allows the header to be reused across
   * different admin routes without coupling it to page-specific UI.
   */
  rightSlot?: ReactNode;
}) {
  return (
    <header>
      {/* ------------------------------------------------------------------ */}
      {/* Eyebrow                                                             */}
      {/* ------------------------------------------------------------------ */}

      <p
        className="
          flex items-center gap-1.5
          text-xs font-semibold
          uppercase tracking-wide
          text-primary
        "
      >
        {eyebrow}
      </p>

      {/* ------------------------------------------------------------------ */}
      {/* Main header                                                         */}
      {/* ------------------------------------------------------------------ */}

      <div
        className="
          mt-2
          flex flex-col gap-4
          border-b border-stone-300
          pb-7
          sm:flex-row
          sm:items-end
          sm:justify-between
        "
      >
        <div>
          <h1
            className="
              text-[32px]
              font-semibold
              leading-tight
              tracking-[-0.055em]
              text-stone-950
            "
          >
            {title}
          </h1>

          <p className="mt-2 text-sm text-stone-600">
            {description}
          </p>
        </div>

        {rightSlot && (
          <div className="shrink-0">
            {rightSlot}
          </div>
        )}
      </div>
    </header>
  );
}

