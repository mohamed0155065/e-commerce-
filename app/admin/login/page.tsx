"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Lock, Loader2, ShoppingBag, Mail, Eye, EyeOff } from "lucide-react";

/**
 * Admin login screen.
 *
 * Restyled to match the rest of the admin surface (dark emerald gradient,
 * same palette as AdminSidebar) instead of the previous indigo/slate theme,
 * which visually belonged to a different product. Fully responsive:
 * a two-pane layout on large screens, a single centered card on mobile.
 */
export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);
        setLoading(true);

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setErrorMessage("Invalid email or password.");
            setLoading(false);
            return;
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", data.user.id)
            .single();

        if (profile?.role !== "admin") {
            await supabase.auth.signOut();
            setErrorMessage("This account is not authorized to access the admin panel.");
            setLoading(false);
            return;
        }

        router.push("/admin/dashboard");
    };

    return (
        <main className="flex min-h-screen flex-col lg:flex-row">
            {/* ------------------------------------------------------------------ */}
            {/* Left brand panel — hidden on mobile/tablet, shown from `lg` up.    */}
            {/* Mirrors AdminSidebar's gradient so the login screen and the        */}
            {/* authenticated shell feel like the same product.                    */}
            {/* ------------------------------------------------------------------ */}
            <div className="relative hidden w-[42%] shrink-0 flex-col justify-between bg-gradient-to-b from-[#0d3d21] to-[#123a28] p-12 text-white lg:flex">
                <div className="flex items-center gap-3">
                    <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-[#14532d]">
                        <ShoppingBag size={20} strokeWidth={2} aria-hidden="true" />
                    </div>
                    <div>
                        <p className="text-sm font-bold tracking-tight">Marketly Admin</p>
                        <p className="text-xs text-emerald-100/60">Store management</p>
                    </div>
                </div>

                <div className="max-w-sm">
                    <h2 className="text-3xl font-semibold leading-tight tracking-tight">
                        Everything about your store, in one place.
                    </h2>
                    <p className="mt-4 text-sm leading-relaxed text-emerald-100/70">
                        Track revenue, manage orders, and keep your catalog up to date —
                        all from a single dashboard.
                    </p>
                </div>

                <p className="text-xs text-emerald-100/50">
                    © {new Date().getFullYear()} Marketly. All rights reserved.
                </p>
            </div>

            {/* ------------------------------------------------------------------ */}
            {/* Right / mobile panel — the actual login card.                      */}
            {/* ------------------------------------------------------------------ */}
            <div className="flex min-h-screen flex-1 items-center justify-center bg-[#f7f7f4] px-4 py-10 sm:px-6 lg:min-h-0">
                <div className="w-full max-w-sm">
                    {/* Mobile-only brand mark (the left panel covers this on lg+) */}
                    <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
                        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#14532d] text-white">
                            <ShoppingBag size={20} strokeWidth={2} aria-hidden="true" />
                        </div>
                        <div>
                            <p className="text-sm font-bold tracking-tight text-stone-900">
                                Marketly Admin
                            </p>
                            <p className="text-xs text-stone-500">Store management</p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-[0_8px_30px_rgb(28_29_26/0.06)] sm:p-8">
                        <div className="mb-7">
                            <div className="mb-4 grid size-11 place-items-center rounded-xl bg-emerald-50 text-[#285943]">
                                <Lock size={20} strokeWidth={2} aria-hidden="true" />
                            </div>

                            <h1 className="text-2xl font-semibold tracking-tight text-stone-950">
                                Sign in to your dashboard
                            </h1>
                            <p className="mt-1.5 text-sm text-stone-500">
                                Enter your admin credentials to continue.
                            </p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4" noValidate>
                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="admin-email"
                                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500"
                                >
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail
                                        size={16}
                                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                                        aria-hidden="true"
                                    />
                                    <input
                                        id="admin-email"
                                        required
                                        type="email"
                                        autoComplete="email"
                                        placeholder="you@marketly.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full rounded-xl border border-stone-200 bg-stone-50 py-3 pl-10 pr-3 text-sm text-stone-900 outline-none transition-all placeholder:text-stone-400 focus:border-[#285943] focus:bg-white focus:ring-2 focus:ring-[#285943]/20"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label
                                    htmlFor="admin-password"
                                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500"
                                >
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock
                                        size={16}
                                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                                        aria-hidden="true"
                                    />
                                    <input
                                        id="admin-password"
                                        required
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full rounded-xl border border-stone-200 bg-stone-50 py-3 pl-10 pr-10 text-sm text-stone-900 outline-none transition-all placeholder:text-stone-400 focus:border-[#285943] focus:bg-white focus:ring-2 focus:ring-[#285943]/20"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* Error message — replaces the old blocking window.alert() so
                  the failure state is visible inline and doesn't interrupt
                  the flow with a native browser dialog. */}
                            {errorMessage && (
                                <p
                                    role="alert"
                                    className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700"
                                >
                                    {errorMessage}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#285943] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-[#214a38] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#285943] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={16} />
                                        Signing in…
                                    </>
                                ) : (
                                    "Sign in"
                                )}
                            </button>
                        </form>
                    </div>

                    <p className="mt-6 text-center text-xs text-stone-400 lg:hidden">
                        © {new Date().getFullYear()} Marketly. All rights reserved.
                    </p>
                </div>
            </div>
        </main>
    );
}