"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  async function handleSubmit() {
    if (!email) return;
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
     redirectTo: "https://183days.co/reset-password",
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "#0f1117" }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12, color: "#fff" }}>Check your email</h2>
          <p style={{ color: "#6b7280", lineHeight: 1.7 }}>
            We sent a password reset link to <strong style={{ color: "#e8e4d9" }}>{email}</strong>. Click it to set a new password.
          </p>
          <Link href="/login" style={{ display: "inline-block", marginTop: 28, color: "#FCD116", fontWeight: 600, fontSize: 14 }}>
            Back to login
          </Link>
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
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Reset password</h1>
        <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 28 }}>Enter your email and we'll send you a reset link.</p>

        <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 6 }}>Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          style={{ marginBottom: 20 }}
        />

        {error && (
          <div style={{ background: "#7f1d1d22", border: "1px solid #ef444433", borderRadius: 8, padding: "10px 14px", color: "#fca5a5", fontSize: 14, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || !email}
          style={{ width: "100%", background: email ? "#FCD116" : "#2a2d3e", color: email ? "#16192a" : "#4b5563", border: "none", borderRadius: 10, padding: "13px", fontWeight: 700, fontSize: 15, cursor: "pointer" }}
        >
          {loading ? "Sending…" : "Send reset link"}
        </button>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "#6b7280" }}>
          <Link href="/login" style={{ color: "#FCD116", fontWeight: 600 }}>Back to login</Link>
        </p>
      </div>
    </div>
  );
}
