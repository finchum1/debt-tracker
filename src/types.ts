export const GROUPS = ["Credit Card", "Real Estate", "Autos", "Other"] as const;
export type Group = (typeof GROUPS)[number];

export const GROUP_COLORS: Record<Group, string> = {
  "Credit Card": "#3b82f6",
  "Real Estate": "#a855f7",
  Autos: "#f59e0b",
  Other: "#64748b",
};

export interface BalanceEntry {
  id: string;
  account_id: string;
  month: string; // 'YYYY-MM'
  balance: number;
  created_at: string;
}

export interface Account {
  id: string;
  user_id: string;
  name: string;
  category: Group;
  starting_balance: number | null;
  monthly_payment: number | null;
  apr: number | null;
  sort_order: number;
  created_at: string;
  entries: BalanceEntry[];
}
