import { formatCurrency } from "../lib/debt";
import { useTheme } from "../hooks/useTheme";

export function ProgressBar({ start, current }: { start: number | null; current: number | null }) {
  const { colors } = useTheme();
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
          color: colors.textMuted,
          marginBottom: 4,
        }}
      >
        <span>{paidPct.toFixed(1)}% paid off</span>
        <span>{formatCurrency(paid)} paid</span>
      </div>
      <div style={{ height: 6, borderRadius: 99, background: colors.surfaceAlt, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            borderRadius: 99,
            width: `${paidPct}%`,
            background: `linear-gradient(90deg, ${colors.accent}, ${colors.green})`,
            transition: "width 0.5s cubic-bezier(.4,0,.2,1)",
          }}
        />
      </div>
    </div>
  );
}
