"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type GoogleSignInButtonProps = {
    onError: (message: string) => void;
    label?: string;
    errorReturnTo?: "/login" | "/register";
};

export default function GoogleSignInButton({
    onError,
    label = "Continue with Google",
    errorReturnTo = "/login",
}: GoogleSignInButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        setLoading(true);
        onError("");

        try {
            const redirectTo = new URL("/auth/callback", window.location.origin);
            const nextPath = new URLSearchParams(window.location.search).get("redirect") ?? "/";
            redirectTo.searchParams.set("next", nextPath);
            redirectTo.searchParams.set("errorReturnTo", errorReturnTo);

            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: { redirectTo: redirectTo.toString() },
            });

            if (error) {
                onError("Google sign-in could not be started. Please try again.");
                setLoading(false);
            }
        } catch {
            onError("Google sign-in could not be started. Please try again.");
            setLoading(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white py-3.5 font-semibold text-stone-800 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
            <svg aria-hidden="true" viewBox="0 0 48 48" className="size-5 shrink-0">
                <path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z" />
                <path fill="#34A853" d="M24 44c5.4 0 10-1.8 13.3-4.8l-6.6-5.1c-1.8 1.2-4 1.9-6.7 1.9-5.1 0-9.4-3.4-11-8l-6.8 5.2C9.5 39.7 16.2 44 24 44Z" />
                <path fill="#FBBC05" d="M13 28c-.5-1.2-.8-2.6-.8-4s.3-2.8.8-4l-6.8-5.2C4.8 17.7 4 20.8 4 24s.8 6.3 2.2 9.2L13 28Z" />
                <path fill="#EA4335" d="M24 12c3 0 5.7 1 7.8 3l5.8-5.8C34 5.7 29.4 4 24 4 16.2 4 9.5 8.3 6.2 14.8L13 20c1.6-4.6 5.9-8 11-8Z" />
            </svg>
            {loading ? "Connecting to Google..." : label}
        </button>
    );
}