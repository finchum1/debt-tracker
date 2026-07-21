import type { Account } from "../types";

export function formatCurrency(val: number | null | undefined): string {
  if (val === null || val === undefined || Number.isNaN(Number(val))) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(val));
}

export function pct(current: number, previous: number | null | undefined): number | null {
  if (!previous || Number.isNaN(previous) || previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

export function sortedEntries(account: Account) {
  return [...account.entries].sort((a, b) => (a.month < b.month ? -1 : a.month > b.month ? 1 : 0));
}

export function getCurrentBalance(account: Account): number | null {
  const entries = sortedEntries(account);
  if (entries.length === 0) {
    return account.starting_balance !== null ? Number(account.starting_balance) : null;
  }
  return Number(entries[entries.length - 1].balance);
}

export function getPreviousBalance(account: Account): number | null {
  const entries = sortedEntries(account);
  if (entries.length === 0) return null;
  if (entries.length === 1) {
    return account.starting_balance !== null ? Number(account.starting_balance) : null;
  }
  return Number(entries[entries.length - 2].balance);
}
