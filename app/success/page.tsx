"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

/**
 * SuccessPage component
 * - Displays order confirmation after checkout
 * - Triggers confetti animation on mount
 * - Provides a button to navigate back to the store
 */
export default function SuccessPage() {
    // Run confetti animation when the component mounts
    useEffect(() => {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#7c3aed', '#c4b5fd'], // Brand violet colors
        });
    }, []);

    return (
        <div className="h-screen flex flex-col items-center justify-center text-center px-6">

            {/* Success Icon */}
            <div className="bg-violet-50 p-6 rounded-full mb-6 text-violet-600">
                <CheckCircle2 size={80} />
            </div>

            {/* Heading */}
            <h1 className="text-4xl font-black mb-4">Order Confirmed!</h1>

            {/* Message */}
            <p className="text-slate-500 mb-8 max-w-sm">
                Your items are being prepared. We'll send you an email soon.
            </p>

            {/* Back to Store Button */}
            <Link
                href="/"
                className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold shadow-xl"
            >
                Back to Store
            </Link>
        </div>
    );
}