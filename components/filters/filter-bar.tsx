"use client";
export type Filters = { date: string; tipe: string; jenis: string; kode: string };

const field = "min-h-[44px] w-full rounded-lg border border-line bg-panel px-3 text-sm text-ink";

export default function FilterBar(props: {
  draft: Filters;
  setDraft: (f: Filters) => void;
  jenisOptions: string[];
  kodeOptions: { value: string; label: string }[];
  onApply: () => void;
  onReset: () => void;
}) {
  const { draft, setDraft, jenisOptions, kodeOptions, onApply, onReset } = props;
  return (
    <div className="grid gap-3 rounded-xl border border-line bg-panel p-4 sm:grid-cols-2 xl:grid-cols-[1fr_0.8fr_1fr_1.4fr_auto]">
      <label className="text-xs text-mute">Tanggal
        <input type="date" className={field + " mt-1"} value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
      </label>
      <label className="text-xs text-mute">Tipe
        <select className={field + " mt-1"} value={draft.tipe} onChange={(e) => setDraft({ ...draft, tipe: e.target.value, jenis: "" })}>
          <option value="">Semua</option>
          <option value="CAPEX">Capex</option>
          <option value="OPEX">Opex</option>
        </select>
      </label>
      <label className="text-xs text-mute">Jenis Budget
        <select className={field + " mt-1"} value={draft.jenis} onChange={(e) => setDraft({ ...draft, jenis: e.target.value })}>
          <option value="">Semua</option>
          {jenisOptions.map((o) => <option key={o}>{o}</option>)}
        </select>
      </label>
      <label className="text-xs text-mute">Kode - Uraian
        <select className={field + " mt-1"} value={draft.kode} onChange={(e) => setDraft({ ...draft, kode: e.target.value })}>
          <option value="">Semua</option>
          {kodeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </label>
      <div className="flex items-end gap-2 sm:col-span-2 xl:col-span-1">
        <button onClick={onReset} className="min-h-[44px] flex-1 rounded-lg border border-line px-4 text-sm font-medium xl:flex-none">Reset</button>
        <button onClick={onApply} className="min-h-[44px] flex-1 rounded-lg bg-brand px-4 text-sm font-semibold text-white dark:text-bg xl:flex-none">Terapkan</button>
      </div>
    </div>
  );
}
