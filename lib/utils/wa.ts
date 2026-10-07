import type { BudgetRow } from "@/types/budget";
import { isDepr, tipeOf, TIPE_LABEL, type Tipe } from "@/lib/utils/classify";
import { dateLabel, pct } from "@/lib/utils/format";
import { summarize } from "@/hooks/use-budget";

export type WaOptions = {
  date: string;
  currency: string;
  rate: number;
  fmt: (usd: number) => string;
  withSummary: boolean;
};

// Sama dengan warna kartu: ≥60% hijau, 30–59% kuning, 10–29% oranye, <10% merah.
export const statusDot = (ratio: number) => (ratio >= 0.6 ? "🟢" : ratio >= 0.3 ? "🟡" : ratio >= 0.1 ? "🟠" : "🔴");

export function buildWaMessage(rows: BudgetRow[], o: WaOptions): string {
  const L: string[] = [];
  L.push("*📊 Budget KLM*");
  L.push(`Tanggal: ${dateLabel(o.date)}`);
  L.push(
    o.currency === "USD"
      ? "Mata uang: USD"
      : `Mata uang: ${o.currency} (1 USD = ${o.rate.toLocaleString("id-ID", { maximumFractionDigits: 4 })} ${o.currency})`
  );

  if (o.withSummary && rows.length) {
    const k = summarize(rows);
    L.push("", "*Ringkasan*");
    L.push(`Consumable: ${o.fmt(k.consumable)}`);
    L.push(`Consumed: ${o.fmt(k.consumed)}`);
    L.push(`Available: ${o.fmt(k.available)}`);
    L.push(`Pemakaian: ${pct(k.usage)}`);
    if (rows.some((r) => isDepr(r.uraian))) L.push("_Item DEPR tidak dihitung di ringkasan._");
  }

  for (const t of ["CAPEX", "OPEX", "LAINNYA"] as Tipe[]) {
    const items = rows.filter((r) => tipeOf(r.jenis_budget) === t);
    if (!items.length) continue;
    L.push("", `*${TIPE_LABEL[t]}* (${items.length} item)`);
    items.forEach((r, i) => {
      const ratio = r.consumable_budget ? r.available_amount / r.consumable_budget : 0;
      const used = r.consumable_budget ? r.consumed_budget / r.consumable_budget : 0;
      L.push(
        "",
        `${i + 1}. *${r.uraian}*${isDepr(r.uraian) ? " _(DEPR)_" : ""}`,
        `    ${r.kode} · ${r.jenis_budget}`,
        `    Consumable: ${o.fmt(r.consumable_budget)}`,
        `    Consumed: ${o.fmt(r.consumed_budget)}`,
        `    Available: ${o.fmt(r.available_amount)}`,
        `    ${statusDot(ratio)} Sisa ${pct(ratio)} · Terpakai ${pct(used)}`
      );
    });
  }
  L.push("", "_Dikirim dari Budget KLM_");
  return L.join("\n");
}
