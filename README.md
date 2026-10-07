# Budget KLM

Dashboard monitoring budget harian: upload Excel → simpan ke Supabase → KPI, grafik, dan kartu budget dengan warna otomatis. Mendukung mode gelap.

Stack: Next.js 14 (App Router) · TypeScript · Tailwind · Recharts · SheetJS · TanStack Query · Supabase · Netlify.

## 1. Setup Supabase
1. Buat project di https://supabase.com.
2. Buka **SQL Editor**, jalankan isi `supabase/migrations/001_init.sql`.
3. Di **Project Settings → API**, salin `Project URL`, `anon key`, dan `service_role key`.

## 2. Jalankan lokal
```bash
cp .env.example .env.local   # isi nilainya
npm install
npm run dev                  # http://localhost:3000
```

## 3. Format Excel
Baris pertama harus berisi kolom persis: `Tanggal, Jenis Budget, Kode, Uraian, Consumable Budget, Consumed Budget, Available Amount, Current Budget, Commitment/Actuals`.
Tanggal boleh `03 OKTOBER 2026` atau sel tanggal Excel. Upload ulang untuk tanggal yang sama **menggantikan** data tanggal itu.

## 4. Deploy ke Netlify
1. Push ke GitHub: `git init && git add . && git commit -m "init" && git remote add origin <url> && git push -u origin main`.
2. Netlify → **Add new site → Import from Git**. Build command & plugin sudah diatur di `netlify.toml`.
3. Isi **Environment variables** sama seperti `.env.example`.

## Keamanan
Belum ada login. Dashboard bisa dibaca siapa saja yang punya URL. Upload dilindungi `UPLOAD_PASSCODE` (isi di env; kosong = terbuka). Untuk akses per-user, tambahkan Supabase Auth dan ganti policy `select` di migrasi menjadi `to authenticated`.
