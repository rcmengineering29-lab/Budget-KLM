"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useQueryClient } from "@tanstack/react-query";
import { BarChart3, ChevronDown, Database, History, LayoutDashboard, LogOut, Menu, Moon, Settings, Sun, Upload, X } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth-provider";
import { useCurrency } from "@/components/currency-provider";
import CurrencyPanel from "@/components/currency-panel";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/upload", label: "Upload Excel", icon: Upload },
  { href: "/history", label: "Riwayat Upload", icon: History },
  { href: "/analytics", label: "Analitik", icon: BarChart3 },
  { href: "/master", label: "Master Data", icon: Database },
  { href: "/settings", label: "Pengaturan", icon: Settings },
];

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  return (
    <button
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={dark ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
      className="grid h-11 w-11 place-items-center rounded-lg border border-line bg-panel hover:bg-line/40"
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

export function CurrencyMenu() {
  const { currency, mode } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Pengaturan mata uang"
        className="flex h-11 items-center gap-1.5 rounded-lg border border-line bg-panel px-3 text-sm font-medium"
      >
        {currency}
        {mode === "manual" && currency !== "USD" && <span className="text-xs text-mute">manual</span>}
        <ChevronDown size={14} />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-line bg-panel p-4 shadow-xl">
          <CurrencyPanel onDone={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}

export default function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const qc = useQueryClient();
  const { session, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const isLogin = path === "/login";

  useEffect(() => {
    if (loading) return;
    if (!session && !isLogin) router.replace("/login");
    if (session && isLogin) router.replace("/dashboard");
  }, [loading, session, isLogin, router]);

  async function logout() {
    await supabase.auth.signOut();
    qc.clear();
    router.replace("/login");
  }

  if (isLogin) return <>{children}</>;
  if (loading || !session) return <div className="grid min-h-screen place-items-center text-sm text-mute">Memuat…</div>;

  const nav = (
    <>
      <nav className="flex flex-col gap-1 p-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = path === href || (href === "/dashboard" && path === "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`flex min-h-[44px] items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${
                active ? "bg-brand text-white dark:text-bg" : "text-mute hover:bg-line/50 hover:text-ink"
              }`}
            >
              <Icon size={18} /> {label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-line p-3">
        <p className="truncate px-1 pb-2 text-xs text-mute">{session.user.email}</p>
        <button onClick={logout} className="flex min-h-[44px] w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-mute hover:bg-line/50 hover:text-ink">
          <LogOut size={18} /> Keluar
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-line bg-panel lg:flex">
        <div className="px-6 py-5 text-xl font-bold tracking-tight">Budget KLM</div>
        {nav}
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-line bg-panel/90 px-4 py-2 backdrop-blur lg:px-8">
          <button onClick={() => setOpen(true)} aria-label="Buka menu" className="grid h-11 w-11 place-items-center rounded-lg border border-line lg:hidden">
            <Menu size={20} />
          </button>
          <span className="font-bold lg:hidden">Budget KLM</span>
          <div className="ml-auto flex items-center gap-2"><CurrencyMenu /><ThemeToggle /></div>
        </header>
        <main className="p-4 lg:p-8">{children}</main>
      </div>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-64 flex-col bg-panel shadow-xl">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-lg font-bold">Budget KLM</span>
              <button onClick={() => setOpen(false)} aria-label="Tutup menu" className="grid h-11 w-11 place-items-center"><X size={20} /></button>
            </div>
            {nav}
          </div>
        </div>
      )}
    </div>
  );
}
