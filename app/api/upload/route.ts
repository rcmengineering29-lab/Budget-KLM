import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { BudgetRow } from "@/types/budget";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) return NextResponse.json({ error: "Supabase belum dikonfigurasi di server." }, { status: 500 });

  const { fileName, rows } = (await req.json()) as { fileName: string; rows: BudgetRow[] };
  if (!Array.isArray(rows) || !rows.length) return NextResponse.json({ error: "Tidak ada baris untuk disimpan." }, { status: 400 });

  const db = createClient(url, service, { auth: { persistSession: false } });

  const token = req.headers.get("authorization")?.replace(/^Bearer /i, "");
  const { data: auth } = token ? await db.auth.getUser(token) : { data: { user: null } };
  if (!auth.user) return NextResponse.json({ error: "Sesi login tidak valid. Silakan login ulang." }, { status: 401 });

  const { data: up, error: e1 } = await db.from("budget_uploads").insert({ file_name: fileName, row_count: rows.length, uploaded_by: auth.user.id }).select("id").single();
  if (e1 || !up) return NextResponse.json({ error: e1?.message ?? "Gagal membuat catatan upload." }, { status: 500 });

  // Upload ulang untuk tanggal yang sama menggantikan data lama.
  const dates = [...new Set(rows.map((r) => r.tanggal))];
  const { error: e2 } = await db.from("budget_data").delete().in("tanggal", dates);
  if (e2) return NextResponse.json({ error: e2.message }, { status: 500 });

  for (let i = 0; i < rows.length; i += 500) {
    const chunk = rows.slice(i, i + 500).map((r) => ({ ...r, upload_id: up.id }));
    const { error } = await db.from("budget_data").insert(chunk);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, count: rows.length, dates });
}
