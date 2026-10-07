"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

// Data di database selalu USD. Konversi hanya untuk tampilan.
export const SUGGESTED = ["USD", "IDR", "EUR", "SGD", "JPY", "AUD", "GBP", "CNY", "MYR"];
// Kurs cadangan (perkiraan) jika kurs live gagal dimuat.
const FALLBACK: Record<string, number> = { USD: 1, IDR: 16000, EUR: 0.92, SGD: 1.3, JPY: 150, AUD: 1.5, GBP: 0.78, CNY: 7.2, MYR: 4.4 };
const TTL = 12 * 3600 * 1000;
const CODE = /^[A-Z]{3}$/;

type Ctx = {
  currency: string; rate: number; live: boolean; updated: string | null;
  manual: number | null; codes: string[];
  /** Ubah mata uang tampilan. Return false jika kurs tidak diketahui dan tidak ada kurs manual. */
  setCurrency: (code: string, manualRate?: number) => boolean;
  clearManual: () => void;
  fmt: (usd: number) => string; axis: (usd: number) => string;
};
const C = createContext<Ctx>(null as unknown as Ctx);
export const useCurrency = () => useContext(C);

const read = <T,>(k: string, d: T): T => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
const write = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

export default function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCur] = useState("USD");
  const [rates, setRates] = useState<Record<string, number>>(FALLBACK);
  const [manualMap, setManualMap] = useState<Record<string, number>>({});
  const [live, setLive] = useState(false);
  const [updated, setUpdated] = useState<string | null>(null);

  useEffect(() => {
    const saved = read<string>("klm-currency", "USD");
    if (CODE.test(saved)) setCur(saved);
    setManualMap(read<Record<string, number>>("klm-manual-rates", {}));

    const cache = read<{ ts: number; rates: Record<string, number> } | null>("klm-rates", null);
    if (cache && Date.now() - cache.ts < TTL) {
      setRates({ ...FALLBACK, ...cache.rates }); setLive(true); setUpdated(new Date(cache.ts).toISOString());
      return;
    }
    fetch("https://open.er-api.com/v6/latest/USD")
      .then((r) => r.json())
      .then((j) => {
        if (!j?.rates) return;
        const ts = Date.now();
        setRates({ ...FALLBACK, ...j.rates }); setLive(true); setUpdated(new Date(ts).toISOString());
        write("klm-rates", { ts, rates: j.rates });
      })
      .catch(() => {});
  }, []);

  const value = useMemo<Ctx>(() => {
    const known = manualMap[currency] ?? rates[currency];
    const code = known ? currency : "USD"; // kode tanpa kurs → kembali ke USD
    const rate = known ?? 1;
    let money: (n: number) => string;
    try {
      const f = new Intl.NumberFormat(code === "IDR" ? "id-ID" : "en-US", { style: "currency", currency: code });
      money = (n) => f.format(n);
    } catch {
      money = (n) => `${code} ${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
    }
    const short = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
    return {
      currency: code, rate, live, updated,
      manual: manualMap[code] ?? null,
      codes: [...new Set([...SUGGESTED, ...Object.keys(rates)])].sort(),
      setCurrency: (raw, manualRate) => {
        const c = raw.trim().toUpperCase();
        if (!CODE.test(c)) return false;
        let map = manualMap;
        if (manualRate && manualRate > 0) { map = { ...manualMap, [c]: manualRate }; setManualMap(map); write("klm-manual-rates", map); }
        if (!map[c] && !rates[c]) return false;
        setCur(c); write("klm-currency", c);
        return true;
      },
      clearManual: () => {
        const map = { ...manualMap }; delete map[code];
        setManualMap(map); write("klm-manual-rates", map);
      },
      fmt: (usd) => money((usd || 0) * rate),
      axis: (usd) => short.format((usd || 0) * rate),
    };
  }, [currency, rates, manualMap, live, updated]);

  return <C.Provider value={value}>{children}</C.Provider>;
}
