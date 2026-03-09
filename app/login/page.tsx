"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2 } from "lucide-react";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            alert(error.message);
            setLoading(false);
        } else {
            router.push("/admin/dashboard"); // توجيه بعد تسجيل الدخول
        }
    };

    return (
        <main className="h-screen flex items-center justify-center bg-slate-50 px-6">
            <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100">
                <div className="text-center mb-10">
                    <div className="inline-flex p-4 bg-indigo-50 rounded-2xl text-indigo-600 mb-4">
                        <Lock size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
                        Admin <span className="text-indigo-600">Login</span>
                    </h1>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">
                        SwiftCart Control Panel
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                        <input
                            required
                            type="email"
                            placeholder="Admin Email"
                            className="w-full pl-12 pr-4 py-4  text-taupe-950 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-medium"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                        <input
                            required
                            type="password"
                            placeholder="Password"
                            className="w-full pl-12 pr-4 py-4  text-taupe-950 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-medium"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        disabled={loading}
                        className="w-full py-5 bg-slate-950  text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95 disabled:bg-slate-200 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "Sign In to Dashboard"}
                    </button>
                </form>
            </div>
        </main>
    );
}