"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return setError("Email atau password salah.");
    router.replace("/dashboard");
  }

  const field = "mt-1 min-h-[44px] w-full rounded-lg border border-line bg-bg px-3 text-sm text-ink";
  return (
    <div className="grid min-h-screen place-items-center p-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-xl border border-line bg-panel p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Budget KLM</h1>
          <p className="text-sm text-mute">Masuk untuk melihat dashboard.</p>
        </div>
        <label className="block text-xs text-mute">Email
          <input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
        </label>
        <label className="block text-xs text-mute">Password
          <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={field} />
        </label>
        {error && <p className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm">{error}</p>}
        <button disabled={busy} className="min-h-[44px] w-full rounded-lg bg-brand text-sm font-semibold text-white disabled:opacity-50 dark:text-bg">
          {busy ? "Masuk…" : "Masuk"}
        </button>
        <p className="text-xs text-mute">Akun dibuat oleh admin. Hubungi admin jika belum punya akses.</p>
      </form>
    </div>
  );
}
