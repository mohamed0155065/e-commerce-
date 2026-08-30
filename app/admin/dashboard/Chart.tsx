"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type SalesPoint = {
  name: string;
  amount: number;
};

/**
 * Compact, locale-aware number formatting for axis ticks (1200 -> "1.2K").
 * Prevents wide 4-5 digit labels from forcing the Y-axis column wider than
 * its allotted width, which is what was clipping the numbers before.
 */
const compactFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function formatTick(value: number) {
  return compactFormatter.format(value);
}

/**
 * Recharts requires a client boundary, so only this leaf component becomes
 * client-side.
 *
 * The parent dashboard remains a Server Component and sends an already
 * aggregated, bounded dataset.
 */
export default function SalesChart({
  data,
}: {
  data: SalesPoint[];
}) {
  const maxValue = Math.max(
    ...data.map((item) => Number(item.amount) || 0),
    0
  );

  return (
    <section className="min-w-0 rounded-2xl border border-stone-200 bg-white p-4 sm:p-5 shadow-[0_8px_30px_rgb(28_29_26/0.04)]">
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                             */}
      {/* Wraps to a second row on narrow screens instead of squeezing the   */}
      {/* "Last 7 days" pill against the title.                              */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#285943]">
            Performance
          </p>

          <h2 className="mt-1.5 text-lg sm:text-xl font-semibold tracking-tight text-stone-950">
            Sales performance
          </h2>

          <p className="mt-1 text-sm text-stone-500">
            Revenue across the latest 7 days.
          </p>
        </div>

        <span className="inline-flex w-fit items-center rounded-lg bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-600 ring-1 ring-inset ring-stone-200">
          Last 7 days
        </span>
      </div>

      <div className="mt-6 h-[240px] sm:h-[280px] w-full">
        {data.length > 0 ? (
          <ResponsiveContainer
            width="100%"
            height="100%"
            debounce={80}
          >
            <BarChart
              data={data}
              margin={{
                top: 12,
                right: 8,
                left: 4,
                bottom: 0,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--line-soft)"
              />

              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#8a8d86",
                  fontSize: 11,
                }}
                dy={9}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#8a8d86",
                  fontSize: 11,
                }}
                width={56}
                tickFormatter={formatTick}
                domain={[0, Math.max(maxValue, 100)]}
              />

              <Tooltip
                cursor={{
                  fill: "#f5f6f2",
                }}
                formatter={(value) => [
                  `$${Number(value).toLocaleString()}`,
                  "Revenue",
                ]}
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid #e5e7e2",
                  boxShadow:
                    "0 12px 30px rgb(28 29 26 / 0.08)",
                }}
              />

              <Bar
                dataKey="amount"
                fill="var(--brand)"
                radius={[6, 6, 2, 2]}
                barSize={28}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="grid h-full place-items-center rounded-xl bg-stone-50 text-sm text-stone-500">
            No sales data yet.
          </div>
        )}
      </div>
    </section>
  );
}