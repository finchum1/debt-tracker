export function ChangeChip({ value }: { value: number | null }) {
  if (value === null || Number.isNaN(value)) return null;
  const down = value < 0;
  const zero = value === 0;
  const color = zero ? "#94a3b8" : down ? "#22c55e" : "#ef4444";
  const bg = zero ? "#1e293b" : down ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)";
  const label = zero ? "0.00%" : `${down ? "▼" : "▲"} ${Math.abs(value).toFixed(2)}%`;

  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: 99,
        background: bg,
        color,
        fontWeight: 700,
        fontSize: 13,
        letterSpacing: "0.01em",
        border: `1px solid ${color}33`,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}
