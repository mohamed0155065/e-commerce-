"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function UserLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");

        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setErrorMsg("Invalid email or password.");
            setLoading(false);
            return;
        }

        router.push("/");
        router.refresh();
    };

    return (
        <main className="h-screen flex items-center justify-center bg-stone-50 px-6">
            <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-sm border border-stone-200">
                <h1 className="text-2xl font-semibold text-stone-900">Sign in</h1>
                <p className="mt-1 text-sm text-stone-500">Welcome back to Marketly.</p>

                <form onSubmit={handleLogin} className="mt-6 space-y-4">
                    <input required type="email" placeholder="Email" className="w-full px-4 py-3 bg-stone-50 rounded-xl outline-none focus:ring-2 focus:ring-[#14532d]" onChange={(e) => setEmail(e.target.value)} />
                    <input required type="password" placeholder="Password" className="w-full px-4 py-3 bg-stone-50 rounded-xl outline-none focus:ring-2 focus:ring-[#14532d]" onChange={(e) => setPassword(e.target.value)} />

                    {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

                    <button disabled={loading} className="w-full py-3.5 bg-[#14532d] text-white rounded-xl font-semibold hover:bg-[#0d3d21] disabled:bg-stone-300 flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="animate-spin" size={18} /> : "Sign in"}
                    </button>
                </form>

                <p className="mt-5 text-center text-sm text-stone-500">
                    Don't have an account? <Link href="/register" className="text-[#14532d] font-medium">Register</Link>
                </p>
            </div>
        </main>
    );
}