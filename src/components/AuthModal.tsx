import { useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "../lib/supabaseClient";
import { useTheme } from "../hooks/useTheme";

type Mode = "signin" | "signup";

interface AuthModalProps {
  initialMode: Mode;
  onClose: () => void;
}

export function AuthModal({ initialMode, onClose }: AuthModalProps) {
  const { colors } = useTheme();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setNotice(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setSubmitting(true);

    if (mode === "signin") {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      setSubmitting(false);
      if (signInError) {
        setError(signInError.message);
        return;
      }
      onClose();
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
    setSubmitting(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    if (data.session) {
      // Email confirmation is disabled on the project — user is signed in immediately.
      onClose();
      return;
    }
    // Email confirmation is required before the account can sign in.
    setNotice("Account created — check your email to confirm it before signing in.");
  }

  const inputStyle = {
    display: "block" as const,
    width: "100%",
    marginTop: 6,
    background: colors.surfaceAlt,
    border: `1px solid ${colors.borderInput}`,
    borderRadius: 8,
    color: colors.text,
    fontSize: 15,
    padding: "9px 12px",
    boxSizing: "border-box" as const,
    outline: "none",
  };

  const linkStyle = {
    background: "none",
    border: "none",
    color: colors.accent,
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer" as const,
    padding: 0,
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(2, 8, 23, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: 24,
      }}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: 360,
          background: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: 16,
          padding: "32px 28px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
          position: "relative",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            background: "none",
            border: "none",
            color: colors.textMuted2,
            fontSize: 18,
            cursor: "pointer",
            lineHeight: 1,
          }}
        >
          ×
        </button>

        <div style={{ fontSize: 11, color: colors.accent, textTransform: "uppercase", letterSpacing: "0.12em" }}>
          Debt Tracker
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.02em", color: colors.text }}>
          {mode === "signin" ? "Sign in" : "Create your account"}
        </h1>

        <label style={{ fontSize: 12, color: colors.textMuted }}>
          Email
          <input
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
        </label>
        <label style={{ fontSize: 12, color: colors.textMuted }}>
          Password
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
        </label>

        {error && (
          <div style={{ color: colors.red, fontSize: 13, background: `${colors.red}1f`, padding: "8px 10px", borderRadius: 8 }}>
            {error}
          </div>
        )}
        {notice && (
          <div style={{ color: colors.green, fontSize: 13, background: `${colors.green}1f`, padding: "8px 10px", borderRadius: 8 }}>
            {notice}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          style={{
            marginTop: 8,
            background: colors.accent,
            border: "none",
            borderRadius: 8,
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            padding: "10px 16px",
            cursor: submitting ? "default" : "pointer",
            opacity: submitting ? 0.7 : 1,
          }}
        >
          {submitting ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>

        <div style={{ textAlign: "center", fontSize: 13, color: colors.textMuted }}>
          {mode === "signin" ? (
            <>
              Don't have an account?{" "}
              <button type="button" onClick={() => switchMode("signup")} style={linkStyle}>
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button type="button" onClick={() => switchMode("signin")} style={linkStyle}>
                Sign in
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
