-- One row per user, holding the whole Goals module state as JSON, keyed by month.
-- Same pattern as bill_tracker: no per-row normalization needed for a simple
-- "list of short text goals per category per month" shape.

create table if not exists goals_tracker (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table goals_tracker enable row level security;

create policy "Users can view their own goals data"
  on goals_tracker for select
  using (auth.uid() = user_id);

create policy "Users can insert their own goals data"
  on goals_tracker for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own goals data"
  on goals_tracker for update
  using (auth.uid() = user_id);
