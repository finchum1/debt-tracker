import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { Account, Group } from "../types";
import { GROUPS, GROUP_COLORS } from "../types";
import { formatCurrency, getCurrentBalance, getPreviousBalance, pct, sortedEntries } from "../lib/debt";
import { ChangeChip } from "./ChangeChip";
import { ProgressBar } from "./ProgressBar";

function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

interface CardPanelProps {
  account: Account;
  onUpdate: (id: string, patch: Partial<Account>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onAddEntry: (accountId: string, month: string, balance: number) => Promise<void>;
  onDeleteEntry: (entryId: string) => Promise<void>;
}

export function CardPanel({ account, onUpdate, onDelete, onAddEntry, onDeleteEntry }: CardPanelProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [newBalance, setNewBalance] = useState("");
  const [newMonth, setNewMonth] = useState(currentMonthKey());
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(account.name);

  const current = getCurrentBalance(account);
  const previous = getPreviousBalance(account);
  const change = current !== null && previous !== null ? pct(current, previous) : null;
  const startNum = account.starting_balance !== null ? Number(account.starting_balance) : null;
  const groupColor = GROUP_COLORS[account.category] ?? GROUP_COLORS.Other;
  const entries = sortedEntries(account);

  function parseNumber(val: string): number | null {
    const num = parseFloat(val.replace(/[^0-9.]/g, ""));
    return Number.isNaN(num) ? null : num;
  }

  async function saveName() {
    setEditingName(false);
    if (nameInput.trim() && nameInput !== account.name) {
      await onUpdate(account.id, { name: nameInput.trim() });
    } else {
      setNameInput(account.name);
    }
  }

  async function handleAddEntry() {
    const bal = parseNumber(newBalance);
    if (bal === null) return;
    await onAddEntry(account.id, newMonth, bal);
    setNewBalance("");
  }

  return (
    <div
      style={{
        background: "#0f172a",
        border: "1px solid #1e293b",
        borderTop: `2px solid ${groupColor}`,
        borderRadius: 16,
        padding: "20px 24px 20px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
        <div>
          {editingName ? (
            <input
              autoFocus
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={saveName}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveName();
              }}
              style={{
                background: "#1e293b",
                border: "1px solid #3b82f6",
                borderRadius: 8,
                color: "#f1f5f9",
                fontSize: 17,
                fontWeight: 700,
                padding: "4px 10px",
                outline: "none",
              }}
            />
          ) : (
            <button
              onClick={() => {
                setNameInput(account.name);
                setEditingName(true);
              }}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "block" }}
            >
              <span style={{ color: "#f1f5f9", fontSize: 17, fontWeight: 700, letterSpacing: "-0.01em" }}>
                {account.name}
              </span>
              <span style={{ color: "#475569", fontSize: 12, marginLeft: 6 }}>✎</span>
            </button>
          )}
          <div style={{ marginTop: 6 }}>
            <select
              value={account.category}
              onChange={(e) => onUpdate(account.id, { category: e.target.value as Group })}
              style={{
                background: "#1e293b",
                border: `1px solid ${groupColor}40`,
                borderRadius: 6,
                color: groupColor,
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                padding: "3px 6px",
                outline: "none",
                cursor: "pointer",
              }}
            >
              {GROUPS.map((g) => (
                <option key={g} value={g} style={{ color: "#f1f5f9", background: "#1e293b" }}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={() => onDelete(account.id)}
          title="Remove account"
          style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 18, lineHeight: 1 }}
        >
          ×
        </button>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16, marginTop: 8, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 110px" }}>
          <FieldLabel>Starting Balance</FieldLabel>
          <input
            type="text"
            placeholder="$0.00"
            defaultValue={account.starting_balance ?? ""}
            onBlur={(e) => onUpdate(account.id, { starting_balance: parseNumber(e.target.value) })}
            style={fieldInputStyle}
          />
        </div>
        <div style={{ flex: "1 1 110px" }}>
          <FieldLabel>Monthly Payment</FieldLabel>
          <input
            type="text"
            placeholder="$0.00"
            defaultValue={account.monthly_payment ?? ""}
            onBlur={(e) => onUpdate(account.id, { monthly_payment: parseNumber(e.target.value) })}
            style={fieldInputStyle}
          />
        </div>
        <div style={{ flex: "1 1 80px" }}>
          <FieldLabel>APR</FieldLabel>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="0.00"
              defaultValue={account.apr ?? ""}
              onBlur={(e) => onUpdate(account.id, { apr: parseNumber(e.target.value) })}
              style={{
                ...fieldInputStyle,
                border: `1px solid ${account.apr !== null && Number(account.apr) >= 20 ? "#ef444460" : "#334155"}`,
                color: account.apr !== null && Number(account.apr) >= 20 ? "#fca5a5" : "#f1f5f9",
                padding: "8px 22px 8px 12px",
              }}
            />
            <span
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 13,
                color: "#475569",
                pointerEvents: "none",
              }}
            >
              %
            </span>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 4 }}>
        <FieldLabel>Current Balance</FieldLabel>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span
            style={{
              fontSize: 30,
              fontWeight: 800,
              color: "#f1f5f9",
              letterSpacing: "-0.03em",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {current !== null ? formatCurrency(current) : "—"}
          </span>
          {entries.length > 1 && (
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 10, color: "#475569" }}>vs last month</span>
              <ChangeChip value={change} />
            </span>
          )}
        </div>
        {startNum !== null && current !== null && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}>
            <span style={{ fontSize: 10, color: "#475569" }}>vs starting balance</span>
            <ChangeChip value={pct(current, startNum)} />
          </div>
        )}
      </div>

      {startNum !== null && current !== null && <ProgressBar start={startNum} current={current} />}

      <div style={{ marginTop: 20, background: "#1e293b", borderRadius: 10, padding: "14px 14px 12px" }}>
        <FieldLabel>Add Monthly Update</FieldLabel>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            type="month"
            value={newMonth}
            onChange={(e) => setNewMonth(e.target.value)}
            style={{
              background: "#0f172a",
              border: "1px solid #334155",
              borderRadius: 8,
              color: "#94a3b8",
              fontSize: 13,
              padding: "7px 10px",
              outline: "none",
            }}
          />
          <input
            type="text"
            placeholder="New balance"
            value={newBalance}
            onChange={(e) => setNewBalance(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddEntry();
            }}
            style={{
              background: "#0f172a",
              border: "1px solid #334155",
              borderRadius: 8,
              color: "#f1f5f9",
              fontSize: 14,
              padding: "7px 12px",
              flex: 1,
              minWidth: 100,
              outline: "none",
            }}
          />
          <button
            onClick={handleAddEntry}
            style={{
              background: "#3b82f6",
              border: "none",
              borderRadius: 8,
              color: "#fff",
              fontWeight: 700,
              fontSize: 13,
              padding: "7px 16px",
              cursor: "pointer",
            }}
          >
            Save
          </button>
        </div>
      </div>

      {entries.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <button
            onClick={() => setShowHistory((h) => !h)}
            style={{ background: "none", border: "none", color: "#3b82f6", fontSize: 12, cursor: "pointer", padding: 0 }}
          >
            {showHistory ? "▲ Hide history" : `▼ Show history (${entries.length} entries)`}
          </button>
          {showHistory && (
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
              {[...entries].reverse().map((entry, ri) => {
                const idx = entries.length - 1 - ri;
                const prevBal =
                  idx === 0
                    ? account.starting_balance !== null
                      ? Number(account.starting_balance)
                      : null
                    : Number(entries[idx - 1].balance);
                const changePct = pct(Number(entry.balance), prevBal);
                return (
                  <div
                    key={entry.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "6px 10px",
                      background: "#0f172a",
                      borderRadius: 8,
                      fontSize: 13,
                    }}
                  >
                    <span style={{ color: "#64748b" }}>
                      {new Date(`${entry.month}-01`).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span style={{ color: "#f1f5f9", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                      {formatCurrency(entry.balance)}
                    </span>
                    <ChangeChip value={changePct} />
                    <button
                      onClick={() => onDeleteEntry(entry.id)}
                      title="Delete entry"
                      style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 15, marginLeft: 4 }}
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <div style={{ fontSize: 11, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
      {children}
    </div>
  );
}

const fieldInputStyle: CSSProperties = {
  background: "#1e293b",
  border: "1px solid #334155",
  borderRadius: 8,
  color: "#f1f5f9",
  fontSize: 16,
  fontWeight: 600,
  padding: "8px 12px",
  width: "100%",
  boxSizing: "border-box",
  outline: "none",
};
