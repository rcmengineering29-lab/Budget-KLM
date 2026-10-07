"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { BarChart3, Database, History, LayoutDashboard, Menu, Moon, Settings, Sun, Upload, X } from "lucide-react";

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

export default function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
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
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="sticky top-0 hidden h-screen border-r border-line bg-panel lg:block">
        <div className="px-6 py-5 text-xl font-bold tracking-tight">Budget KLM</div>
        {nav}
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-line bg-panel/90 px-4 py-2 backdrop-blur lg:px-8">
          <button onClick={() => setOpen(true)} aria-label="Buka menu" className="grid h-11 w-11 place-items-center rounded-lg border border-line lg:hidden">
            <Menu size={20} />
          </button>
          <span className="font-bold lg:hidden">Budget KLM</span>
          <div className="ml-auto"><ThemeToggle /></div>
        </header>
        <main className="p-4 lg:p-8">{children}</main>
      </div>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64 bg-panel shadow-xl">
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
