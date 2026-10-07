-- Jalankan ini HANYA jika 001 versi lama (akses publik) sudah pernah dijalankan.
drop policy if exists "read uploads" on public.budget_uploads;
drop policy if exists "read data" on public.budget_data;
drop policy if exists "auth read uploads" on public.budget_uploads;
drop policy if exists "auth read data" on public.budget_data;
create policy "auth read uploads" on public.budget_uploads for select to authenticated using (true);
create policy "auth read data" on public.budget_data for select to authenticated using (true);
