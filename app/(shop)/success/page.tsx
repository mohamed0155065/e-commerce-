"use client";
import { useEffect } from "react";
import confetti from "canvas-confetti";
import Link from "next/link";
import { Check } from "lucide-react";
export default function SuccessPage() { useEffect(() => { confetti({ particleCount: 80, spread: 55, origin: { y: .55 }, colors: ["#285943", "#e6ad42", "#f7f7f4"] }); }, []); return <main className="page-shell grid min-h-[calc(100vh-4rem)] place-items-center text-center"><section className="max-w-md"><div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#e1eee5] text-[#23734d]"><Check size={28}/></div><p className="eyebrow mt-6">Order received</p><h1 className="mt-2 text-4xl font-semibold tracking-[-.06em]">Thank you.</h1><p className="mt-4 text-sm leading-6 text-stone-600">Your order is being prepared. We’ll be in touch with delivery updates shortly.</p><Link href="/" className="mt-8 inline-block bg-[#285943] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1d4534]">Return to shop</Link></section></main>; }
