"use client";
import { useState, useEffect } from "react";
import { Trip, parseDate, daysBetween } from "@/lib/tax-logic";

interface Props {
  trip?: Trip | null;
  onSave: (data: Omit<Trip, "id" | "user_id" | "created_at">) => Promise<void>;
  onClose: () => void;
}

export default function AddTripModal({ trip, onSave, onClose }: Props) {
  const [location, setLocation] = useState<"colombia" | "outside">("colombia");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (trip) {
      setLocation(trip.location);
      setStartDate(trip.start_date);
      setEndDate(trip.end_date);
      setNote(trip.note || "");
    }
  }, [trip]);

  const previewDays =
    startDate && endDate && parseDate(startDate) <= parseDate(endDate)
      ? daysBetween(parseDate(startDate), parseDate(endDate))
      : null;

  async function handleSave() {
    if (!startDate || !endDate) { setError("Both dates are required."); return; }
    if (parseDate(startDate) > parseDate(endDate)) { setError("Arrival must be before departure."); return; }
    setSaving(true);
    setError("");
    try {
      await onSave({ location, start_date: startDate, end_date: endDate, note });
      onClose();
    } catch {
      setError("Could not save. Try again.");
      setSaving(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000a", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 200, padding: 16 }}>
      <div
        style={{ width: "100%", maxWidth: 480, background: "#16192a", borderRadius: 20, padding: 28, border: "1px solid #2a2d3e", boxShadow: "0 -4px 40px #000a" }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 4 }}>{trip ? "Edit Stay" : "Add Stay"}</div>
        <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 24 }}>Log a period spent in or outside Colombia.</div>

        {/* Location toggle */}
        <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", marginBottom: 8 }}>LOCATION</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {(["colombia", "outside"] as const).map(loc => (
            <button
              key={loc}
              onClick={() => setLocation(loc)}
              style={{
                flex: 1, padding: "10px", borderRadius: 8,
                border: `2px solid ${location === loc ? "#FCD116" : "#2a2d3e"}`,
                background: location === loc ? "#FCD11615" : "transparent",
                color: location === loc ? "#FCD116" : "#9ca3af",
                fontWeight: 700, fontSize: 14,
              }}
            >
              {loc === "colombia" ? "🇨🇴 In Colombia" : "✈️ Outside Colombia"}
            </button>
          ))}
        </div>

        {/* Dates */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", marginBottom: 6 }}>ARRIVAL</div>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", marginBottom: 6 }}>DEPARTURE</div>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>

        {previewDays !== null && (
          <div style={{ background: "#0f1117", borderRadius: 8, padding: "9px 14px", fontSize: 14, color: "#FCD116", marginBottom: 16, fontWeight: 700 }}>
            {previewDays} day{previewDays !== 1 ? "s" : ""} {location === "colombia" ? "in Colombia" : "outside Colombia"}
          </div>
        )}

        {/* Note */}
        <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", marginBottom: 6 }}>NOTE (OPTIONAL)</div>
        <input value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Bogotá work trip, vacation in Cartagena" style={{ marginBottom: 20 }} />

        {error && (
          <div style={{ background: "#7f1d1d22", border: "1px solid #ef444433", borderRadius: 8, padding: "9px 14px", color: "#fca5a5", fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, background: "#0f1117", color: "#9ca3af", border: "1px solid #2a2d3e", borderRadius: 10, padding: "12px", fontWeight: 600, fontSize: 14 }}>
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !startDate || !endDate}
            style={{ flex: 2, background: startDate && endDate ? "#FCD116" : "#2a2d3e", color: startDate && endDate ? "#16192a" : "#4b5563", border: "none", borderRadius: 10, padding: "12px", fontWeight: 700, fontSize: 15 }}
          >
            {saving ? "Saving…" : trip ? "Save Changes" : "Log Stay"}
          </button>
        </div>
      </div>
    </div>
  );
}
