import type { BudgetRow } from "@/types/budget";
import { pct, rupiah } from "@/lib/utils/format";

// Kelas ditulis lengkap agar terdeteksi Tailwind.
function tone(ratio: number) {
  if (ratio >= 0.6) return { bar: "bg-emerald-500", edge: "border-t-emerald-500", chip: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300", label: "Aman" };
  if (ratio >= 0.3) return { bar: "bg-amber-400", edge: "border-t-amber-400", chip: "bg-amber-400/20 text-amber-700 dark:text-amber-300", label: "Waspada" };
  if (ratio >= 0.1) return { bar: "bg-orange-600", edge: "border-t-orange-600", chip: "bg-orange-600/15 text-orange-700 dark:text-orange-300", label: "Menipis" };
  return { bar: "bg-red-600", edge: "border-t-red-600", chip: "bg-red-600/15 text-red-700 dark:text-red-300", label: "Kritis" };
}

export default function BudgetCard({ row }: { row: BudgetRow }) {
  const ratio = row.consumable_budget ? row.available_amount / row.consumable_budget : 0;
  const t = tone(ratio);
  const width = Math.max(0, Math.min(100, ratio * 100));
  return (
    <article className={`flex h-full min-h-[220px] flex-col rounded-xl border border-t-4 border-line bg-panel p-4 ${t.edge}`}>
      <h3 className="line-clamp-2 min-h-[2.75rem] text-base font-semibold leading-snug">{row.uraian}</h3>
      <p className="mt-1 truncate text-xs text-mute">{row.kode} · {row.jenis_budget}</p>

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between gap-2"><dt className="text-mute">Consumable</dt><dd className="font-medium tabular-nums">{rupiah(row.consumable_budget)}</dd></div>
        <div className="flex justify-between gap-2"><dt className="text-mute">Available</dt><dd className="font-medium tabular-nums">{rupiah(row.available_amount)}</dd></div>
      </dl>

      <div className="mt-auto pt-4">
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className={`rounded-full px-2 py-0.5 font-medium ${t.chip}`}>{t.label}</span>
          <span className="tabular-nums text-mute">Sisa {pct(ratio)}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-line"><div className={`h-full ${t.bar}`} style={{ width: `${width}%` }} /></div>
      </div>
    </article>
  );
}
