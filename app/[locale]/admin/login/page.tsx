"use client";

import { Suspense, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/shared/ui/LocaleSwitcher";
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
    const t = useTranslations("admin");
    const auth = useTranslations("auth");
    const footer = useTranslations("footer");
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

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setErrorMessage(t("loginError"));
            setLoading(false);
            return;
        }

        router.push("/admin/dashboard");
        router.refresh();
    };

    return (
        <main className="relative flex min-h-screen flex-col lg:flex-row">
            <div className="absolute end-4 top-4 z-10">
                <Suspense fallback={<span className="inline-block h-10 w-28" />}>
                    <LocaleSwitcher />
                </Suspense>
            </div>
            {/* ------------------------------------------------------------------ */}
            {/* Left brand panel — hidden on mobile/tablet, shown from `lg` up.    */}
            {/* Mirrors AdminSidebar's gradient so the login screen and the        */}
            {/* authenticated shell feel like the same product.                    */}
            {/* ------------------------------------------------------------------ */}
            <div className="relative hidden w-[42%] shrink-0 flex-col justify-between bg-gradient-to-b from-[#09090B] to-[var(--surface)] p-12 text-white lg:flex">
                <div className="flex items-center gap-3">
                    <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-[var(--brand)]">
                        <ShoppingBag size={20} strokeWidth={2} aria-hidden="true" />
                    </div>
                    <div>
                        <p className="text-sm font-bold tracking-tight">{t("title")}</p>
                        <p className="text-xs text-">{t("storeManagement")}</p>
                    </div>
                </div>

                <div className="max-w-sm">
                    <h2 className="text-3xl font-semibold leading-tight tracking-tight">
                        {t("brandHeadline")}
                    </h2>
                    <p className="mt-4 text-sm font-bold leading-relaxed text-blue-500">
                        {t("brandDescription")}
                    </p>
                </div>

                <p className="text-xs font-bold text-blue-500">
                    © {new Date().getFullYear()} Marketly. {footer("allRights")}
                </p>
            </div>

            {/* ------------------------------------------------------------------ */}
            {/* Right / mobile panel — the actual login card.                      */}
            {/* ------------------------------------------------------------------ */}
            <div className="flex min-h-screen flex-1 items-center justify-center bg-[var(--canvas)] px-4 py-10 sm:px-6 lg:min-h-0">
                <div className="w-full max-w-sm">
                    {/* Mobile-only brand mark (the left panel covers this on lg+) */}
                    <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
                        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--brand)] text-white">
                            <ShoppingBag size={20} strokeWidth={2} aria-hidden="true" />
                        </div>
                        <div>
                            <p className="text-sm font-bold tracking-tight text-stone-900">
                                {t("title")}
                            </p>
                            <p className="text-xs text-stone-500">{t("storeManagement")}</p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-[0_8px_30px_rgb(28_29_26/0.06)] sm:p-8">
                        <div className="mb-7">
                            <div className="mb-4 grid size-11 place-items-center rounded-xl bg-emerald-50 text-[var(--brand)]">
                                <Lock size={20} strokeWidth={2} aria-hidden="true" />
                            </div>

                            <h1 className="text-2xl font-semibold tracking-tight text-stone-950">
                                {t("signInTitle")}
                            </h1>
                            <p className="mt-1.5 text-sm text-stone-500">
                                {t("signInDescription")}
                            </p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4" noValidate>
                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="admin-email"
                                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500"
                                >
                                    {auth("email")}
                                </label>
                                <div className="relative">
                                    <Mail
                                        size={16}
                                        className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                                        aria-hidden="true"
                                    />
                                    <input
                                        id="admin-email"
                                        required
                                        type="email"
                                        autoComplete="email"
                                        placeholder={t("emailPlaceholder")}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full rounded-xl border border-stone-200 bg-stone-50 py-3 ps-10 pe-3 text-start text-sm text-stone-900 outline-none transition-all placeholder:text-stone-400 focus:border-[var(--brand)]  focus:ring-2 focus:ring-[var(--brand)]/20"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label
                                    htmlFor="admin-password"
                                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500"
                                >
                                    {auth("password")}
                                </label>
                                <div className="relative">
                                    <Lock
                                        size={16}
                                        className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-stone-400"
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
                                        className="w-full rounded-xl border border-stone-200 bg-stone-50 py-3 ps-10 pe-10 text-start text-sm text-stone-900 outline-none transition-all placeholder:text-stone-400 focus:border-[var(--brand)]  focus:ring-2 focus:ring-[var(--brand)]/20"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        aria-label={showPassword ? auth("hidePassword") : auth("showPassword")}
                                        className="absolute end-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
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
                                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-[var(--brand-hover)] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={16} />
                                        {auth("signingIn")}
                                    </>
                                ) : (
                                    auth("signInButton")
                                )}
                            </button>
                        </form>
                    </div>

                    <p className="mt-6 text-center text-xs text-stone-400 lg:hidden">
                        © {new Date().getFullYear()} Marketly. {footer("allRights")}
                    </p>
                </div>
            </div>
        </main>
    );
}