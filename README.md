# Budget KLM

Dashboard monitoring budget harian: login → upload Excel (USD) → KPI, grafik, kartu budget. Mendukung mode gelap dan pilihan mata uang tampilan.

Stack: Next.js 14 · TypeScript · Tailwind · Recharts · SheetJS · TanStack Query · Supabase (Auth + Postgres) · Netlify.

## 1. Setup Supabase
1. Buat project di https://supabase.com.
2. **SQL Editor** → jalankan `supabase/migrations/001_init.sql`. (Jika sebelumnya sudah menjalankan versi lama yang publik, jalankan `002_auth_policies.sql`.)
3. **Project Settings → API**: salin `Project URL`, `anon key`, `service_role key`.

## 2. Akun login (tanpa pendaftaran)
Aplikasi tidak punya halaman daftar. Akun dibuat admin:
1. **Authentication → Sign In / Providers → Email**: matikan **Allow new users to sign up** (wajib, agar orang luar tidak bisa mendaftar lewat API).
2. **Authentication → Users → Add user → Create new user**: isi email & password, centang **Auto Confirm User**.
3. Untuk mencabut akses, hapus user di halaman yang sama.

## 3. Jalankan lokal
```bash
cp .env.example .env.local   # isi nilainya
npm install
npm run dev                  # http://localhost:3000
```

## 4. Format Excel
Kolom persis: `Tanggal, Jenis Budget, Kode, Uraian, Consumable Budget, Consumed Budget, Available Amount, Current Budget, Commitment/Actuals`.
- Semua nilai uang dibaca sebagai **USD**.
- Tanggal boleh `03 OKTOBER 2026` atau sel tanggal Excel.
- Upload ulang untuk tanggal yang sama **menggantikan** data tanggal itu.

## 5. Mata uang
Data disimpan dalam USD. Tampilan default USD; ganti lewat dropdown di header atau halaman Pengaturan (pilihan diingat per perangkat). Kurs diambil dari open.er-api.com dan di-cache 12 jam di browser. Jika gagal dimuat, dipakai kurs perkiraan (ditandai di Pengaturan). Untuk laporan resmi, gunakan kurs yang disepakati perusahaan. Daftar mata uang ada di `components/currency-provider.tsx`.

## 6. Deploy Netlify
1. Push ke GitHub, lalu Netlify → **Import from Git**. Build sudah diatur di `netlify.toml`.
2. Isi environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
3. Deploy ulang setiap kali mengubah variabel `NEXT_PUBLIC_*`.
