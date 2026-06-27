"use client";
import { useState, useEffect } from "react";
import { Trip, formatDate, parseDate, daysBetween } from "@/lib/tax-logic";

interface Props {
  onAdd: (trips: Omit<Trip, "id" | "user_id" | "created_at">[]) => Promise<void>;
  gmailConnected: boolean;
}

export default function GmailScanner({ onAdd, gmailConnected }: Props) {
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<Omit<Trip, "id" | "user_id" | "created_at">[]>([]);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleScan() {
    setScanning(true);
    setMsg("");
    setResults([]);
    try {
      const res = await fetch("/api/gmail/scan", { method: "POST" });
      const data = await res.json();
      if (data.trips?.length) {
        setResults(data.trips);
        setMsg(data.message);
      } else {
        setMsg(data.message || "No Colombia bookings found in your Gmail.");
      }
    } catch {
      setMsg("Scan failed. Try again.");
    }
    setScanning(false);
  }

  async function handleAdd() {
    setSaving(true);
    await onAdd(results);
    setResults([]);
    setMsg(`✅ Added ${results.length} trip${results.length !== 1 ? "s" : ""} to your tracker.`);
    setSaving(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          width: "100%", background: "#16192a", color: "#e8e4d9",
          border: "1px solid #2a2d3e", borderRadius: 10, padding: "13px",
          fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center",
          justifyContent: "center", gap: 8,
        }}
      >
        <span>📧</span> Scan Gmail for Bookings
      </button>
    );
  }

  return (
    <div style={{ background: "#16192a", borderRadius: 16, padding: 24, border: "1px solid #2a2d3e", marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18 }}>📧 Gmail Scanner</div>
          <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
            Automatically finds Colombia flights, hotels, and rentals in your inbox.
          </div>
        </div>
        <button onClick={() => setOpen(false)} style={{ background: "transparent", border: "none", color: "#6b7280", fontSize: 20 }}>✕</button>
      </div>

      {!gmailConnected ? (
        <div>
          <div style={{ fontSize: 14, color: "#9ca3af", marginBottom: 16, lineHeight: 1.6 }}>
            Connect your Gmail account to let 183 scan for Colombia booking confirmations automatically. We only read booking-related emails — we never store your email content.
          </div>
          <a
            href="/api/auth/google"
            style={{
              display: "block", textAlign: "center", background: "#fff", color: "#16192a",
              borderRadius: 10, padding: "12px", fontWeight: 700, fontSize: 15,
              textDecoration: "none",
            }}
          >
            <span style={{ marginRight: 8 }}>🔗</span> Connect Gmail
          </a>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>
            ✅ Gmail connected. Click scan to search your inbox for Colombia bookings.
          </div>

          {msg && (
            <div style={{ padding: "10px 14px", borderRadius: 8, background: results.length ? "#064e3b22" : "#1e3a5f22", color: results.length ? "#6ee7b7" : "#93c5fd", fontSize: 14, marginBottom: 16, border: `1px solid ${results.length ? "#6ee7b733" : "#60a5fa33"}` }}>
              {msg}
            </div>
          )}

          {results.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 10 }}>FOUND — REVIEW BEFORE ADDING</div>
              {results.map((t, i) => (
                <div key={i} style={{ background: "#0f1117", borderRadius: 10, padding: "12px 14px", marginBottom: 8, border: "1px solid #FCD11633" }}>
                  <div style={{ fontWeight: 700, color: "#FCD116", fontSize: 14 }}>🇨🇴 {t.note || "Colombia Stay"}</div>
                  <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>
                    {formatDate(t.start_date)} → {formatDate(t.end_date)}
                    {" · "}
                    <strong style={{ color: "#e8e4d9" }}>
                      {daysBetween(parseDate(t.start_date), parseDate(t.end_date))} days
                    </strong>
                  </div>
                </div>
              ))}
              <button
                onClick={handleAdd}
                disabled={saving}
                style={{ width: "100%", background: "#FCD116", color: "#16192a", border: "none", borderRadius: 10, padding: "12px", fontWeight: 700, fontSize: 15, marginTop: 4 }}
              >
                {saving ? "Adding…" : `Add ${results.length} Trip${results.length !== 1 ? "s" : ""} to Tracker`}
              </button>
            </div>
          )}

          <button
            onClick={handleScan}
            disabled={scanning}
            style={{ width: "100%", background: scanning ? "#2a2d3e" : "#16192a", color: scanning ? "#4b5563" : "#e8e4d9", border: "1px solid #2a2d3e", borderRadius: 10, padding: "12px", fontWeight: 700, fontSize: 15 }}
          >
            {scanning ? "Scanning inbox…" : "🔍 Scan Gmail Now"}
          </button>
        </div>
      )}
    </div>
  );
}
