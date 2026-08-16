import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import { productService } from "@/services/productService";
import AddToCartButton from "@/components/AddToCartButton";
import { RelatedProducts } from "@/components/RelatedProducts";
import { Product } from "@/types";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await productService.getById(id);
  if (!product) notFound();

  const related: Product[] = product.Category
    ? (await productService.getAll()).filter((item) => item.Category === product.Category && item.id !== id).slice(0, 4)
    : [];

  return <div className="pb-20">
    <nav className="border-b border-stone-200 bg-white"><div className="page-shell flex h-12 items-center gap-2 text-xs text-stone-500"><Link href="/" className="hover:text-[#285943]">Shop</Link><ChevronRight size={14}/><span>{product.Category || product.Name}</span></div></nav>
    <section className="page-shell grid gap-9 py-10 lg:grid-cols-[1fr_.9fr] lg:py-16"><div className="relative aspect-square border border-stone-200 bg-white"><Image src={product.Image} alt={product.Name} fill priority sizes="(max-width: 1024px) 100vw, 58vw" className="object-contain p-8 lg:p-12"/></div><div className="flex flex-col justify-center">{product.Category && <p className="eyebrow">{product.Category}</p>}<h1 className={`${product.Category ? "mt-3" : ""} text-3xl font-semibold leading-tight tracking-[-.055em] text-stone-950 sm:text-5xl`}>{product.Name}</h1><p className="mt-5 max-w-xl text-sm leading-7 text-stone-600">{product.Description}</p><div className="mt-8 border-y border-stone-200 py-5"><p className="text-3xl font-semibold tracking-[-.05em]">${product.Price.toLocaleString()}</p></div><div className="mt-6 max-w-sm"><AddToCartButton product={product}/></div></div></section>
    {related.length > 0 && <section className="page-shell border-t border-stone-200 pt-12"><div className="mb-7 flex items-end justify-between"><div>{product.Category && <p className="eyebrow">More in {product.Category}</p>}<h2 className="mt-2 text-2xl font-semibold tracking-[-.045em]">You might also like</h2></div><Link href="/" className="text-sm font-semibold text-[#285943]">View all</Link></div><RelatedProducts products={related}/></section>}
  </div>;
}
