import type { Session } from "@supabase/supabase-js";
import { NavLink } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

interface HeaderProps {
  session: Session | null;
  onLogin: () => void;
  onSignup: () => void;
}

const navLinkStyle = ({ isActive }: { isActive: boolean }) => ({
  fontSize: 13,
  fontWeight: 600 as const,
  color: isActive ? "#f1f5f9" : "#64748b",
  textDecoration: "none",
  padding: "6px 10px",
  borderRadius: 6,
  background: isActive ? "#1e293b" : "transparent",
});

export function Header({ session, onLogin, onSignup }: HeaderProps) {
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
        background: "rgba(15, 23, 42, 0.85)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid #1e293b",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <span style={{ fontSize: 16, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.02em" }}>
          Debt Tracker
        </span>
        {session && (
          <nav style={{ display: "flex", gap: 4 }}>
            <NavLink to="/" end style={navLinkStyle}>
              Debts
            </NavLink>
            <NavLink to="/bills" style={navLinkStyle}>
              Bills
            </NavLink>
          </nav>
        )}
      </div>

      {session ? (
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 13, color: "#64748b" }}>{session.user.email}</span>
          <button
            onClick={() => supabase.auth.signOut()}
            style={{
              background: "none",
              border: "1px solid #1e293b",
              borderRadius: 8,
              color: "#94a3b8",
              fontSize: 13,
              padding: "7px 14px",
              cursor: "pointer",
            }}
          >
            Sign out
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={onLogin}
            style={{
              background: "none",
              border: "1px solid #1e293b",
              borderRadius: 8,
              color: "#94a3b8",
              fontSize: 13,
              fontWeight: 600,
              padding: "8px 16px",
              cursor: "pointer",
            }}
          >
            Log in
          </button>
          <button
            onClick={onSignup}
            style={{
              background: "#3b82f6",
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
        </div>
      )}
    </header>
  );
}
