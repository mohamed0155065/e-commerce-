"use client";
import { Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

export const SearchBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("nav");
  const search = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("query", value);
    } else {
      params.delete("query");
    }
    router.replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <label className="relative block w-full">
      <span className="sr-only">{t("searchLabel")}</span>
      <input
        type="search"
        defaultValue={searchParams.get("query") ?? ""}
        onChange={(event) => search(event.target.value)}
        placeholder={t("searchPlaceholder")}
        className="w-full rounded-md border border-stone-300 bg-white py-2.5 ps-4 pe-11 text-start text-sm text-stone-900 placeholder:text-stone-400 focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
      />
      <Search
        className="pointer-events-none absolute end-3.5 top-1/2 -translate-y-1/2 text-stone-500"
        size={17}
      />
    </label>
  );
};