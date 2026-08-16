"use client";
import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Product } from "@/types";
import { useCartStore } from "@/store/useCartStore";

export const ProductCard = ({ product }: { product: Product }) => {
  const addItem = useCartStore((state) => state.addItem);
  return <article className="group min-w-0"><Link href={`/product/${product.id}`} className="block overflow-hidden bg-white" aria-label={`View ${product.Name}`}><div className="relative aspect-square border border-stone-200 bg-[#f2f3ef]"><Image src={product.Image} alt={product.Name} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" className="object-contain p-5 transition duration-500 group-hover:scale-105" /></div></Link><div className="pt-3"><p className="truncate text-xs text-stone-500">{product.Category || "Selected goods"}</p><h3 className="mt-1 truncate text-sm font-semibold text-stone-900">{product.Name}</h3><div className="mt-3 flex items-center justify-between gap-3"><p className="text-base font-semibold tracking-[-.03em]">${product.Price.toLocaleString()}</p><button onClick={() => addItem(product)} className="grid h-8 w-8 place-items-center border border-stone-300 bg-white text-stone-800 transition hover:border-[#285943] hover:bg-[#285943] hover:text-white" aria-label={`Add ${product.Name} to cart`}><Plus size={16}/></button></div></div></article>;
};
