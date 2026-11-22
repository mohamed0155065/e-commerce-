"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

/**
 * LogoutButton component
 * - Signs the user out from Supabase
 * - Redirects to the admin login page
 * - Refreshes the router to clear any cached data
 */
export default function LogoutButton() {
    const router = useRouter();
    const t = useTranslations("admin");
    const [isSigningOut, setIsSigningOut] = useState(false);

    const logout = async () => {
        setIsSigningOut(true);
        // Sign the user out
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Admin sign out error:", error);
            setIsSigningOut(false);
            return;
        }

        // Redirect to login page and refresh router
        router.push("/admin/login");
        router.refresh();
    };

    return (
        <button
            onClick={logout}
            disabled={isSigningOut}
            className="bg-red-500 text-white px-4 py-2 rounded-xl disabled:opacity-60"
        >
            {isSigningOut ? t("signingOut") : t("logout")}
        </button>
    );
}
