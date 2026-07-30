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
  const supabase = createClient();
  const router = useRouter();

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
      setTimeout(() => router.push("/dashboard"), 2000);
    }
  }

  if (success) {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "#0f1117" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Password updated!</h2>
          <p style={{ color: "#6b7280" }}>Redirecting to your dashboard…</p>
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
      </div>
    </div>
  );
}
