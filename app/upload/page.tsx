"use client";
import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, FileSpreadsheet, TriangleAlert } from "lucide-react";
import { parseBudgetFile } from "@/lib/utils/parse";
import { dateLabel, rupiah } from "@/lib/utils/format";
import type { BudgetRow } from "@/types/budget";

export default function UploadPage() {
  const qc = useQueryClient();
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<BudgetRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [passcode, setPasscode] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function pick(f?: File) {
    if (!f) return;
    setMsg(null);
    setFile(f);
    const res = await parseBudgetFile(f).catch((e) => ({ rows: [] as BudgetRow[], errors: [String(e?.message ?? e)] }));
    setRows(res.rows);
    setErrors(res.errors);
  }

  async function submit() {
    if (!file || !rows.length) return;
    setBusy(true);
    setMsg(null);
    try {
      const r = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-upload-key": passcode },
        body: JSON.stringify({ fileName: file.name, rows }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setMsg({ ok: true, text: `${j.count} baris tersimpan untuk tanggal ${(j.dates as string[]).map(dateLabel).join(", ")}.` });
      setFile(null); setRows([]); setErrors([]);
      qc.invalidateQueries();
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <h1 className="text-2xl font-bold tracking-tight">Upload Excel</h1>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files[0]); }}
        className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-line bg-panel p-8 text-center"
      >
        <FileSpreadsheet size={32} className="text-brand" />
        <p className="text-sm">{file ? file.name : "Tarik file ke sini, atau pilih dari perangkat"}</p>
        <p className="text-xs text-mute">.xlsx, .xls, atau .csv</p>
        <button onClick={() => input.current?.click()} className="min-h-[44px] rounded-lg border border-line px-4 text-sm font-medium">Pilih file</button>
        <input ref={input} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
      </div>

      {errors.length > 0 && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm">
          <p className="mb-1 flex items-center gap-2 font-medium"><TriangleAlert size={16} /> Perlu diperbaiki</p>
          <ul className="list-disc pl-5">{errors.slice(0, 8).map((e) => <li key={e}>{e}</li>)}</ul>
        </div>
      )}

      {rows.length > 0 && (
        <>
          <p className="text-sm text-mute">{rows.length} baris siap disimpan. Pratinjau 10 baris pertama:</p>
          <div className="overflow-x-auto rounded-xl border border-line bg-panel">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-line text-mute">
                <tr>{["Tanggal", "Jenis Budget", "Kode", "Uraian", "Consumable", "Available"].map((h) => <th key={h} className="px-3 py-2 font-medium">{h}</th>)}</tr>
              </thead>
              <tbody>
                {rows.slice(0, 10).map((r, i) => (
                  <tr key={i} className="border-b border-line/60 last:border-0">
                    <td className="px-3 py-2">{r.tanggal}</td><td className="px-3 py-2">{r.jenis_budget}</td>
                    <td className="px-3 py-2">{r.kode}</td><td className="px-3 py-2">{r.uraian}</td>
                    <td className="px-3 py-2 tabular-nums">{rupiah(r.consumable_budget)}</td>
                    <td className="px-3 py-2 tabular-nums">{rupiah(r.available_amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="text-xs text-mute sm:w-64">Kode upload (jika diatur)
              <input type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)} className="mt-1 min-h-[44px] w-full rounded-lg border border-line bg-panel px-3 text-sm text-ink" />
            </label>
            <button onClick={submit} disabled={busy} className="min-h-[44px] rounded-lg bg-brand px-5 text-sm font-semibold text-white disabled:opacity-50 dark:text-bg">
              {busy ? "Menyimpan…" : "Upload ke Database"}
            </button>
          </div>
        </>
      )}

      {msg && (
        <p className={`flex items-center gap-2 rounded-lg border p-4 text-sm ${msg.ok ? "border-emerald-500/40 bg-emerald-500/10" : "border-red-500/40 bg-red-500/10"}`}>
          {msg.ok ? <CheckCircle2 size={16} /> : <TriangleAlert size={16} />} {msg.text}
        </p>
      )}
    </div>
  );
}
