"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

/**
 * LogoutButton component
 * - Signs the user out from Supabase
 * - Redirects to the admin login page
 * - Refreshes the router to clear any cached data
 */
export default function LogoutButton() {
    const router = useRouter();

    const logout = async () => {
        // Sign the user out
        await supabase.auth.signOut();

        // Redirect to login page and refresh router
        router.push("/admin/login");
        router.refresh();
    };

    return (
        <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded-xl"
        >
            Logout
        </button>
    );
}