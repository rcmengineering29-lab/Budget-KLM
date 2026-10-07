create extension if not exists "pgcrypto";

create table if not exists public.budget_uploads (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  uploaded_at timestamptz not null default now(),
  uploaded_by uuid references auth.users(id),
  row_count int not null default 0
);

create table if not exists public.budget_data (
  id uuid primary key default gen_random_uuid(),
  upload_id uuid not null references public.budget_uploads(id) on delete cascade,
  tanggal date not null,
  jenis_budget text not null,
  kode text not null,
  uraian text not null,
  consumable_budget numeric not null default 0,
  consumed_budget numeric not null default 0,
  available_amount numeric not null default 0,
  current_budget numeric not null default 0,
  commitment_actuals numeric not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_tanggal on public.budget_data (tanggal);
create index if not exists idx_jenis_budget on public.budget_data (jenis_budget);
create index if not exists idx_kode on public.budget_data (kode);
create index if not exists idx_upload_id on public.budget_data (upload_id);

alter table public.budget_uploads enable row level security;
alter table public.budget_data enable row level security;

-- Baca: hanya user yang sudah login. Tulis: hanya lewat service role (API route), yang melewati RLS.
create policy "auth read uploads" on public.budget_uploads for select to authenticated using (true);
create policy "auth read data" on public.budget_data for select to authenticated using (true);
