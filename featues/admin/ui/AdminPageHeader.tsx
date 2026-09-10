import type { ReactNode } from "react";

type AdminPageHeaderProps = {
  title: string;
  description: string;
  rightSlot?: ReactNode;
};

/**
 * Shared admin page header.
 *
 * Renders the page title, a short supporting description, and an
 * optional page-specific action slot (e.g. a button in the top-right).
 *
 * Used identically by Overview, Orders, and Products so the three admin
 * routes share one visual rhythm — same title scale, same spacing above
 * the content, same divider. Any future admin page should reuse this
 * rather than hand-rolling its own header markup.
 *
 * Color tokens (stone-950 / stone-500 / stone-200) intentionally match
 * the palette already used by MetricCard / RecentOrders so this doesn't
 * look like it belongs to a different design system.
 */
export default function AdminPageHeader({
  title,
  description,
  rightSlot,
}: AdminPageHeaderProps) {
  return (
    <header
      className="
        flex
        flex-col
        gap-4
        border-b
        border-stone-200
        pb-6

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
            text-stone-950

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
            text-stone-500

            sm:text-sm
          "
        >
          {description}
        </p>
      </div>

      {rightSlot ? (
        <div className="w-full shrink-0 md:w-auto">{rightSlot}</div>
      ) : null}
    </header>
  );
}