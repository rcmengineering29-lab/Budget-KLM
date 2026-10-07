"use client";
import { useTheme } from "next-themes";
import CurrencyPanel from "@/components/currency-panel";

const OPTS = [{ v: "light", l: "Terang" }, { v: "dark", l: "Gelap" }, { v: "system", l: "Ikuti perangkat" }];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Pengaturan</h1>

      <div className="rounded-xl border border-line bg-panel p-4">
        <p className="mb-3 font-medium">Tampilan</p>
        <div className="flex flex-wrap gap-2">
          {OPTS.map((o) => (
            <button key={o.v} onClick={() => setTheme(o.v)} className={`min-h-[44px] rounded-lg border px-4 text-sm ${theme === o.v ? "border-brand bg-brand text-white dark:text-bg" : "border-line"}`}>{o.l}</button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-line bg-panel p-4">
        <p className="mb-1 font-medium">Mata uang tampilan</p>
        <p className="mb-3 text-sm text-mute">Data tersimpan dalam USD. Pilih mata uang, lalu pakai kurs otomatis atau isi kurs sendiri.</p>
        <CurrencyPanel />
      </div>
    </div>
  );
}
