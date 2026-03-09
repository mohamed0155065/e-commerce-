"use client";
import { useEffect } from "react";
import confetti from "canvas-confetti";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function SuccessPage() {
    useEffect(() => {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#7c3aed', '#c4b5fd'] });
    }, []);

    return (
        <div className="h-screen flex flex-col items-center justify-center text-center px-6">
            <div className="bg-violet-50 p-6 rounded-full mb-6 text-violet-600">
                <CheckCircle2 size={80} />
            </div>
            <h1 className="text-4xl font-black mb-4">Order Confirmed!</h1>
            <p className="text-slate-500 mb-8 max-w-sm">Your items are being prepared. We'll send you an email soon.</p>
            <Link href="/" className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold shadow-xl">Back to Store</Link>
        </div>
    );
}