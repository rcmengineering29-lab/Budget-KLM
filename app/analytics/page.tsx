"use client";
import { JenisChart, KodeChart } from "@/components/charts/budget-charts";
import { groupBy, useBudgetRows, useLatestDate } from "@/hooks/use-budget";
import { dateLabel } from "@/lib/utils/format";

export default function AnalyticsPage() {
  const latest = useLatestDate();
  const { data: rows = [] } = useBudgetRows(latest.data ?? null);
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analitik</h1>
        {latest.data && <p className="text-sm text-mute">Data terbaru: {dateLabel(latest.data)}</p>}
      </div>
      <section className="rounded-xl border border-line bg-panel p-4"><h2 className="mb-3 font-semibold">Per Jenis Budget</h2><JenisChart data={groupBy(rows, (r) => r.jenis_budget)} /></section>
      <section className="rounded-xl border border-line bg-panel p-4"><h2 className="mb-3 font-semibold">Per Kode - Uraian</h2><KodeChart data={groupBy(rows, (r) => `${r.kode} - ${r.uraian}`)} pageSize={20} /></section>
    </div>
  );
}
