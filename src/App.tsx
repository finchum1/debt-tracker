import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import { Check } from "lucide-react";
import { useAuth } from "./hooks/useAuth";
import { useAccounts } from "./hooks/useAccounts";
import { useTheme } from "./hooks/useTheme";
import { Header } from "./components/Header";
import { AuthModal } from "./components/AuthModal";
import { GroupSection } from "./components/GroupSection";
import { ChangeChip } from "./components/ChangeChip";
import { ProgressBar } from "./components/ProgressBar";
import BillTracker from "./components/BillTracker.jsx";
import GoalsTracker from "./components/GoalsTracker";
import { GROUPS, GROUP_COLORS } from "./types";
import { formatCurrency, getCurrentBalance, pct } from "./lib/debt";

function Dashboard({ userId }: { userId: string }) {
  const { colors } = useTheme();
  const { accounts, loading, addAccount, updateAccount, deleteAccount, addEntry, deleteEntry } =
    useAccounts(userId);

  const totals = useMemo(() => {
    const totalStart = accounts.reduce(
      (sum, a) => (a.starting_balance !== null ? sum + Number(a.starting_balance) : sum),
      0
    );
    const totalCurrent = accounts.reduce((sum, a) => {
      const cur = getCurrentBalance(a);
      return cur !== null ? sum + cur : sum;
    }, 0);
    const totalPaid = totalStart - totalCurrent;
    const totalPct = totalStart > 0 ? pct(totalCurrent, totalStart) : null;
    const totalMonthly = accounts.reduce(
      (sum, a) => (a.monthly_payment !== null ? sum + Number(a.monthly_payment) : sum),
      0
    );

    const aprWeightedSum = accounts.reduce((sum, a) => {
      const cur = getCurrentBalance(a);
      if (cur !== null && a.apr !== null) return sum + cur * Number(a.apr);
      return sum;
    }, 0);
    const aprWeightBase = accounts.reduce((sum, a) => {
      const cur = getCurrentBalance(a);
      return cur !== null && a.apr !== null ? sum + cur : sum;
    }, 0);
    const avgApr = aprWeightBase > 0 ? aprWeightedSum / aprWeightBase : null;

    return { totalStart, totalCurrent, totalPaid, totalPct, totalMonthly, avgApr };
  }, [accounts]);

  const emptyGroups = GROUPS.filter((g) => accounts.filter((a) => a.category === g).length === 0);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: colors.bg,
          color: colors.textMuted,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          fontFamily: "'Outfit', -apple-system, sans-serif",
        }}
      >
        <div className="spinner" />
        <span style={{ fontSize: 13 }}>Loading your accounts…</span>
      </div>
    );
  }

  const statCards: { label: string; value: string; color: string; big?: boolean }[] = [
    { label: "Starting Grand Total", value: formatCurrency(totals.totalStart), color: colors.textMuted3 },
    { label: "Current Total Balance", value: formatCurrency(totals.totalCurrent), color: colors.text, big: true },
    {
      label: "Total Paid Off",
      value: formatCurrency(totals.totalPaid),
      color: totals.totalPaid >= 0 ? colors.green : colors.red,
    },
    { label: "Total Monthly Payments", value: formatCurrency(totals.totalMonthly), color: colors.sky },
  ];
  if (totals.avgApr !== null) {
    statCards.push({
      label: "Avg APR (weighted)",
      value: `${totals.avgApr.toFixed(2)}%`,
      color: totals.avgApr >= 20 ? colors.redSoft : colors.text,
    });
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.bg,
        fontFamily: "'Outfit', -apple-system, sans-serif",
        color: colors.text,
        padding: "0 0 60px",
      }}
    >
      <div
        style={{
          background: `linear-gradient(180deg, ${colors.surface} 0%, ${colors.bg} 100%)`,
          borderBottom: `1px solid ${colors.border}`,
          padding: "32px 24px 24px",
          maxWidth: 980,
          margin: "0 auto",
        }}
      >
        <div>
          <div style={{ fontSize: 11, color: colors.accent, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>
            Oaksteadly
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", margin: 0, marginBottom: 4 }}>
            Total Debt Dashboard
          </h1>
          <p style={{ color: colors.textMuted2, fontSize: 14, margin: 0 }}>Track balances by category. Green means progress.</p>
        </div>

        <div style={{ marginTop: 24, display: "flex", gap: 20, flexWrap: "wrap" }}>
          {statCards.map(({ label, value, color, big }) => (
            <div
              key={label}
              style={{
                background: colors.surface,
                border: big ? `1px solid ${colors.accent}` : `1px solid ${colors.border}`,
                borderRadius: 12,
                padding: "12px 18px",
                minWidth: 160,
              }}
            >
              <div style={{ fontSize: 11, color: colors.textMuted2, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>
                {label}
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>
                {value}
              </div>
            </div>
          ))}
          <div
            style={{
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: 12,
              padding: "12px 18px",
              minWidth: 130,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div style={{ fontSize: 11, color: colors.textMuted2, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
              Overall Change
            </div>
            {totals.totalPct !== null ? (
              <ChangeChip value={totals.totalPct} />
            ) : (
              <span style={{ color: colors.borderInput, fontSize: 13 }}>Enter starting balances</span>
            )}
          </div>
        </div>

        <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {GROUPS.map((g) => {
            const groupAccounts = accounts.filter((a) => a.category === g);
            if (groupAccounts.length === 0) return null;
            const gTotal = groupAccounts.reduce((sum, a) => {
              const cur = getCurrentBalance(a);
              return cur !== null ? sum + cur : sum;
            }, 0);
            const color = GROUP_COLORS[g];
            return (
              <div
                key={g}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: colors.surface,
                  border: `1px solid ${color}40`,
                  borderRadius: 99,
                  padding: "5px 12px 5px 8px",
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: 99, background: color }} />
                <span style={{ fontSize: 12, color: colors.textMuted3 }}>{g}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: colors.text }}>{formatCurrency(gTotal)}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ maxWidth: 980, margin: "0 auto", padding: "28px 24px 0" }}>
        {GROUPS.map((group) => (
          <GroupSection
            key={group}
            group={group}
            accounts={accounts.filter((a) => a.category === group)}
            onUpdate={updateAccount}
            onDelete={deleteAccount}
            onAddEntry={addEntry}
            onDeleteEntry={deleteEntry}
            onAddAccount={addAccount}
          />
        ))}

        {emptyGroups.length > 0 && (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
            {emptyGroups.map((g) => (
              <button
                key={g}
                onClick={() => addAccount(g)}
                className="transition-colors duration-150 active:scale-[0.97]"
                style={{
                  background: "none",
                  border: `2px dashed ${GROUP_COLORS[g]}40`,
                  borderRadius: 12,
                  color: GROUP_COLORS[g],
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: "10px 16px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${GROUP_COLORS[g]}80`)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = `${GROUP_COLORS[g]}40`)}
              >
                + Start {g} group
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PreviewCard({
  title,
  subtitle,
  accent,
  children,
}: {
  title: string;
  subtitle: string;
  accent: string;
  children: ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <div
      className="transition-shadow duration-200"
      style={{
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        borderTop: `2px solid ${accent}`,
        borderRadius: 16,
        padding: "18px 20px 20px",
        textAlign: "left",
        boxShadow: colors.shadow,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = colors.shadowHover)}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = colors.shadow)}
    >
      <div style={{ fontSize: 11, color: accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>
        {title}
      </div>
      <div style={{ fontSize: 12.5, color: colors.textMuted2, marginBottom: 16 }}>{subtitle}</div>
      {children}
    </div>
  );
}

function MiniCheck({ checked, color }: { checked: boolean; color: string }) {
  const { colors } = useTheme();
  return (
    <span
      style={{
        width: 18,
        height: 18,
        borderRadius: 5,
        border: `1.5px solid ${checked ? color : colors.borderInput}`,
        background: checked ? color : "transparent",
        color: colors.text,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {checked && <Check size={11} strokeWidth={3} color="#fff" />}
    </span>
  );
}

function DebtsPreview() {
  const { colors } = useTheme();
  const start = 6000;
  const current = 4200;
  const accent = GROUP_COLORS["Credit Card"];
  return (
    <PreviewCard title="Debts" subtitle="Track payoff by category" accent={accent}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
        <span style={{ fontSize: 14, fontWeight: 700 }}>Chase Sapphire</span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: accent,
            border: `1px solid ${accent}40`,
            borderRadius: 6,
            padding: "2px 6px",
          }}
        >
          Credit Card
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>
          {formatCurrency(current)}
        </span>
        <ChangeChip value={-3.5} />
      </div>
      <ProgressBar start={start} current={current} />
      <div style={{ marginTop: 14, fontSize: 11, color: colors.textMuted2 }}>Example data — not your real accounts</div>
    </PreviewCard>
  );
}

function BillsPreview() {
  const { colors } = useTheme();
  const rows: { day: string; name: string; amount: number; paid: boolean; cleared: boolean }[] = [
    { day: "05", name: "Electric", amount: 150, paid: true, cleared: true },
    { day: "12", name: "Rent", amount: 1200, paid: false, cleared: false },
  ];
  return (
    <PreviewCard title="Bills" subtitle="Never miss a due date" accent={colors.amber}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {rows.map((r) => (
          <div key={r.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 22, fontSize: 12.5, color: colors.textMuted2, fontVariantNumeric: "tabular-nums" }}>
              {r.day}
            </span>
            <span style={{ flex: 1, fontSize: 13.5 }}>{r.name}</span>
            <span style={{ fontSize: 13.5, fontVariantNumeric: "tabular-nums", marginRight: 4 }}>
              {formatCurrency(r.amount)}
            </span>
            <MiniCheck checked={r.paid} color={colors.amber} />
            <MiniCheck checked={r.cleared} color={colors.green} />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16, fontSize: 11, color: colors.textMuted2 }}>Example data — not your real bills</div>
    </PreviewCard>
  );
}

function GoalsPreview() {
  const { colors } = useTheme();
  const items = [
    { category: "Faith", color: "#a855f7", goal: "Pray daily" },
    { category: "Family", color: "#3b82f6", goal: "Call mom weekly" },
    { category: "Fitness", color: "#ec4899", goal: "Run 3x this week" },
  ];
  return (
    <PreviewCard title="Goals" subtitle="Fresh goals, every month" accent="#6366f1">
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((item) => (
          <div
            key={item.category}
            style={{ display: "flex", alignItems: "center", gap: 8, background: colors.surfaceAlt, borderRadius: 8, padding: "7px 10px" }}
          >
            <span style={{ width: 7, height: 7, borderRadius: 99, background: item.color, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: colors.textMuted2, width: 52, flexShrink: 0 }}>{item.category}</span>
            <span style={{ fontSize: 13, color: colors.text }}>{item.goal}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14, fontSize: 11, color: colors.textMuted2 }}>Example data — not your real goals</div>
    </PreviewCard>
  );
}

function Landing({ onGetStarted }: { onGetStarted: () => void }) {
  const { colors, mode } = useTheme();
  return (
    <div
      style={{
        position: "relative",
        fontFamily: "'Outfit', -apple-system, sans-serif",
        color: colors.text,
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 520,
          background: `radial-gradient(600px circle at 50% 0%, ${colors.accent}${mode === "dark" ? "26" : "14"}, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", textAlign: "center", padding: "72px 24px 56px" }}>
        <div style={{ fontSize: 11, color: colors.accent, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>
          Oaksteadly
        </div>
        <h1 style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 12px" }}>
          Steady growth, every month.
        </h1>
        <p style={{ color: colors.textMuted2, fontSize: 15, margin: "0 auto 28px", maxWidth: 480 }}>
          Track debt payoff by category, stay on top of monthly bills, and set fresh goals for
          Faith, Family, Friends, and more — synced across every device.
        </p>
        <button
          onClick={onGetStarted}
          className="transition-transform duration-150 hover:brightness-110 active:scale-[0.97]"
          style={{
            background: colors.accent,
            border: "none",
            borderRadius: 10,
            color: "#fff",
            fontWeight: 700,
            fontSize: 15,
            padding: "12px 28px",
            cursor: "pointer",
          }}
        >
          Get started
        </button>
      </div>

      <div style={{ position: "relative", maxWidth: 980, margin: "0 auto", padding: "0 24px 72px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          <DebtsPreview />
          <BillsPreview />
          <GoalsPreview />
        </div>
      </div>
    </div>
  );
}

function NotFound() {
  const { colors } = useTheme();
  return (
    <div
      style={{
        minHeight: "calc(100vh - 61px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: colors.text,
        padding: 24,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 13, color: colors.accent, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>
        404
      </div>
      <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 10px" }}>Page not found</h1>
      <p style={{ color: colors.textMuted2, fontSize: 14, margin: "0 0 24px" }}>
        That page doesn't exist. Head back to your dashboard.
      </p>
      <Link
        to="/"
        className="transition-transform duration-150 hover:brightness-110 active:scale-[0.97]"
        style={{
          background: colors.accent,
          color: "#fff",
          fontWeight: 700,
          fontSize: 14,
          padding: "10px 20px",
          borderRadius: 8,
          textDecoration: "none",
        }}
      >
        Back to Oaksteadly
      </Link>
    </div>
  );
}

function App() {
  const { colors } = useTheme();
  const { session, loading } = useAuth();
  const [authModal, setAuthModal] = useState<"signin" | "signup" | null>(null);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: colors.bg,
          color: colors.textMuted,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          fontFamily: "'Outfit', -apple-system, sans-serif",
        }}
      >
        <div className="spinner" />
        <span style={{ fontSize: 13 }}>Loading…</span>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: colors.bg }}>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Header session={session} onLogin={() => setAuthModal("signin")} onSignup={() => setAuthModal("signup")} />
      <main id="main-content">
        <Routes>
          <Route
            path="/"
            element={
              session ? <Dashboard userId={session.user.id} /> : <Landing onGetStarted={() => setAuthModal("signup")} />
            }
          />
          <Route path="/bills" element={session ? <BillTracker /> : <Navigate to="/" replace />} />
          <Route path="/goals" element={session ? <GoalsTracker /> : <Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {authModal && <AuthModal initialMode={authModal} onClose={() => setAuthModal(null)} />}
    </div>
  );
}

export default App;
