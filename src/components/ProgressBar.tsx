import { formatCurrency } from "../lib/debt";

export function ProgressBar({ start, current }: { start: number | null; current: number | null }) {
  if (!start || current === null || Number.isNaN(start) || Number.isNaN(current)) return null;
  const paid = start - current;
  const paidPct = Math.max(0, Math.min(100, (paid / start) * 100));

  return (
    <div style={{ marginTop: 8 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          color: "#64748b",
          marginBottom: 4,
        }}
      >
        <span>{paidPct.toFixed(1)}% paid off</span>
        <span>{formatCurrency(paid)} paid</span>
      </div>
      <div style={{ height: 6, borderRadius: 99, background: "#1e293b", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            borderRadius: 99,
            width: `${paidPct}%`,
            background: "linear-gradient(90deg, #3b82f6, #22c55e)",
            transition: "width 0.5s cubic-bezier(.4,0,.2,1)",
          }}
        />
      </div>
    </div>
  );
}
