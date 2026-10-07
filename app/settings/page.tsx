"use client";
import { useState } from "react";
import { useTheme } from "next-themes";
import { SUGGESTED, useCurrency } from "@/components/currency-provider";

const OPTS = [{ v: "light", l: "Terang" }, { v: "dark", l: "Gelap" }, { v: "system", l: "Ikuti perangkat" }];
const pick = (on: boolean) => `min-h-[44px] rounded-lg border px-4 text-sm ${on ? "border-brand bg-brand text-white dark:text-bg" : "border-line"}`;
const field = "mt-1 min-h-[44px] w-full rounded-lg border border-line bg-bg px-3 text-sm text-ink";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { currency, setCurrency, rate, live, updated, manual, clearManual, codes } = useCurrency();
  const [code, setCode] = useState("");
  const [rateText, setRateText] = useState("");
  const [msg, setMsg] = useState("");

  function apply() {
    const c = code.trim().toUpperCase();
    if (!/^[A-Z]{3}$/.test(c)) return setMsg("Kode harus 3 huruf, misalnya IDR.");
    const m = rateText.trim() ? Number(rateText.replace(",", ".")) : undefined;
    if (rateText.trim() && !(m! > 0)) return setMsg("Kurs manual harus berupa angka lebih dari 0.");
    if (!setCurrency(c, m)) return setMsg(`Kurs ${c} tidak ditemukan. Isi kurs manual: 1 USD = berapa ${c}.`);
    setMsg(`Tampilan diubah ke ${c}.`);
    setCode(""); setRateText("");
  }

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
        <p className="mb-3 text-sm text-mute">Data tersimpan dalam USD. Ketik kode mata uang apa pun (ISO, 3 huruf) atau pilih cepat.</p>

        <div className="mb-4 flex flex-wrap gap-2">
          {SUGGESTED.map((c) => <button key={c} onClick={() => setCurrency(c)} className={pick(currency === c)}>{c}</button>)}
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <label className="text-xs text-mute">Kode mata uang
            <input list="settings-codes" maxLength={3} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="mis. THB" className={field + " uppercase"} />
            <datalist id="settings-codes">{codes.map((c) => <option key={c} value={c} />)}</datalist>
          </label>
          <label className="text-xs text-mute">Kurs manual (opsional): 1 USD =
            <input inputMode="decimal" value={rateText} onChange={(e) => setRateText(e.target.value)} placeholder="mis. 16250" className={field} />
          </label>
          <button onClick={apply} className="min-h-[44px] rounded-lg bg-brand px-5 text-sm font-semibold text-white dark:text-bg">Terapkan</button>
        </div>
        {msg && <p className="mt-3 text-sm">{msg}</p>}

        <p className="mt-4 text-sm text-mute">
          Aktif: 1 USD = {rate.toLocaleString("en-US", { maximumFractionDigits: 4 })} {currency} ·{" "}
          {manual ? "kurs manual" : live ? `kurs live, diperbarui ${new Date(updated!).toLocaleString("id-ID")}` : "kurs perkiraan (kurs live belum termuat)"}
        </p>
        {manual && <button onClick={clearManual} className="mt-2 min-h-[44px] rounded-lg border border-line px-4 text-sm">Hapus kurs manual {currency}</button>}
      </div>
    </div>
  );
}
