import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import type { Account, BalanceEntry, Group } from "../types";

export function useAccounts(userId: string | undefined) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) return;
    const [{ data: accountRows, error: accountsError }, { data: entryRows, error: entriesError }] =
      await Promise.all([
        supabase.from("accounts").select("*").order("sort_order", { ascending: true }),
        supabase.from("balance_entries").select("*").order("month", { ascending: true }),
      ]);

    if (accountsError) throw accountsError;
    if (entriesError) throw entriesError;

    const entriesByAccount = new Map<string, BalanceEntry[]>();
    for (const entry of entryRows ?? []) {
      const list = entriesByAccount.get(entry.account_id) ?? [];
      list.push(entry as BalanceEntry);
      entriesByAccount.set(entry.account_id, list);
    }

    const merged: Account[] = (accountRows ?? []).map((row) => ({
      ...(row as Omit<Account, "entries">),
      entries: entriesByAccount.get(row.id) ?? [],
    }));

    setAccounts(merged);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    setLoading(true);
    refresh();
  }, [refresh]);

  // Cross-device sync: re-fetch whenever another session changes the data.
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel("debt-tracker-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "accounts" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "balance_entries" }, () => refresh())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, refresh]);

  async function addAccount(category: Group) {
    if (!userId) return;
    const { error } = await supabase.from("accounts").insert({
      user_id: userId,
      name: "New Account",
      category,
    });
    if (error) throw error;
    await refresh();
  }

  async function updateAccount(id: string, patch: Partial<Account>) {
    const { entries: _entries, ...rest } = patch;
    const { error } = await supabase.from("accounts").update(rest).eq("id", id);
    if (error) throw error;
    await refresh();
  }

  async function deleteAccount(id: string) {
    const { error } = await supabase.from("accounts").delete().eq("id", id);
    if (error) throw error;
    await refresh();
  }

  async function addEntry(accountId: string, month: string, balance: number) {
    const { error } = await supabase.from("balance_entries").insert({
      account_id: accountId,
      month,
      balance,
    });
    if (error) throw error;
    await refresh();
  }

  async function deleteEntry(entryId: string) {
    const { error } = await supabase.from("balance_entries").delete().eq("id", entryId);
    if (error) throw error;
    await refresh();
  }

  return { accounts, loading, addAccount, updateAccount, deleteAccount, addEntry, deleteEntry };
}
