import type { ReactNode } from "react";
import { Check, Receipt, Target, TrendingDown } from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import { ChangeChip } from "./ChangeChip";
import { ProgressBar } from "./ProgressBar";
import { GROUP_COLORS } from "../types";
import { formatCurrency } from "../lib/debt";

function BrowserFrame({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  return (
    <div
      style={{
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: colors.shadowHover,
      }}
    >
      <div style={{ display: "flex", gap: 6, padding: "10px 14px", borderBottom: `1px solid ${colors.border}` }}>
        <span style={{ width: 10, height: 10, borderRadius: 99, background: "#ef4444" }} />
        <span style={{ width: 10, height: 10, borderRadius: 99, background: "#f59e0b" }} />
        <span style={{ width: 10, height: 10, borderRadius: 99, background: "#22c55e" }} />
      </div>
      <div style={{ padding: 20 }}>{children}</div>
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
    { category: "Finances", color: "#22c55e", goal: "No takeout this week" },
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
            <span style={{ fontSize: 11, color: colors.textMuted2, width: 58, flexShrink: 0 }}>{item.category}</span>
            <span style={{ fontSize: 13, color: colors.text }}>{item.goal}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14, fontSize: 11, color: colors.textMuted2 }}>Example data — not your real goals</div>
    </PreviewCard>
  );
}

function ModuleSection({
  id,
  icon,
  eyebrow,
  headline,
  description,
  bullets,
  accent,
  visual,
}: {
  id: string;
  icon: ReactNode;
  eyebrow: string;
  headline: string;
  description: string;
  bullets: string[];
  accent: string;
  visual: ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <div id={id} style={{ maxWidth: 640, margin: "0 auto", padding: "56px 24px", scrollMarginTop: 80 }}>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: `${accent}1f`,
          color: accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        {icon}
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
        {eyebrow}
      </div>
      <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 12px" }}>{headline}</h2>
      <p style={{ color: colors.textMuted2, fontSize: 15, lineHeight: 1.6, margin: "0 0 20px" }}>{description}</p>
      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", display: "flex", flexDirection: "column", gap: 10 }}>
        {bullets.map((bullet) => (
          <li key={bullet} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14.5, color: colors.text }}>
            <span style={{ width: 6, height: 6, borderRadius: 99, background: accent, marginTop: 7, flexShrink: 0 }} />
            {bullet}
          </li>
        ))}
      </ul>
      <BrowserFrame>{visual}</BrowserFrame>
    </div>
  );
}

