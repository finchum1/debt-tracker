-- One row per user, holding the whole app state as JSON (bills, statuses, notes).
-- This mirrors how the data was already shaped in the Claude.ai artifact version,
-- so no data-modeling changes are needed beyond adding user_id + auth.

create table if not exists bill_tracker (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table bill_tracker enable row level security;

create policy "Users can view their own bill tracker data"
  on bill_tracker for select
  using (auth.uid() = user_id);

create policy "Users can insert their own bill tracker data"
  on bill_tracker for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own bill tracker data"
  on bill_tracker for update
  using (auth.uid() = user_id);
