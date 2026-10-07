"use client";
import { useUploads } from "@/hooks/use-budget";

export default function HistoryPage() {
  const { data = [], isLoading } = useUploads();
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Riwayat Upload</h1>
      {isLoading && <p className="text-sm text-mute">Memuat…</p>}
      {!isLoading && data.length === 0 && <p className="text-sm text-mute">Belum ada upload.</p>}
      <div className="overflow-x-auto rounded-xl border border-line bg-panel">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="border-b border-line text-mute"><tr><th className="px-3 py-2 font-medium">File</th><th className="px-3 py-2 font-medium">Waktu</th><th className="px-3 py-2 font-medium">Baris</th></tr></thead>
          <tbody>
            {data.map((u) => (
              <tr key={u.id} className="border-b border-line/60 last:border-0">
                <td className="px-3 py-2">{u.file_name}</td>
                <td className="px-3 py-2">{new Date(u.uploaded_at).toLocaleString("id-ID")}</td>
                <td className="px-3 py-2 tabular-nums">{u.row_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