function FeatureHighlight({ title, description }: { title: string; description: string }) {
  const { colors } = useTheme();
  return (
    <div style={{ textAlign: "left" }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 6px" }}>{title}</h3>
      <p style={{ fontSize: 13.5, color: colors.textMuted2, lineHeight: 1.6, margin: 0 }}>{description}</p>
    </div>
  );
}

function Footer() {
  const { colors } = useTheme();
  return (
    <footer style={{ borderTop: `1px solid ${colors.border}`, padding: "32px 24px" }}>
      <div
        style={{
          maxWidth: 980,
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.01em" }}>Oaksteadly</div>
          <div style={{ fontSize: 13, color: colors.textMuted2, marginTop: 2 }}>Steady growth, every month.</div>
        </div>
        <div style={{ display: "flex", gap: 20, fontSize: 13, color: colors.textMuted2 }}>
          <span>Debts</span>
          <span>Bills</span>
          <span>Goals</span>
        </div>
        <div style={{ fontSize: 12.5, color: colors.textMuted2 }}>© {new Date().getFullYear()} Oaksteadly</div>
      </div>
    </footer>
  );
}

export function Landing({ onGetStarted }: { onGetStarted: () => void }) {
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

      <div style={{ position: "relative", textAlign: "center", padding: "72px 24px 40px" }}>
        <div style={{ fontSize: 11, color: colors.accent, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>
          Oaksteadly
        </div>
        <h1 style={{ fontSize: 44, fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 12px", lineHeight: 1.1 }}>
          Steady growth,
          <br />
          every month.
        </h1>
        <p style={{ color: colors.textMuted2, fontSize: 15, margin: "0 auto 28px", maxWidth: 480 }}>
          Track debt payoff by category, stay on top of monthly bills, and set fresh goals for
          Faith, Family, Friends, and more — synced across every device.
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, flexWrap: "wrap", marginBottom: 28 }}>
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
          <a
            href="#modules"
            className="transition-opacity duration-150 hover:opacity-70"
            style={{ color: colors.text, fontWeight: 600, fontSize: 15, textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}
          >
            See what's inside →
          </a>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
          {[
            { label: "Debts", href: "#debts-section", accent: GROUP_COLORS["Credit Card"] },
            { label: "Bills", href: "#bills-section", accent: "#f59e0b" },
            { label: "Goals", href: "#goals-section", accent: "#6366f1" },
          ].map((tag) => (
            <a
              key={tag.label}
              href={tag.href}
              className="transition-colors duration-150 active:scale-95"
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: colors.textMuted,
                border: `1px solid ${colors.border}`,
                borderRadius: 99,
                padding: "5px 14px",
                textDecoration: "none",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = tag.accent;
                e.currentTarget.style.borderColor = `${tag.accent}80`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = colors.textMuted;
                e.currentTarget.style.borderColor = colors.border;
              }}
            >
              {tag.label}
            </a>
          ))}
        </div>
      </div>

      <div id="modules" style={{ position: "relative", maxWidth: 980, margin: "0 auto", padding: "16px 24px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          <DebtsPreview />
          <BillsPreview />
          <GoalsPreview />
        </div>
      </div>

      <div style={{ position: "relative" }}>
        <ModuleSection
          id="debts-section"
          icon={<TrendingDown size={20} />}
          eyebrow="Debts"
          headline="Every balance, moving the right direction"
          description="Group accounts by Credit Card, Real Estate, Autos, and Other. Track APR, monthly payments, and exactly how much you've paid off — at a glance."
          accent={GROUP_COLORS["Credit Card"]}
          bullets={[
            "Percent-change chips turn green the moment a balance drops",
            "Weighted average APR across every account, updated automatically",
            "A payoff progress bar for every account, from starting balance to today",
          ]}
          visual={<DebtsPreviewBare />}
        />
        <ModuleSection
          id="bills-section"
          icon={<Receipt size={20} />}
          eyebrow="Bills"
          headline="Never miss a due date again"
          description="Recurring bills and one-off expenses side by side, with List, Month, Week, and Notes views — plus an optional note on every bill for exactly how it gets paid."
          accent="#f59e0b"
          bullets={[
            "Mark paid and bank-cleared separately — know what's pending vs. settled",
            "Past-due bills call themselves out automatically",
            'An optional note on any bill, like "Autopay from Checking"',
          ]}
          visual={<BillsPreviewBare />}
        />
        <ModuleSection
          id="goals-section"
          icon={<Target size={20} />}
          eyebrow="Goals"
          headline="Fresh goals for what actually matters"
          description="Seven life areas — Faith, Family, Friends, Finances, Fitness, Fun, and Future — with a blank slate every month. No streaks to break, nothing to feel behind on."
          accent="#6366f1"
          bullets={[
            "Jump between months with one click — nothing carries over to weigh on you",
            "Plain text, no checkboxes to argue with — just write down what matters",
            "Every category gets its own color, so the board reads at a glance",
          ]}
          visual={<GoalsPreviewBare />}
        />
      </div>

      <div style={{ position: "relative", maxWidth: 980, margin: "0 auto", padding: "16px 24px 64px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 28 }}>
          <FeatureHighlight
            title="Light or dark, your choice"
            description="Toggle instantly in the header — applied across every module, remembered next time you visit."
          />
          <FeatureHighlight
            title="Everything synced"
            description="Backed by a real database. Update on your phone, see it on your laptop a moment later."
          />
          <FeatureHighlight
            title="Your own private workspace"
            description="Self-service signup, your data scoped to your account alone — nobody else can see it."
          />
          <FeatureHighlight
            title="Three modules, one login"
            description="Debts, Bills, and Goals — no separate app to open, no second password to remember."
          />
        </div>
      </div>

      <div
        style={{
          position: "relative",
          textAlign: "center",
          padding: "56px 24px",
          borderTop: `1px solid ${colors.border}`,
        }}
      >
        <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 10px" }}>
          Stop juggling spreadsheets for one number.
        </h2>
        <p style={{ color: colors.textMuted2, fontSize: 15, margin: "0 0 24px" }}>See it end to end in under a minute.</p>
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

      <Footer />
    </div>
  );
}

function DebtsPreviewBare() {
  const start = 6000;
  const current = 4200;
  const accent = GROUP_COLORS["Credit Card"];
  return (
    <div style={{ textAlign: "left" }}>
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
    </div>
  );
}

function BillsPreviewBare() {
  const { colors } = useTheme();
  const rows: { day: string; name: string; amount: number; paid: boolean; cleared: boolean }[] = [
    { day: "05", name: "Electric", amount: 150, paid: true, cleared: true },
    { day: "12", name: "Rent", amount: 1200, paid: false, cleared: false },
    { day: "18", name: "Internet", amount: 70, paid: true, cleared: false },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, textAlign: "left" }}>
      {rows.map((r) => (
        <div key={r.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 22, fontSize: 12.5, color: colors.textMuted2, fontVariantNumeric: "tabular-nums" }}>{r.day}</span>
          <span style={{ flex: 1, fontSize: 13.5 }}>{r.name}</span>
          <span style={{ fontSize: 13.5, fontVariantNumeric: "tabular-nums", marginRight: 4 }}>{formatCurrency(r.amount)}</span>
          <MiniCheck checked={r.paid} color={colors.amber} />
          <MiniCheck checked={r.cleared} color={colors.green} />
        </div>
      ))}
    </div>
  );
}

function GoalsPreviewBare() {
  const { colors } = useTheme();
  const items = [
    { category: "Faith", color: "#a855f7", goal: "Pray daily" },
    { category: "Family", color: "#3b82f6", goal: "Call mom weekly" },
    { category: "Friends", color: "#f59e0b", goal: "Plan a game night" },
    { category: "Fitness", color: "#ec4899", goal: "Run 3x this week" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, textAlign: "left" }}>
      {items.map((item) => (
        <div
          key={item.category}
          style={{ display: "flex", alignItems: "center", gap: 8, background: colors.surfaceAlt, borderRadius: 8, padding: "7px 10px" }}
        >
          <span style={{ width: 7, height: 7, borderRadius: 99, background: item.color, flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: colors.textMuted2, width: 58, flexShrink: 0 }}>{item.category}</span>
          <span style={{ fontSize: 13, color: colors.text }}>{item.goal}</span>
        </div>
      ))}
    </div>
  );
}
