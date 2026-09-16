-- ═══════════════════════════════════════════
--  APEX — Payment Requests Schema
--  شغّل في Supabase SQL Editor
-- ═══════════════════════════════════════════

create table if not exists public.payment_requests (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  user_email  text not null,
  plan        text not null check (plan in ('pro','team')),
  method      text not null check (method in ('syriatel','mtn','usdt','bank')),
  amount      text,
  reference   text not null,
  notes       text,
  status      text default 'pending' check (status in ('pending','approved','rejected')),
  admin_note  text,
  reviewed_at timestamptz,
  created_at  timestamptz default now()
);

-- أعمدة Stripe لجدول profiles (إن لم تكن موجودة)
alter table public.profiles
  add column if not exists plan_started_at timestamptz,
  add column if not exists plan_expires_at timestamptz;

-- RLS
alter table public.payment_requests enable row level security;

create policy "users view own requests"
  on public.payment_requests for select
  using (auth.uid() = user_id);

create policy "users insert own requests"
  on public.payment_requests for insert
  with check (auth.uid() = user_id);

-- Index
create index if not exists payment_requests_status_idx
  on public.payment_requests(status, created_at desc);

create index if not exists payment_requests_user_idx
  on public.payment_requests(user_id);