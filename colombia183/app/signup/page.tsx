"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSignup() {
    if (password !== confirm) { setError("Passwords don't match."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${location.origin}/dashboard` },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Check your email</h2>
          <p style={{ color: "#6b7280", lineHeight: 1.7 }}>
            We sent a confirmation link to <strong style={{ color: "#e8e4d9" }}>{email}</strong>. Click it to activate your account, then come back and log in.
          </p>
          <Link href="/login" style={{ display: "inline-block", marginTop: 28, background: "#FCD116", color: "#16192a", fontWeight: 700, padding: "12px 28px", borderRadius: 10 }}>
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 40 }}>
        <img src="/183logo.png" alt="183 Days" style={{ height: 54, width: "auto" }} />
        <span style={{ fontWeight: 800, fontSize: 18, color: "#fff" }}>183</span>
      </Link>

      <div style={{ width: "100%", maxWidth: 400, background: "#16192a", borderRadius: 16, padding: 32, border: "1px solid #2a2d3e" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Create your account</h1>
        <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 28 }}>Free. No credit card required.</p>

        {[
          { label: "Email", type: "email", val: email, set: setEmail, ph: "you@example.com" },
          { label: "Password", type: "password", val: password, set: setPassword, ph: "8+ characters" },
          { label: "Confirm Password", type: "password", val: confirm, set: setConfirm, ph: "••••••••" },
        ].map(f => (
          <div key={f.label} style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 6 }}>{f.label}</label>
            <input type={f.type} value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph} onKeyDown={e => e.key === "Enter" && handleSignup()} />
          </div>
        ))}

        {error && (
          <div style={{ background: "#7f1d1d22", border: "1px solid #ef444433", borderRadius: 8, padding: "10px 14px", color: "#fca5a5", fontSize: 14, marginBottom: 20 }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSignup}
          disabled={loading || !email || !password || !confirm}
          style={{ width: "100%", background: email && password && confirm ? "#FCD116" : "#2a2d3e", color: email && password && confirm ? "#16192a" : "#4b5563", border: "none", borderRadius: 10, padding: "13px", fontWeight: 700, fontSize: 15, marginTop: 8 }}
        >
          {loading ? "Creating account…" : "Create account"}
        </button>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "#6b7280" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "#FCD116", fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
