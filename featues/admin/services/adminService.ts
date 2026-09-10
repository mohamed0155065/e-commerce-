import { supabaseServer } from "@/lib/supabaseServer";

export const adminService = {
    async requireAdmin() {
        const supabase = await supabaseServer();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            throw new Error("Authentication required");
        }

        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (profileError || profile?.role !== "admin") {
            throw new Error("Admin privileges required");
        }

        return user;
    },
};