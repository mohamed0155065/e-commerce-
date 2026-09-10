"use client";
import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

export const SearchBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams);
    value ? params.set("query", value) : params.delete("query");
    router.replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <label className="relative block w-full">
      <span className="sr-only">Search products</span>
      <input
        type="search"
        defaultValue={searchParams.get("query") ?? ""}
        onChange={(event) => search(event.target.value)}
        placeholder="Search laptops, phones, accessories..."
        className="w-full rounded-md border border-stone-300 bg-white py-2.5 pl-4 pr-11 text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#14532d] focus:outline-none focus:ring-2 focus:ring-[#c7dccd]"
      />
      <Search
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500"
        size={17}
      />
    </label>
  );
};