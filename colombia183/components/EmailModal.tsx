"use client";
import { useState } from "react";
import { Trip, formatDate, parseDate, daysBetween } from "@/lib/tax-logic";

interface Props {
  onAdd: (trips: Omit<Trip, "id" | "user_id" | "created_at">[]) => Promise<void>;
  onClose: () => void;
}

export default function EmailModal({ onAdd, onClose }: Props) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed] = useState<Omit<Trip, "id" | "user_id" | "created_at">[]>([]);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  async function analyze() {
    if (!text.trim()) return;
    setLoading(true);
    setMsg("");
    setParsed([]);
    try {
      const res = await fetch("/api/analyze-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailText: text }),
      });
      const data = await res.json();
      if (data.trips?.length) {
        setParsed(data.trips);
        setMsg(`Found ${data.trips.length} Colombia trip${data.trips.length > 1 ? "s" : ""}. Review and confirm.`);
      } else {
        setMsg("No Colombia flights detected. Try pasting more of the email, or add a stay manually.");
      }
    } catch {
      setMsg("Something went wrong. Check your connection and try again.");
    }
    setLoading(false);
  }

  async function confirm() {
    setSaving(true);
    await onAdd(parsed);
    onClose();
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000b", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 200, padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 520, background: "#16192a", borderRadius: 20, padding: 28, border: "1px solid #2a2d3e", maxHeight: "90dvh", overflowY: "auto" }}>
        <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 4 }}>✉️ Paste Flight Email</div>
        <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>
          Paste your flight confirmation or itinerary. AI extracts your Colombia dates automatically.
        </div>

        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={8}
          placeholder={"Paste flight confirmation here...\n\nExample:\nAmerican Airlines Booking Confirmation\nFlight AA 902\nMiami (MIA) → Bogotá (BOG)\nDeparture: Mon, Jul 14 2025 at 8:45am\nReturn: Tue, Aug 5 2025"}
          style={{ width: "100%", resize: "vertical", fontFamily: "monospace", fontSize: 12, marginBottom: 16 }}
        />

        {msg && (
          <div style={{ padding: "10px 14px", borderRadius: 8, background: parsed.length ? "#064e3b22" : "#7f1d1d22", color: parsed.length ? "#6ee7b7" : "#fca5a5", fontSize: 14, marginBottom: 16, border: `1px solid ${parsed.length ? "#6ee7b733" : "#ef444433"}` }}>
            {msg}
          </div>
        )}

        {parsed.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: "0.08em", marginBottom: 10 }}>EXTRACTED — CONFIRM BEFORE ADDING</div>
            {parsed.map((t, i) => (
              <div key={i} style={{ background: "#0f1117", borderRadius: 10, padding: "12px 14px", marginBottom: 8, border: "1px solid #FCD11633" }}>
                <div style={{ fontWeight: 700, color: "#FCD116", fontSize: 14 }}>🇨🇴 Colombia Stay</div>
                <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>
                  {formatDate(t.start_date)} → {formatDate(t.end_date)}
                  {" · "}
                  <strong style={{ color: "#e8e4d9" }}>
                    {daysBetween(parseDate(t.start_date), parseDate(t.end_date))} days
                  </strong>
                </div>
                {t.note && <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>{t.note}</div>}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, background: "#0f1117", color: "#9ca3af", border: "1px solid #2a2d3e", borderRadius: 10, padding: "12px", fontWeight: 600, fontSize: 14 }}>
            Cancel
          </button>
          {parsed.length > 0 ? (
            <button onClick={confirm} disabled={saving} style={{ flex: 2, background: "#FCD116", color: "#16192a", border: "none", borderRadius: 10, padding: "12px", fontWeight: 700, fontSize: 15 }}>
              {saving ? "Adding…" : `Add ${parsed.length} Trip${parsed.length > 1 ? "s" : ""}`}
            </button>
          ) : (
            <button onClick={analyze} disabled={!text.trim() || loading} style={{ flex: 2, background: text.trim() && !loading ? "#FCD116" : "#2a2d3e", color: text.trim() && !loading ? "#16192a" : "#4b5563", border: "none", borderRadius: 10, padding: "12px", fontWeight: 700, fontSize: 15 }}>
              {loading ? "Analyzing…" : "Extract with AI"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
