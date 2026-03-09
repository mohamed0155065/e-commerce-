"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

export function SearchBar() {
    const { replace } = useRouter();
    const searchParams = useSearchParams();

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams.toString());

        if (term) {
            params.set("query", term);
        } else {
            params.delete("query");
        }

        replace(`/?${params.toString()}`);
    }, 300);

    return (
        <div className="relative w-full max-w-lg">
            {/* Icon */}
            <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-600"
            />

            {/* Input */}
            <input
                type="search"
                placeholder="Search products"
                defaultValue={searchParams.get("query") ?? ""}
                onChange={(e) => handleSearch(e.target.value)}
                className="
          peer w-full rounded-2xl bg-white px-11 py-3 text-sm
          text-slate-900 placeholder:text-slate-400
          shadow-sm ring-1 ring-slate-200
          transition-all duration-200
          focus:ring-2 focus:ring-indigo-600 focus:shadow-md
          hover:ring-slate-300
        "
            />
        </div>
    );
}