"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Languages } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

export function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("nav");
  const query = searchParams.toString();

  const switchLocale = (nextLocale: Locale) => {
    if (nextLocale === locale) return;
    router.replace(`${pathname}${query ? `?${query}` : ""}`, {
      locale: nextLocale,
      scroll: false,
    });
  };

  return (
    <div
      role="group"
      aria-label={t("language")}
      className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-stone-200 bg-stone-50 p-1 shadow-sm"
    >
      <Languages className="mx-1 size-4 text-stone-500" aria-hidden="true" />
      <button
        type="button"
        onClick={() => switchLocale("en")}
        aria-label={t("english")}
        aria-pressed={locale === "en"}
        className={`min-h-8 rounded-full px-2.5 text-xs font-semibold transition-colors ${
          locale === "en"
            ? "bg-[var(--brand)] text-white shadow-sm"
            : "text-stone-500 hover:bg-stone-100 hover:text-stone-900"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => switchLocale("ar")}
        aria-label={t("arabic")}
        aria-pressed={locale === "ar"}
        className={`min-h-8 rounded-full px-2.5 text-xs font-semibold transition-colors ${
          locale === "ar"
            ? "bg-[var(--brand)] text-white shadow-sm"
            : "text-stone-500 hover:bg-stone-100 hover:text-stone-900"
        }`}
      >
        عربي
      </button>
    </div>
  );
}
