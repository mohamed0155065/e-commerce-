"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
    const router = useRouter();

    const logout = async () => {
        await supabase.auth.signOut();

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