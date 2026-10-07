"use client";
import { useMemo } from "react";
import { useBudgetRows, useLatestDate } from "@/hooks/use-budget";

export default function MasterPage() {
  const latest = useLatestDate();
  const { data: rows = [] } = useBudgetRows(latest.data ?? null);
  const list = useMemo(
    () => [...new Map(rows.map((r) => [`${r.jenis_budget}|${r.kode}`, r])).values()].sort((a, b) => a.kode.localeCompare(b.kode)),
    [rows]
  );
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Master Data</h1>
      <p className="text-sm text-mute">Daftar Jenis Budget, Kode, dan Uraian dari data terbaru.</p>
      <div className="overflow-x-auto rounded-xl border border-line bg-panel">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="border-b border-line text-mute"><tr><th className="px-3 py-2 font-medium">Jenis Budget</th><th className="px-3 py-2 font-medium">Kode</th><th className="px-3 py-2 font-medium">Uraian</th></tr></thead>
          <tbody>{list.map((r) => <tr key={r.jenis_budget + r.kode} className="border-b border-line/60 last:border-0"><td className="px-3 py-2">{r.jenis_budget}</td><td className="px-3 py-2">{r.kode}</td><td className="px-3 py-2">{r.uraian}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
