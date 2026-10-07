"use client";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import type { BudgetRow, BudgetUpload } from "@/types/budget";
import { isDepr } from "@/lib/utils/classify";

export const useLatestDate = () =>
  useQuery({
    queryKey: ["latest-date"],
    queryFn: async () => {
      const { data, error } = await supabase.from("budget_data").select("tanggal").order("tanggal", { ascending: false }).limit(1);
      if (error) throw error;
      return (data?.[0]?.tanggal as string | undefined) ?? null;
    },
  });

export const useBudgetRows = (date: string | null) =>
  useQuery({
    queryKey: ["rows", date],
    enabled: !!date,
    queryFn: async () => {
      const { data, error } = await supabase.from("budget_data").select("*").eq("tanggal", date!).order("kode").limit(5000);
      if (error) throw error;
      return (data ?? []) as BudgetRow[];
    },
  });

export const useUploads = () =>
  useQuery({
    queryKey: ["uploads"],
    queryFn: async () => {
      const { data, error } = await supabase.from("budget_uploads").select("*").order("uploaded_at", { ascending: false }).limit(100);
      if (error) throw error;
      return (data ?? []) as BudgetUpload[];
    },
  });

export function summarize(all: BudgetRow[]) {
  const rows = all.filter((r) => !isDepr(r.uraian)); // DEPR tidak dihitung
  const sum = (k: keyof BudgetRow) => rows.reduce((a, r) => a + Number(r[k] || 0), 0);
  const consumable = sum("consumable_budget");
  const consumed = sum("consumed_budget");
  return { consumable, available: sum("available_amount"), consumed, usage: consumable ? consumed / consumable : 0 };
}

export function groupBy(all: BudgetRow[], keyFn: (r: BudgetRow) => string) {
  const rows = all.filter((r) => !isDepr(r.uraian)); // DEPR tidak dihitung
  const map = new Map<string, { name: string; consumable: number; consumed: number; available: number }>();
  for (const r of rows) {
    const k = keyFn(r);
    const g = map.get(k) ?? { name: k, consumable: 0, consumed: 0, available: 0 };
    g.consumable += Number(r.consumable_budget || 0);
    g.consumed += Number(r.consumed_budget || 0);
    g.available += Number(r.available_amount || 0);
    map.set(k, g);
  }
  return [...map.values()];
}
