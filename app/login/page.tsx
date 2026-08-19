"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, Mail } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function login(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("Login submission started", { email });

      // Log right before calling Supabase to ensure the call is attempted
      console.log("Calling supabase.auth.signInWithPassword");
      const result = await supabase.auth.signInWithPassword({ email, password });
      console.log("Supabase signInWithPassword result:", result);

      // result may contain error or data depending on Supabase SDK version
      const authError = (result as any)?.error ?? null;

      if (authError) {
        console.error("Auth error:", authError);
        setError(authError.message || "Failed to sign in");
        return;
      }

      // Successful sign-in: navigate to dashboard
      router.push("/admin/dashboard");
    } catch (err: any) {
      console.error("Unexpected error during login:", err);
      setError(err?.message ?? "Unexpected error occurred");
    } finally {
      // Always clear loading so the UI doesn't get stuck
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-[calc(100vh-4rem)] place-items-center px-4">
      <section className="w-full max-w-md border border-stone-200 bg-white p-7 sm:p-9">
        <div className="flex h-10 w-10 items-center justify-center bg-[#e9eee9] text-[#285943]">
          <LockKeyhole size={19} />
        </div>

        <p className="eyebrow mt-6">Restricted area</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-.055em]">Admin sign in</h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">Use your store administrator credentials to continue.</p>

        <form onSubmit={login} className="mt-7 space-y-5">
          <label className="block">
            <span className="field-label">Email address</span>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 z-10 pointer-events-none" size={16} />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="field pl-10"
                aria-label="Email address"
              />
            </div>
          </label>

          <label className="block">
            <span className="field-label">Password</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="field"
              aria-label="Password"
            />
          </label>

          {error && <p role="alert" className="bg-red-50 p-3 text-sm text-red-800">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="w-full bg-[#285943] py-3.5 text-sm font-semibold text-white hover:bg-[#1d4534] disabled:bg-stone-300"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}
