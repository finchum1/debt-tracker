import { useTheme } from "../hooks/useTheme";

export function ChangeChip({ value }: { value: number | null }) {
  const { colors } = useTheme();
  if (value === null || Number.isNaN(value)) return null;
  const down = value < 0;
  const zero = value === 0;
  const color = zero ? colors.textMuted3 : down ? colors.green : colors.red;
  const bg = zero ? colors.surfaceAlt : down ? `${colors.green}1f` : `${colors.red}1f`;
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
