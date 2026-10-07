"use client";
import { useEffect, useState } from "react";
import { SUGGESTED, useCurrency, type Mode } from "@/components/currency-provider";

// "18500", "18.500", "18,500", "18500.5" → angka. "0.307" tetap desimal.
function parseRate(t: string): number | null {
  let s = t.trim().replace(/\s/g, "");
  if (!s) return null;
  const dot = s.includes("."), comma = s.includes(",");
  if (dot && comma) {
    const decDot = s.lastIndexOf(".") > s.lastIndexOf(",");
    s = decDot ? s.replace(/,/g, "") : s.replace(/\./g, "").replace(",", ".");
  } else if (dot || comma) {
    const parts = s.split(dot ? "." : ",");
    const thousands = parts.length > 2 || (parts.length === 2 && parts[1].length === 3 && parts[0] !== "0");
    s = thousands ? parts.join("") : parts.join(".");
  }
  const n = Number(s);
  return isFinite(n) && n > 0 ? n : null;
}

const field = "mt-1 min-h-[44px] w-full rounded-lg border border-line bg-bg px-3 text-sm text-ink";
const seg = (on: boolean) => `min-h-[44px] flex-1 rounded-lg border px-3 text-sm font-medium ${on ? "border-brand bg-brand text-white dark:text-bg" : "border-line"}`;
const n = (x: number) => x.toLocaleString("id-ID", { maximumFractionDigits: 4 });

export default function CurrencyPanel({ onDone }: { onDone?: () => void }) {
  const { currency, mode, rate, autoRate, manualRate, live, updated, codes, apply } = useCurrency();
  const [code, setCode] = useState(currency);
  const [m, setM] = useState<Mode>(mode);
  const [text, setText] = useState(manualRate ? String(manualRate) : "");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => { setCode(currency); setM(mode); setText(manualRate ? String(manualRate) : ""); }, [currency, mode, manualRate]);

  const draftCode = code.trim().toUpperCase();
  const draftAuto = draftCode === currency ? autoRate : null;

  function submit() {
    const r = m === "manual" ? parseRate(text) ?? undefined : undefined;
    if (m === "manual" && draftCode !== "USD" && text.trim() && !r) return setMsg({ ok: false, text: "Kurs tidak terbaca. Contoh: 18500" });
    const err = apply(draftCode, m, r);
    if (err) return setMsg({ ok: false, text: err });
    setMsg({ ok: true, text: `Tampilan diubah ke ${draftCode}${m === "manual" && draftCode !== "USD" ? " (kurs manual)" : ""}.` });
    onDone?.();
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {SUGGESTED.map((c) => (
          <button key={c} onClick={() => setCode(c)} className={`min-h-[36px] rounded-lg border px-3 text-xs font-medium ${draftCode === c ? "border-brand text-brand" : "border-line text-mute"}`}>{c}</button>
        ))}
      </div>

      <label className="block text-xs text-mute">Mata uang
        <input list="klm-codes" maxLength={3} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="mis. IDR" className={field + " uppercase"} />
        <datalist id="klm-codes">{codes.map((c) => <option key={c} value={c} />)}</datalist>
      </label>

      <div>
        <p className="mb-1 text-xs text-mute">Kurs</p>
        <div className="flex gap-2">
          <button onClick={() => setM("auto")} className={seg(m === "auto")}>Otomatis</button>
          <button onClick={() => setM("manual")} className={seg(m === "manual")}>Manual</button>
        </div>
      </div>

      {m === "manual" ? (
        <label className="block text-xs text-mute">1 USD =
          <input inputMode="decimal" value={text} onChange={(e) => setText(e.target.value)} placeholder="mis. 18500" className={field} />
        </label>
      ) : (
        <p className="text-sm text-mute">
          {draftAuto
            ? <>Kurs otomatis: 1 USD = {n(draftAuto)} {draftCode} ({live ? `live, ${new Date(updated!).toLocaleString("id-ID")}` : "perkiraan, kurs live belum termuat"})</>
            : "Kurs otomatis diambil dari sumber kurs saat Anda menekan Terapkan."}
        </p>
      )}

      <button onClick={submit} className="min-h-[44px] w-full rounded-lg bg-brand text-sm font-semibold text-white dark:text-bg">Terapkan</button>
      {msg && <p className={`text-sm ${msg.ok ? "" : "text-red-600 dark:text-red-400"}`}>{msg.text}</p>}
      <p className="text-xs text-mute">Aktif: 1 USD = {n(rate)} {currency} · {currency === "USD" ? "mata uang asal data" : mode === "manual" ? "kurs manual" : "kurs otomatis"}</p>
    </div>
  );
}
