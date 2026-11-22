"use client";
import { Suspense, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Loader2 } from "lucide-react";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

export default function UserLogin() {
    return (
        <Suspense fallback={<main className="h-screen bg-stone-50" />}>
            <UserLoginForm />
        </Suspense>
    );
}

function UserLoginForm() {
    const t = useTranslations("auth");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [oauthError, setOauthError] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");

        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setErrorMsg(t("invalidCredentials"));
            setLoading(false);
            return;
        }

        const destination = searchParams.get("redirect") ?? "/";
        router.push(destination.startsWith("/") && !destination.startsWith("//") ? destination : "/");
        router.refresh();
    };

    return (
        <main className="h-screen flex items-center justify-center bg-stone-50 px-6">
            <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-sm border border-stone-200">
                <h1 className="text-2xl font-semibold text-stone-900">{t("signInTitle")}</h1>
                <p className="mt-1 text-sm text-stone-500">{t("welcome")}</p>

                <form onSubmit={handleLogin} className="mt-6 space-y-4">
                    <input required type="email" placeholder={t("email")} aria-label={t("email")} className="w-full px-4 py-3 bg-stone-50 rounded-xl outline-none focus:ring-2 focus:ring-[var(--brand)]" onChange={(e) => setEmail(e.target.value)} />
                    <input required type="password" placeholder={t("password")} aria-label={t("password")} className="w-full px-4 py-3 bg-stone-50 rounded-xl outline-none focus:ring-2 focus:ring-[var(--brand)]" onChange={(e) => setPassword(e.target.value)} />

                    {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

                    <button disabled={loading} className="w-full py-3.5 bg-[var(--brand)] text-white rounded-xl font-semibold hover:bg-[var(--brand-hover)] disabled:bg-stone-300 flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="animate-spin" size={18} /> : t("signInButton")}
                    </button>
                </form>

                <div className="my-5 flex items-center gap-3 text-xs text-stone-400">
                    <span className="h-px flex-1 bg-stone-200" />
                    <span>{t("or")}</span>
                    <span className="h-px flex-1 bg-stone-200" />
                </div>

                <GoogleSignInButton onError={setOauthError} label={t("continueGoogle")} />
                {(oauthError || searchParams.has("error")) && (
                    <p role="alert" className="mt-3 text-sm text-red-600">
                        {oauthError || t("googleFailed")}
                    </p>
                )}

                <p className="mt-5 text-center text-sm text-stone-500">
                    {t("noAccount")} <Link href="/register" className="text-[var(--brand)] font-medium">{t("registerLink")}</Link>
                </p>
            </div>
        </main>
    );
}