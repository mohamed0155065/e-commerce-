"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

export function SearchBar() {
    // Next.js router for navigation
    const { replace } = useRouter();

    // Get the current URL search params
    const searchParams = useSearchParams();

    // Debounced search handler: updates URL after 300ms of inactivity
    const handleSearch = useDebouncedCallback((term: string) => {
        // Clone current search params
        const params = new URLSearchParams(searchParams.toString());

        if (term) {
            // If there is a search term, set it in URL as 'query'
            params.set("query", term);
        } else {
            // Remove 'query' if search term is empty
            params.delete("query");
        }

        // Replace the current URL with new search params without refreshing page
        replace(`/?${params.toString()}`);
    }, 300);

    return (
        <div className="relative w-full max-w-lg">
            {/* Search icon inside input field */}
            <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 
                           text-slate-400 transition-colors 
                           group-focus-within:text-indigo-600"
            />

            {/* Search input field */}
            <input
                type="search"
                placeholder="Search products"
                // Pre-fill input with current query from URL
                defaultValue={searchParams.get("query") ?? ""}
                // Trigger debounced search on input change
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