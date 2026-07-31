"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [ready, setReady] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    // Handle both hash-based and PKCE-based recovery
    const handleRecovery = async () => {
      // Check for hash tokens (older Supabase flow)
      const hash = window.location.hash;
      if (hash && hash.includes("access_token")) {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        if (accessToken && refreshToken) {
          await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
          setReady(true);
          return;
        }
      }

      // Listen for PASSWORD_RECOVERY event (PKCE flow)
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
          setReady(true);
        }
      });

      // Check existing session
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setReady(true);
      }

      return () => subscription.unsubscribe();
    };

    handleRecovery();
  }, []);

  async function handleReset() {
    if (password !== confirm) { setError("Passwords don't match."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    }
  }

  if (success) {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "#0f1117" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Password updated!</h2>
          <p style={{ color: "#6b7280" }}>Redirecting to login…</p>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "#0f1117" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>🔐</div>
          <div style={{ fontSize: 16, color: "#9ca3af", marginBottom: 8 }}>Verifying your reset link…</div>
          <div style={{ fontSize: 13, color: "#4b5563" }}>This should only take a moment.</div>
          <div style={{ marginTop: 24 }}>
            <Link href="/forgot-password" style={{ fontSize: 13, color: "#6b7280" }}>
              Request a new link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, background: "#0f1117", fontFamily: "Inter, system-ui, sans-serif", color: "#e8e4d9" }}>
      <Link href="/" style={{ marginBottom: 40 }}>
        <img src="/183logo.png" alt="183 Days" style={{ height: 54, width: "auto" }} />
      </Link>

      <div style={{ width: "100%", maxWidth: 400, background: "#16192a", borderRadius: 16, padding: 32, border: "1px solid #2a2d3e" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Set new password</h1>
        <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 28 }}>Choose a new password for your account.</p>

        <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 6 }}>New Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="8+ characters" style={{ marginBottom: 16 }} />

        <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 6 }}>Confirm Password</label>
        <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handleReset()} style={{ marginBottom: 20 }} />

        {error && (
          <div style={{ background: "#7f1d1d22", border: "1px solid #ef444433", borderRadius: 8, padding: "10px 14px", color: "#fca5a5", fontSize: 14, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <button
          onClick={handleReset}
          disabled={loading || !password || !confirm}
          style={{ width: "100%", background: password && confirm ? "#FCD116" : "#2a2d3e", color: password && confirm ? "#16192a" : "#4b5563", border: "none", borderRadius: 10, padding: "13px", fontWeight: 700, fontSize: 15, cursor: "pointer" }}
        >
          {loading ? "Updating…" : "Update password"}
        </button>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "#6b7280" }}>
          <Link href="/login" style={{ color: "#FCD116", fontWeight: 600 }}>Back to login</Link>
        </p>
      </div>
    </div>
  );
}
