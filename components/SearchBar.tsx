"use client";
import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

export const SearchBar = () => { const router = useRouter(); const pathname = usePathname(); const searchParams = useSearchParams(); const search = useDebouncedCallback((value: string) => { const params = new URLSearchParams(searchParams); value ? params.set("query", value) : params.delete("query"); router.replace(`${pathname}?${params.toString()}`); }, 300);
return <label className="relative block"><span className="sr-only">Search products</span><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" size={17}/><input type="search" defaultValue={searchParams.get("query") ?? ""} onChange={(event) => search(event.target.value)} placeholder="Search the collection" className="w-full border border-stone-300 bg-white py-3 pl-11 pr-4 text-sm text-stone-900 placeholder:text-stone-500 shadow-sm focus:border-[#285943] focus:outline-none focus:ring-2 focus:ring-[#b7d5c1]" /></label>; };
