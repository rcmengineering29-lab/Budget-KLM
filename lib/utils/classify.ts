import type { BudgetRow } from "@/types/budget";

export type Tipe = "CAPEX" | "OPEX" | "LAINNYA";

// Uraian yang mengandung "DEPR" (depresiasi) tidak dihitung dalam total/kumulatif.
export const isDepr = (uraian: string) => /\bDEPR/i.test(uraian);

// Capex = Jenis Budget berawalan 20D, Opex = berawalan I20. Ubah di sini jika aturan berubah.
export function tipeOf(jenisBudget: string): Tipe {
  const j = jenisBudget.trim().toUpperCase();
  if (j.startsWith("20D")) return "CAPEX";
  if (j.startsWith("I20")) return "OPEX";
  return "LAINNYA";
}

export const TIPE_LABEL: Record<Tipe, string> = { CAPEX: "Capex", OPEX: "Opex", LAINNYA: "Lainnya" };
export const byTipe = (rows: BudgetRow[], t: Tipe) => rows.filter((r) => tipeOf(r.jenis_budget) === t);
