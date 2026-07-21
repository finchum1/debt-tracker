-- Finchum Family Debt Tracker — Supabase schema
-- Run this once in the Supabase SQL Editor (Project -> SQL Editor -> New query).
--
-- Access model: private per-user data. Anyone can self-service sign up (see
-- the app's Sign Up form), but each user only ever sees their own accounts —
-- row-level security scopes every row to auth.uid(), so one person's balances
-- are never visible to another user.

create extension if not exists "pgcrypto";

create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null default 'New Account',
  category text not null default 'Credit Card'
    check (category in ('Credit Card', 'Real Estate', 'Autos', 'Other')),
  starting_balance numeric,
  monthly_payment numeric,
  apr numeric,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists balance_entries (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts(id) on delete cascade,
  month text not null, -- 'YYYY-MM'
  balance numeric not null,
  created_at timestamptz not null default now()
);

create index if not exists balance_entries_account_id_idx on balance_entries(account_id);
create index if not exists accounts_user_id_idx on accounts(user_id);

alter table accounts enable row level security;
alter table balance_entries enable row level security;

-- Each user can only see/edit their own accounts.
drop policy if exists "accounts_owner_all" on accounts;
drop policy if exists "accounts_family_all" on accounts;
create policy "accounts_owner_all" on accounts
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Each user can only see/edit balance entries belonging to their own accounts.
drop policy if exists "balance_entries_owner_all" on balance_entries;
drop policy if exists "balance_entries_family_all" on balance_entries;
create policy "balance_entries_owner_all" on balance_entries
  for all
  using (
    exists (
      select 1 from accounts a
      where a.id = balance_entries.account_id
        and a.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from accounts a
      where a.id = balance_entries.account_id
        and a.user_id = auth.uid()
    )
  );

-- Enable realtime updates so changes on one device show up on others without a manual refresh.
alter publication supabase_realtime add table accounts;
alter publication supabase_realtime add table balance_entries;
