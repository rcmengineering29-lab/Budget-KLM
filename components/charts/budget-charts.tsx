"use client";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useCurrency } from "@/components/currency-provider";

type Item = { name: string; consumable: number; consumed: number; available: number };
const C1 = "#2f8f9d";
const C2 = "#7a6fb0";
const C3 = "#e0a526";
const tip = { contentStyle: { background: "rgb(var(--panel))", border: "1px solid rgb(var(--line))", borderRadius: 8, color: "rgb(var(--ink))" } };
const tick = { fontSize: 11, fill: "rgb(var(--mute))" };

export function JenisChart({ data }: { data: Item[] }) {
  const { fmt, axis } = useCurrency();
  return (
    <div className="h-72 w-full sm:h-80">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ left: 0, right: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--line))" />
          <XAxis dataKey="name" tick={tick} interval={0} angle={-20} textAnchor="end" height={60} />
          <YAxis tickFormatter={axis} tick={tick} width={52} />
          <Tooltip {...tip} formatter={(v: number) => fmt(v)} />
          <Legend />
          <Bar dataKey="consumable" name="Consumable Budget" fill={C1} radius={[4, 4, 0, 0]} />
          <Bar dataKey="consumed" name="Consumed Budget" fill={C2} radius={[4, 4, 0, 0]} />
          <Bar dataKey="available" name="Available Amount" fill={C3} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function KodeChart({ data, pageSize = 12 }: { data: Item[]; pageSize?: number }) {
  const { fmt, axis } = useCurrency();
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(data.length / pageSize));
  const p = Math.min(page, pages - 1);
  const slice = data.slice(p * pageSize, (p + 1) * pageSize);
  return (
    <div>
      <div style={{ height: Math.max(260, slice.length * 72) }} className="w-full">
        <ResponsiveContainer>
          <BarChart data={slice} layout="vertical" margin={{ left: 0, right: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--line))" />
            <XAxis type="number" tickFormatter={axis} tick={tick} />
            <YAxis type="category" dataKey="name" width={150} tick={{ ...tick, fontSize: 10 }} />
            <Tooltip {...tip} formatter={(v: number) => fmt(v)} />
            <Legend />
            <Bar dataKey="consumable" name="Consumable Budget" fill={C1} radius={[0, 4, 4, 0]} />
            <Bar dataKey="consumed" name="Consumed Budget" fill={C2} radius={[0, 4, 4, 0]} />
            <Bar dataKey="available" name="Available Amount" fill={C3} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {pages > 1 && (
        <div className="mt-3 flex items-center justify-center gap-3 text-sm">
          <button disabled={p === 0} onClick={() => setPage(p - 1)} className="min-h-[44px] rounded-lg border border-line px-4 disabled:opacity-40">Sebelumnya</button>
          <span className="text-mute">{p + 1} / {pages}</span>
          <button disabled={p >= pages - 1} onClick={() => setPage(p + 1)} className="min-h-[44px] rounded-lg border border-line px-4 disabled:opacity-40">Berikutnya</button>
        </div>
      )}
    </div>
  );
}
