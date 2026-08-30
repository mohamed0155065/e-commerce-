
import type { ReactNode } from "react";

type AdminPageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  rightSlot?: ReactNode;
};

/**
 * Shared admin page header.
 *
 * Responsibilities:
 * - Establish page hierarchy.
 * - Provide consistent spacing across admin routes.
 * - Render optional page-specific actions.
 *
 * Visual tokens come from globals.css / Tailwind theme.
 * The component intentionally contains no hard-coded brand colors.
 */
export default function AdminPageHeader({
  eyebrow = "WELCOME BACK",
  title,
  description,
  rightSlot,
}: AdminPageHeaderProps) {
  return (
    <header className="w-full">
      {/* ------------------------------------------------------------------
          Eyebrow
      ------------------------------------------------------------------ */}

      <p
        className="
          text-[11px]
          font-bold
          uppercase
          tracking-[0.14em]
          text-primary
          sm:text-xs
        "
      >
        {eyebrow}
      </p>

      {/* ------------------------------------------------------------------
          Main header content

          Mobile:
          - Stacked layout
          - Full-width actions

          Desktop:
          - Content and actions sit beside each other
      ------------------------------------------------------------------ */}

      <div
        className="
          mt-2.5
          flex
          flex-col
          gap-4
          border-b
          border-line
          pb-6

          sm:mt-3
          sm:pb-7

          md:flex-row
          md:items-end
          md:justify-between
        "
      >
        <div className="min-w-0">
          <h1
            className="
              text-[26px]
              font-semibold
              leading-[1.15]
              tracking-[-0.035em]
              text-foreground

              sm:text-[30px]
              md:text-[32px]
            "
          >
            {title}
          </h1>

          <p
            className="
              mt-2
              max-w-2xl
              text-[13px]
              leading-5
              text-muted

              sm:text-sm
            "
          >
            {description}
          </p>
        </div>

        {rightSlot ? (
          <div
            className="
              w-full
              shrink-0

              md:w-auto
            "
          >
            {rightSlot}
          </div>
        ) : null}
      </div>
    </header>
  );
}

