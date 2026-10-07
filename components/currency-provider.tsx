"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

// Data di database selalu USD. Konversi hanya untuk tampilan.
export const CURRENCIES: string[] = ["USD", "IDR", "EUR", "SGD", "JPY", "AUD", "GBP", "CNY", "MYR"];
// Kurs cadangan (perkiraan) jika kurs live gagal dimuat.
const FALLBACK: Record<string, number> = { USD: 1, IDR: 16000, EUR: 0.92, SGD: 1.3, JPY: 150, AUD: 1.5, GBP: 0.78, CNY: 7.2, MYR: 4.4 };
const TTL = 12 * 3600 * 1000;

type Ctx = {
  currency: string; setCurrency: (c: string) => void; rate: number; live: boolean; updated: string | null;
  fmt: (usd: number) => string; axis: (usd: number) => string;
};
const C = createContext<Ctx>(null as unknown as Ctx);
export const useCurrency = () => useContext(C);

export default function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCur] = useState("USD");
  const [rates, setRates] = useState<Record<string, number>>(FALLBACK);
  const [live, setLive] = useState(false);
  const [updated, setUpdated] = useState<string | null>(null);

  useEffect(() => {
    try {
      const c = localStorage.getItem("klm-currency");
      if (c && CURRENCIES.includes(c)) setCur(c);
      const raw = localStorage.getItem("klm-rates");
      if (raw) {
        const j = JSON.parse(raw);
        if (Date.now() - j.ts < TTL) {
          setRates({ ...FALLBACK, ...j.rates }); setLive(true); setUpdated(new Date(j.ts).toISOString());
          return;
        }
      }
    } catch {}
    fetch("https://open.er-api.com/v6/latest/USD")
      .then((r) => r.json())
      .then((j) => {
        if (!j?.rates) return;
        const ts = Date.now();
        setRates({ ...FALLBACK, ...j.rates }); setLive(true); setUpdated(new Date(ts).toISOString());
        try { localStorage.setItem("klm-rates", JSON.stringify({ ts, rates: j.rates })); } catch {}
      })
      .catch(() => {});
  }, []);

  const value = useMemo<Ctx>(() => {
    const rate = rates[currency] ?? 1;
    const money = new Intl.NumberFormat(currency === "IDR" ? "id-ID" : "en-US", { style: "currency", currency });
    const short = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
    return {
      currency, rate, live, updated,
      setCurrency: (c) => { setCur(c); try { localStorage.setItem("klm-currency", c); } catch {} },
      fmt: (usd) => money.format((usd || 0) * rate),
      axis: (usd) => short.format((usd || 0) * rate),
    };
  }, [currency, rates, live, updated]);

  return <C.Provider value={value}>{children}</C.Provider>;
}
