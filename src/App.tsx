import { useMemo, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { useAccounts } from "./hooks/useAccounts";
import { Header } from "./components/Header";
import { AuthModal } from "./components/AuthModal";
import { GroupSection } from "./components/GroupSection";
import { ChangeChip } from "./components/ChangeChip";
import BillTracker from "./components/BillTracker.jsx";
import { GROUPS, GROUP_COLORS } from "./types";
import { formatCurrency, getCurrentBalance, pct } from "./lib/debt";

function Dashboard({ userId }: { userId: string }) {
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
          background: "#020817",
          color: "#64748b",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
        }}
      >
        Loading…
      </div>
    );
  }

  const statCards: { label: string; value: string; color: string; big?: boolean }[] = [
    { label: "Starting Grand Total", value: formatCurrency(totals.totalStart), color: "#94a3b8" },
    { label: "Current Total Balance", value: formatCurrency(totals.totalCurrent), color: "#f1f5f9", big: true },
    {
      label: "Total Paid Off",
      value: formatCurrency(totals.totalPaid),
      color: totals.totalPaid >= 0 ? "#22c55e" : "#ef4444",
    },
    { label: "Total Monthly Payments", value: formatCurrency(totals.totalMonthly), color: "#38bdf8" },
  ];
  if (totals.avgApr !== null) {
    statCards.push({
      label: "Avg APR (weighted)",
      value: `${totals.avgApr.toFixed(2)}%`,
      color: totals.avgApr >= 20 ? "#fca5a5" : "#f1f5f9",
    });
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020817",
        fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
        color: "#f1f5f9",
        padding: "0 0 60px",
      }}
    >
      <div
        style={{
          background: "linear-gradient(180deg, #0f172a 0%, #020817 100%)",
          borderBottom: "1px solid #1e293b",
          padding: "32px 24px 24px",
          maxWidth: 980,
          margin: "0 auto",
        }}
      >
        <div>
          <div style={{ fontSize: 11, color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>
            Debt Tracker
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", margin: 0, marginBottom: 4 }}>
            Total Debt Dashboard
          </h1>
          <p style={{ color: "#475569", fontSize: 14, margin: 0 }}>Track balances by category. Green means progress.</p>
        </div>

        <div style={{ marginTop: 24, display: "flex", gap: 20, flexWrap: "wrap" }}>
          {statCards.map(({ label, value, color, big }) => (
            <div
              key={label}
              style={{
                background: "#0f172a",
                border: big ? "1px solid #3b82f6" : "1px solid #1e293b",
                borderRadius: 12,
                padding: "12px 18px",
                minWidth: 160,
              }}
            >
              <div style={{ fontSize: 11, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>
                {label}
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>
                {value}
              </div>
            </div>
          ))}
          <div
            style={{
              background: "#0f172a",
              border: "1px solid #1e293b",
              borderRadius: 12,
              padding: "12px 18px",
              minWidth: 130,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div style={{ fontSize: 11, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
              Overall Change
            </div>
            {totals.totalPct !== null ? (
              <ChangeChip value={totals.totalPct} />
            ) : (
              <span style={{ color: "#334155", fontSize: 13 }}>Enter starting balances</span>
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
                  background: "#0f172a",
                  border: `1px solid ${color}40`,
                  borderRadius: 99,
                  padding: "5px 12px 5px 8px",
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: 99, background: color }} />
                <span style={{ fontSize: 12, color: "#94a3b8" }}>{g}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#f1f5f9" }}>{formatCurrency(gTotal)}</span>
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

function Landing({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div
      style={{
        minHeight: "calc(100vh - 61px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
        color: "#f1f5f9",
        padding: 24,
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: 480 }}>
        <div style={{ fontSize: 11, color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>
          Debt Tracker
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 12px" }}>
          Track your debt payoff, from anywhere
        </h1>
        <p style={{ color: "#475569", fontSize: 15, margin: "0 0 28px" }}>
          Group balances by Credit Card, Real Estate, Autos, and Other. Watch APR, monthly payments, and
          progress toward payoff — synced across every device.
        </p>
        <button
          onClick={onGetStarted}
          style={{
            background: "#3b82f6",
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
    </div>
  );
}

function App() {
  const { session, loading } = useAuth();
  const [authModal, setAuthModal] = useState<"signin" | "signup" | null>(null);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#020817",
          color: "#64748b",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Loading…
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#020817" }}>
      <Header session={session} onLogin={() => setAuthModal("signin")} onSignup={() => setAuthModal("signup")} />
      <Routes>
        <Route
          path="/"
          element={
            session ? <Dashboard userId={session.user.id} /> : <Landing onGetStarted={() => setAuthModal("signup")} />
          }
        />
        <Route path="/bills" element={session ? <BillTracker /> : <Navigate to="/" replace />} />
      </Routes>
      {authModal && <AuthModal initialMode={authModal} onClose={() => setAuthModal(null)} />}
    </div>
  );
}

export default App;
