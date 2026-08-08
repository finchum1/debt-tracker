import type { MouseEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { NavLink } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useTheme } from "../hooks/useTheme";

interface HeaderProps {
  session: Session | null;
  onLogin: () => void;
  onSignup: () => void;
}

export function Header({ session, onLogin, onSignup }: HeaderProps) {
  const { mode, colors, toggleTheme } = useTheme();

  const navLinkStyle = ({ isActive }: { isActive: boolean }) => ({
    fontSize: 13,
    fontWeight: 600 as const,
    color: isActive ? colors.text : colors.textMuted,
    textDecoration: "none",
    padding: "6px 10px",
    borderRadius: 6,
    background: isActive ? colors.surfaceAlt : "transparent",
    transition: "background 0.15s ease, color 0.15s ease",
  });

  function navLinkHover(e: MouseEvent<HTMLAnchorElement>, entering: boolean) {
    if (e.currentTarget.getAttribute("aria-current") === "page") return;
    e.currentTarget.style.background = entering ? colors.surfaceAlt : "transparent";
  }

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 24px",
        background: colors.headerBg,
        backdropFilter: "blur(8px)",
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <span style={{ fontSize: 16, fontWeight: 800, color: colors.text, letterSpacing: "-0.02em" }}>
          Debt Tracker
        </span>
        {session && (
          <nav style={{ display: "flex", gap: 4 }}>
            <NavLink
              to="/"
              end
              style={navLinkStyle}
              onMouseEnter={(e) => navLinkHover(e, true)}
              onMouseLeave={(e) => navLinkHover(e, false)}
            >
              Debts
            </NavLink>
            <NavLink
              to="/bills"
              style={navLinkStyle}
              onMouseEnter={(e) => navLinkHover(e, true)}
              onMouseLeave={(e) => navLinkHover(e, false)}
            >
              Bills
            </NavLink>
            <NavLink
              to="/goals"
              style={navLinkStyle}
              onMouseEnter={(e) => navLinkHover(e, true)}
              onMouseLeave={(e) => navLinkHover(e, false)}
            >
              Goals
            </NavLink>
          </nav>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button
          onClick={toggleTheme}
          title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          aria-label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="transition-colors duration-150 active:scale-[0.94]"
          style={{
            background: "none",
            border: `1px solid ${colors.border}`,
            borderRadius: 8,
            color: colors.textMuted3,
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.surfaceAlt;
            e.currentTarget.style.color = colors.text;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "none";
            e.currentTarget.style.color = colors.textMuted3;
          }}
        >
          {mode === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {session ? (
          <>
            <span style={{ fontSize: 13, color: colors.textMuted }}>{session.user.email}</span>
            <button
              onClick={() => supabase.auth.signOut()}
              className="transition-colors duration-150 active:scale-[0.97]"
              style={{
                background: "none",
                border: `1px solid ${colors.border}`,
                borderRadius: 8,
                color: colors.textMuted3,
                fontSize: 13,
                padding: "7px 14px",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = colors.surfaceAlt)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onLogin}
              className="transition-colors duration-150 active:scale-[0.97]"
              style={{
                background: "none",
                border: `1px solid ${colors.border}`,
                borderRadius: 8,
                color: colors.textMuted3,
                fontSize: 13,
                fontWeight: 600,
                padding: "8px 16px",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = colors.surfaceAlt)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              Log in
            </button>
            <button
              onClick={onSignup}
              className="transition-transform duration-150 hover:brightness-110 active:scale-[0.97]"
              style={{
                background: colors.accent,
                border: "none",
                borderRadius: 8,
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                padding: "8px 16px",
                cursor: "pointer",
              }}
            >
              Sign up
            </button>
          </>
        )}
      </div>
    </header>
  );
}
