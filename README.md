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

## 5. Aturan perhitungan
- **DEPR:** baris yang Uraian-nya mengandung `DEPR` tetap tampil sebagai kartu (diberi penanda), tetapi **tidak dihitung** di KPI, ringkasan Capex/Opex, dan grafik.
- **Capex / Opex:** ditentukan dari awalan Jenis Budget. `I20…` = Capex, `20D…` = Opex, lainnya = "Lainnya". Ubah aturan di `lib/utils/classify.ts`.

## 6. Mata uang
Data disimpan dalam USD. Tampilan default USD. Klik tombol mata uang di header (atau halaman Pengaturan), ketik/pilih kode (mis. `IDR`), lalu pilih:
- **Otomatis:** kurs dari open.er-api.com, di-cache 12 jam di browser.
- **Manual:** isi sendiri `1 USD = …` (mis. `18500`, `18.500`, atau `18,500`). Cocok untuk kurs budget perusahaan atau kode yang tidak ada di sumber kurs.
Pilihan disimpan per perangkat.

## 7. Bagikan ke WhatsApp
Di dashboard klik **Bagikan ke WhatsApp**, centang item yang ingin dikirim (atau pakai Pilih semua / Tanpa DEPR), lalu **Salin teks** atau **Kirim ke WhatsApp**. Pesan tersusun per Capex/Opex dengan ringkasan total, memakai mata uang yang sedang aktif. Format pesan ada di `lib/utils/wa.ts`.

## 8. Deploy Netlify
1. Push ke GitHub, lalu Netlify → **Import from Git**. Build sudah diatur di `netlify.toml`.
2. Isi environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
3. Deploy ulang setiap kali mengubah variabel `NEXT_PUBLIC_*`.
