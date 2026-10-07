"use client";
import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Send, Share2, X } from "lucide-react";
import type { BudgetRow } from "@/types/budget";
import { useCurrency } from "@/components/currency-provider";
import { isDepr, tipeOf, TIPE_LABEL, type Tipe } from "@/lib/utils/classify";
import { pct } from "@/lib/utils/format";
import { buildWaMessage, statusDot } from "@/lib/utils/wa";

async function copyText(t: string) {
  try {
    await navigator.clipboard.writeText(t);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = t;
    ta.style.cssText = "position:fixed;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

const chip = "min-h-[36px] rounded-lg border border-line px-3 text-xs font-medium hover:bg-line/40";

export default function WaShare({ rows, date }: { rows: BudgetRow[]; date: string }) {
  const { fmt, currency, rate } = useCurrency();
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState<Set<number>>(new Set());
  const [summary, setSummary] = useState(true);
  const [copied, setCopied] = useState(false);

  // Setiap data/filter berubah, default semua item tercentang.
  useEffect(() => setSel(new Set(rows.map((_, i) => i))), [rows]);
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open]);

  const groups = useMemo(
    () =>
      (["CAPEX", "OPEX", "LAINNYA"] as Tipe[])
        .map((t) => ({ t, items: rows.map((r, i) => ({ r, i })).filter((x) => tipeOf(x.r.jenis_budget) === t) }))
        .filter((g) => g.items.length),
    [rows]
  );
  const chosen = useMemo(() => rows.filter((_, i) => sel.has(i)), [rows, sel]);
  const text = useMemo(
    () => (chosen.length ? buildWaMessage(chosen, { date, currency, rate, fmt, withSummary: summary }) : ""),
    [chosen, date, currency, rate, fmt, summary]
  );

  const toggle = (i: number) => setSel((s) => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; });
  const toggleGroup = (idx: number[]) =>
    setSel((s) => {
      const n = new Set(s);
      const all = idx.every((i) => n.has(i));
      idx.forEach((i) => (all ? n.delete(i) : n.add(i)));
      return n;
    });

  async function copy() {
    if (await copyText(text)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }
  const send = () => window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex min-h-[44px] items-center gap-2 rounded-lg border border-line bg-panel px-4 text-sm font-medium hover:bg-line/40">
        <Share2 size={16} /> Bagikan ke WhatsApp
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}>
          <div role="dialog" aria-modal="true" aria-label="Bagikan ke WhatsApp" className="flex max-h-[92vh] w-full max-w-4xl flex-col rounded-t-2xl border border-line bg-panel sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <div>
                <h2 className="font-semibold">Bagikan ke WhatsApp</h2>
                <p className="text-xs text-mute">Centang item yang ingin dikirim. {sel.size} dari {rows.length} dipilih.</p>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Tutup" className="grid h-11 w-11 place-items-center"><X size={20} /></button>
            </div>

            <div className="grid flex-1 gap-4 overflow-y-auto p-4 md:grid-cols-2">
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <button className={chip} onClick={() => setSel(new Set(rows.map((_, i) => i)))}>Pilih semua</button>
                  <button className={chip} onClick={() => setSel(new Set())}>Kosongkan</button>
                  <button className={chip} onClick={() => setSel(new Set(rows.flatMap((r, i) => (isDepr(r.uraian) ? [] : [i]))))}>Tanpa DEPR</button>
                </div>
                <label className="flex min-h-[44px] items-center gap-3 text-sm">
                  <input type="checkbox" className="h-5 w-5 accent-[rgb(var(--brand))]" checked={summary} onChange={(e) => setSummary(e.target.checked)} />
                  Sertakan ringkasan total
                </label>

                <div className="md:max-h-[50vh] md:overflow-y-auto md:pr-1">
                  {groups.map(({ t, items }) => (
                    <div key={t} className="mb-3">
                      <div className="mb-1 flex items-center justify-between">
                        <p className="text-sm font-semibold">{TIPE_LABEL[t]} <span className="font-normal text-mute">({items.length})</span></p>
                        <button className="text-xs font-medium text-brand" onClick={() => toggleGroup(items.map((x) => x.i))}>Pilih / batal</button>
                      </div>
                      <ul className="divide-y divide-line rounded-lg border border-line">
                        {items.map(({ r, i }) => {
                          const ratio = r.consumable_budget ? r.available_amount / r.consumable_budget : 0;
                          return (
                            <li key={i}>
                              <label className="flex min-h-[44px] cursor-pointer items-start gap-3 px-3 py-2">
                                <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-[rgb(var(--brand))]" checked={sel.has(i)} onChange={() => toggle(i)} />
                                <span className="min-w-0 flex-1 text-sm">
                                  <span className="block font-medium leading-snug">{r.uraian}{isDepr(r.uraian) && <span className="ml-1 text-xs text-mute">(DEPR)</span>}</span>
                                  <span className="block truncate text-xs text-mute">{r.kode} · {r.jenis_budget}</span>
                                </span>
                                <span className="shrink-0 text-xs tabular-nums text-mute">{statusDot(ratio)} {pct(ratio)}</span>
                              </label>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-1 text-xs text-mute">Pratinjau pesan ({text.length} karakter)</p>
                <pre className="max-h-[50vh] min-h-[200px] overflow-auto whitespace-pre-wrap break-words rounded-lg border border-line bg-bg p-3 text-sm leading-relaxed">
                  {text || "Pilih minimal satu item."}
                </pre>
                {text.length > 3500 && (
                  <p className="mt-2 text-xs text-mute">Pesan cukup panjang. Jika tombol WhatsApp memotong teks, pakai Salin lalu tempel di WhatsApp.</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-line p-4 sm:flex-row sm:justify-end">
              <button onClick={copy} disabled={!text} className="flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-line px-5 text-sm font-medium disabled:opacity-40">
                {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Tersalin" : "Salin teks"}
              </button>
              <button onClick={send} disabled={!text} className="flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 text-sm font-semibold text-white disabled:opacity-40">
                <Send size={16} /> Kirim ke WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
