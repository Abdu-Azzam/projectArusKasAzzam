-- 1. Buat extension jika belum ada
create extension if not exists pgcrypto;

-- 2. Buat tabel transaksi
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  amount numeric(12,2) not null check (amount > 0),
  type text not null check (type in ('income', 'expense')),
  category text not null check (category in ('Transport', 'Gaji', 'Makan', 'Lainnya')),
  date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Trigger untuk updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists transactions_updated_at on public.transactions;
create trigger transactions_updated_at
before update on public.transactions
for each row
execute function public.handle_updated_at();

-- 4. Aktifkan RLS
alter table public.transactions enable row level security;

-- 5. Policy agar tiap user hanya lihat/mengelola data miliknya sendiri
create policy "Users can view own transactions"
on public.transactions
for select
using (auth.uid() = user_id);

create policy "Users can insert own transactions"
on public.transactions
for insert
with check (auth.uid() = user_id);

create policy "Users can update own transactions"
on public.transactions
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own transactions"
on public.transactions
for delete
using (auth.uid() = user_id);

-- 6. Optional: contoh data awal hanya untuk user yang login, tidak dipakai di production
-- insert into public.transactions (user_id, title, amount, type, category, date)
-- values
--   ((select id from auth.users limit 1), 'Gaji', 4800000, 'income', 'Gaji', '2026-10-01');
