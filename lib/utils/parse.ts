import * as XLSX from "xlsx";
import type { BudgetRow } from "@/types/budget";

export const REQUIRED = [
  "Tanggal", "Jenis Budget", "Kode", "Uraian", "Consumable Budget",
  "Consumed Budget", "Available Amount", "Current Budget", "Commitment/Actuals",
] as const;

const MONTHS: Record<string, number> = {
  JANUARI: 1, FEBRUARI: 2, MARET: 3, APRIL: 4, MEI: 5, JUNI: 6, JULI: 7,
  AGUSTUS: 8, SEPTEMBER: 9, OKTOBER: 10, NOVEMBER: 11, DESEMBER: 12,
};
const pad = (n: number) => String(n).padStart(2, "0");

function toISODate(v: unknown): string | null {
  if (v instanceof Date && !isNaN(+v)) return `${v.getFullYear()}-${pad(v.getMonth() + 1)}-${pad(v.getDate())}`;
  const s = String(v ?? "").trim().toUpperCase();
  const m = s.match(/^(\d{1,2})\s+([A-Z]+)\s+(\d{4})$/);
  if (m && MONTHS[m[2]]) return `${m[3]}-${pad(MONTHS[m[2]])}-${pad(+m[1])}`;
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  return null;
}

function toNum(v: unknown): number {
  if (typeof v === "number") return v;
  const s = String(v ?? "").replace(/[^\d,.\-()]/g, "");
  if (!s) return 0;
  const neg = s.startsWith("-") || s.startsWith("(");
  // format Indonesia (1.234.567,89) vs. internasional (1,234,567.89)
  const idStyle = /\.\d{3}(\D|$)/.test(s) && !/\.\d{1,2}$/.test(s);
  const clean = (idStyle ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "")).replace(/[()\-]/g, "");
  const n = parseFloat(clean);
  return isNaN(n) ? 0 : neg ? -n : n;
}

export async function parseBudgetFile(file: File): Promise<{ rows: BudgetRow[]; errors: string[] }> {
  const wb = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: true });
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets[wb.SheetNames[0]], { defval: "" });
  if (!raw.length) return { rows: [], errors: ["File kosong."] };

  const norm = (k: string) => k.trim().toLowerCase();
  const keys = Object.keys(raw[0]);
  const missing = REQUIRED.filter((r) => !keys.some((k) => norm(k) === norm(r)));
  if (missing.length) return { rows: [], errors: [`Kolom tidak ditemukan: ${missing.join(", ")}`] };
  const pick = (row: Record<string, unknown>, name: string) => row[keys.find((k) => norm(k) === norm(name))!];

  const rows: BudgetRow[] = [];
  const errors: string[] = [];
  raw.forEach((r, i) => {
    const tanggal = toISODate(pick(r, "Tanggal"));
    const kode = String(pick(r, "Kode") ?? "").trim();
    if (!tanggal) {
      errors.push(`Baris ${i + 2}: format Tanggal tidak dikenali.`);
      return;
    }
    if (!kode) return;
    rows.push({
      tanggal,
      jenis_budget: String(pick(r, "Jenis Budget")).trim(),
      kode,
      uraian: String(pick(r, "Uraian")).trim(),
      consumable_budget: toNum(pick(r, "Consumable Budget")),
      consumed_budget: toNum(pick(r, "Consumed Budget")),
      available_amount: toNum(pick(r, "Available Amount")),
      current_budget: toNum(pick(r, "Current Budget")),
      commitment_actuals: toNum(pick(r, "Commitment/Actuals")),
    });
  });
  return { rows, errors };
}
