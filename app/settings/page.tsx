"use client";
import { useTheme } from "next-themes";
import { CURRENCIES, useCurrency } from "@/components/currency-provider";

const OPTS = [{ v: "light", l: "Terang" }, { v: "dark", l: "Gelap" }, { v: "system", l: "Ikuti perangkat" }];
const pick = (on: boolean) => `min-h-[44px] rounded-lg border px-4 text-sm ${on ? "border-brand bg-brand text-white dark:text-bg" : "border-line"}`;

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { currency, setCurrency, rate, live, updated } = useCurrency();
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Pengaturan</h1>
      <div className="rounded-xl border border-line bg-panel p-4">
        <p className="mb-3 font-medium">Tampilan</p>
        <div className="flex flex-wrap gap-2">
          {OPTS.map((o) => <button key={o.v} onClick={() => setTheme(o.v)} className={pick(theme === o.v)}>{o.l}</button>)}
        </div>
      </div>
      <div className="rounded-xl border border-line bg-panel p-4">
        <p className="mb-1 font-medium">Mata uang tampilan</p>
        <p className="mb-3 text-sm text-mute">Data tersimpan dalam USD. Pilihan ini hanya mengubah tampilan.</p>
        <div className="flex flex-wrap gap-2">
          {CURRENCIES.map((c) => <button key={c} onClick={() => setCurrency(c)} className={pick(currency === c)}>{c}</button>)}
        </div>
        <p className="mt-3 text-sm text-mute">
          1 USD = {rate.toLocaleString("en-US", { maximumFractionDigits: 4 })} {currency} ·{" "}
          {live ? `kurs live, diperbarui ${new Date(updated!).toLocaleString("id-ID")}` : "kurs perkiraan (kurs live belum termuat)"}
        </p>
      </div>
    </div>
  );
}
