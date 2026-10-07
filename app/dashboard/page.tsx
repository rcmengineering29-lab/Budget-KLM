"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import FilterBar, { type Filters } from "@/components/filters/filter-bar";
import BudgetCard from "@/components/cards/budget-card";
import WaShare from "@/components/share/wa-share";
import { JenisChart, KodeChart } from "@/components/charts/budget-charts";
import { groupBy, summarize, useBudgetRows, useLatestDate } from "@/hooks/use-budget";
import { useCurrency } from "@/components/currency-provider";
import { dateLabel, pct } from "@/lib/utils/format";
import { byTipe, isDepr, tipeOf, TIPE_LABEL, type Tipe } from "@/lib/utils/classify";
import type { BudgetRow } from "@/types/budget";

const EMPTY: Filters = { date: "", tipe: "", jenis: "", kode: "" };

function Kpi({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-xl border border-line bg-panel p-4">
      <p className="text-sm text-mute">{label}</p>
      <p className="mt-1 break-words text-xl font-bold tabular-nums sm:text-2xl">{value}</p>
      {note && <p className="mt-1 text-xs text-mute">{note}</p>}
    </div>
  );
}

function TipePanel({ tipe, rows }: { tipe: Tipe; rows: BudgetRow[] }) {
  const { fmt } = useCurrency();
  const k = summarize(rows);
  const items = rows.filter((r) => !isDepr(r.uraian)).length;
  const stat = (label: string, value: string) => (
    <div><dt className="text-xs text-mute">{label}</dt><dd className="break-words font-semibold tabular-nums">{value}</dd></div>
  );
  return (
    <div className="rounded-xl border border-line bg-panel p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{TIPE_LABEL[tipe]}</h3>
        <span className="text-xs text-mute">{items} item</span>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
        {stat("Consumable", fmt(k.consumable))}
        {stat("Consumed", fmt(k.consumed))}
        {stat("Available", fmt(k.available))}
        {stat("Pemakaian", pct(k.usage))}
      </dl>
    </div>
  );
}

export default function DashboardPage() {
  const latest = useLatestDate();
  const { fmt, currency } = useCurrency();
  const [draft, setDraft] = useState<Filters>(EMPTY);
  const [applied, setApplied] = useState<Filters>(EMPTY);

  useEffect(() => {
    if (latest.data && !applied.date) {
      setDraft((d) => ({ ...d, date: latest.data! }));
      setApplied((a) => ({ ...a, date: latest.data! }));
    }
  }, [latest.data, applied.date]);

  const { data: all = [], isLoading, error } = useBudgetRows(applied.date || null);

  const jenisOptions = useMemo(
    () => [...new Set(all.filter((r) => !draft.tipe || tipeOf(r.jenis_budget) === draft.tipe).map((r) => r.jenis_budget))].sort(),
    [all, draft.tipe]
  );
  const kodeOptions = useMemo(
    () => [...new Map(all.map((r) => [r.kode, `${r.kode} - ${r.uraian}`])).entries()].map(([value, label]) => ({ value, label })),
    [all]
  );
  // base: filter jenis & kode saja (dipakai untuk perbandingan Capex vs Opex)
  const base = useMemo(
    () => all.filter((r) => (!applied.jenis || r.jenis_budget === applied.jenis) && (!applied.kode || r.kode === applied.kode)),
    [all, applied.jenis, applied.kode]
  );
  const rows = useMemo(() => base.filter((r) => !applied.tipe || tipeOf(r.jenis_budget) === applied.tipe), [base, applied.tipe]);

  const kpi = summarize(rows);
  const byJenis = useMemo(() => groupBy(rows, (r) => r.jenis_budget), [rows]);
  const byKode = useMemo(() => groupBy(rows, (r) => `${r.kode} - ${r.uraian}`), [rows]);
  const deprCount = rows.filter((r) => isDepr(r.uraian)).length;
  const tipeList = (["CAPEX", "OPEX", "LAINNYA"] as Tipe[]).filter((t) => byTipe(base, t).length > 0);

  const reset = () => {
    const d = { ...EMPTY, date: latest.data ?? "" };
    setDraft(d);
    setApplied(d);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard Budget</h1>
          {applied.date && <p className="text-sm text-mute">Data per {dateLabel(applied.date)} · ditampilkan dalam {currency}</p>}
        </div>
        {rows.length > 0 && <WaShare rows={rows} date={applied.date} />}
      </div>

      <FilterBar draft={draft} setDraft={setDraft} jenisOptions={jenisOptions} kodeOptions={kodeOptions} onApply={() => setApplied(draft)} onReset={reset} />

      {error && <p className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm">Gagal memuat data: {(error as Error).message}</p>}
      {!latest.isLoading && !latest.data && (
        <div className="rounded-xl border border-dashed border-line p-8 text-center">
          <p className="font-medium">Belum ada data budget.</p>
          <Link href="/upload" className="mt-3 inline-flex min-h-[44px] items-center rounded-lg bg-brand px-4 text-sm font-semibold text-white dark:text-bg">Upload file Excel</Link>
        </div>
      )}
      {isLoading && <p className="text-sm text-mute">Memuat data…</p>}

      {rows.length > 0 && (
        <>
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi label="Total Consumable Budget" value={fmt(kpi.consumable)} />
            <Kpi label="Total Available Amount" value={fmt(kpi.available)} />
            <Kpi label="Total Consumed Budget" value={fmt(kpi.consumed)} note={`${pct(kpi.usage)} dari consumable`} />
            <Kpi label="Persentase Pemakaian" value={pct(kpi.usage)} />
          </section>
          {deprCount > 0 && (
            <p className="-mt-3 text-xs text-mute">{deprCount} baris berisi DEPR tetap tampil sebagai kartu, tetapi tidak dihitung di total dan grafik.</p>
          )}

          {!applied.tipe && tipeList.length > 0 && (
            <section>
              <h2 className="mb-3 font-semibold">Capex vs Opex</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {tipeList.map((t) => <TipePanel key={t} tipe={t} rows={byTipe(base, t)} />)}
              </div>
            </section>
          )}

          <section className="rounded-xl border border-line bg-panel p-4">
            <h2 className="mb-3 font-semibold">Per Jenis Budget</h2>
            <JenisChart data={byJenis} />
          </section>

          <section className="rounded-xl border border-line bg-panel p-4">
            <h2 className="mb-3 font-semibold">Per Kode - Uraian</h2>
            <KodeChart data={byKode} />
          </section>

          <section>
            <h2 className="mb-3 font-semibold">Kartu Budget ({rows.length})</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {rows.map((r, i) => <BudgetCard key={`${r.kode}-${r.jenis_budget}-${i}`} row={r} />)}
            </div>
          </section>
        </>
      )}
      {!isLoading && applied.date && all.length === 0 && latest.data && (
        <p className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-mute">Tidak ada data pada tanggal ini.</p>
      )}
    </div>
  );
}
