# Finchum Debt Tracker

A React + Supabase rebuild of the family debt-tracking dashboard, with real auth
and a real database so balances stay in sync across every device.

Groups debt accounts into **Credit Card / Real Estate / Autos / Other**, tracks
monthly balances with green/red percent-change chips, APR, monthly payment,
payoff progress bars, and grand-total summaries.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free project (any
   name/region is fine).
2. In the project dashboard, open **SQL Editor → New query**, paste in the
   contents of [`supabase/schema.sql`](supabase/schema.sql), and run it. This
   creates the `accounts` and `balance_entries` tables with row-level security
   so only the signed-in user's data is ever visible, and turns on realtime
   sync for both tables.
3. Open **Project Settings → Data API**. Copy the **Project URL** and the
   **anon public** key — you'll need both in step 3 below.

## 2. Signup is self-service — each person gets their own private account

The app's header has **Log in** / **Sign up** buttons. Anyone can create their
own account from the Sign Up form (email + password) — there's no invite step
or admin approval. Each account's debt data is completely private: row-level
security scopes every row to `auth.uid()`, so no user can ever see another
user's balances.

By default, Supabase requires email confirmation before a new account can
sign in — after signing up, the app shows "check your email to confirm it."
If you'd rather skip that step during testing (or for a small trusted group),
go to **Authentication → Providers → Email** and turn off **Confirm email**
— new signups will then be signed in immediately.

**Security note:** because signup is open to anyone with the link, this is
appropriate once you're comfortable with strangers being able to create
accounts (each isolated to their own private data). If you want to restrict
who can sign up at all (e.g. only people you invite), that needs to be
configured in Supabase (disable public signups and invite users manually
instead) — not something the current app UI does.

## 3. Configure and run the app

```bash
cp .env.example .env
# edit .env and paste in your Project URL + anon key from step 1.3
npm install
npm run dev
```

Visit the printed local URL, click **Sign up** in the header to create an
account, and start adding accounts.

## 4. Deploy for real cross-device use

The app is a static Vite build, so it can be hosted anywhere that serves
static files (Vercel, Netlify, Cloudflare Pages, etc.):

```bash
npm run build   # outputs to dist/
```

Set the same two `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` environment
variables on whichever host you deploy to. The anon key is safe to expose
publicly — it only allows what the row-level security policies in
`supabase/schema.sql` permit (each row scoped to its owning user).

## How data is organized

- **`accounts`** — one row per debt account: name, category (Credit Card /
  Real Estate / Autos / Other), starting balance, monthly payment, APR.
- **`balance_entries`** — one row per monthly balance update for an account.
  The most recent entry (by month) is the account's current balance; the one
  before it is used for the "vs last month" percent-change chip.
- Every row is scoped to the signed-in user via Postgres row-level security
  (`auth.uid()`), and Supabase Realtime pushes changes to every open device
  automatically — no manual refresh needed after adding an update on your
  phone before checking it on your laptop.

## Project structure

```
src/
  components/   Header, AuthModal (sign in/up), CardPanel (per-account card), GroupSection, ChangeChip, ProgressBar
  hooks/        useAuth (session), useAccounts (data fetch/mutate + realtime sync)
  lib/          supabaseClient, debt math helpers (formatCurrency, pct, etc.)
  types.ts      Account/BalanceEntry/Group types + GROUP_COLORS
supabase/
  schema.sql    Tables + RLS policies + realtime publication
```
