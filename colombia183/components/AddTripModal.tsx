"use client";
import { useState, useEffect } from "react";
import { Trip, parseDate, daysBetween } from "@/lib/tax-logic";

interface Props {
  trip?: Trip | null;
  onSave: (data: Omit<Trip, "id" | "user_id" | "created_at">) => Promise<void>;
  onClose: () => void;
}

export default function AddTripModal({ trip, onSave, onClose }: Props) {
  const [location, setLocation] = useState<"colombia" | "planned">("colombia");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (trip) {
      setLocation(trip.location === "outside" ? "colombia" : trip.location as "colombia" | "planned");
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

  const locationOptions = [
    { v: "colombia" as const, label: "🇨🇴 In Colombia", desc: "Confirmed past or current stay" },
    { v: "planned" as const, label: "📅 Planned Trip", desc: "Future Colombia stay" },
  ];

  const locationColor = location === "colombia" ? "#FCD116" : "#60a5fa";

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000a", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 200, padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 480, background: "#16192a", borderRadius: 20, padding: 28, border: "1px solid #2a2d3e", boxShadow: "0 -4px 40px #000a", maxHeight: "90dvh", overflowY: "auto" }}>
        <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 4 }}>{trip ? "Edit Stay" : "Add Stay"}</div>
        <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 24 }}>Log a confirmed stay or plan a future trip to Colombia.</div>

        {/* Location toggle */}
        <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", marginBottom: 8 }}>TYPE</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {locationOptions.map(o => (
            <button
              key={o.v}
              onClick={() => setLocation(o.v)}
              style={{
                flex: 1, padding: "11px 14px", borderRadius: 8, textAlign: "left",
                border: `2px solid ${location === o.v ? locationColor : "#2a2d3e"}`,
                background: location === o.v ? locationColor + "15" : "transparent",
                color: location === o.v ? locationColor : "#9ca3af",
                fontWeight: 600, fontSize: 14,
              }}
            >
              <div>{o.label}</div>
              <div style={{ fontSize: 11, fontWeight: 400, opacity: 0.7, marginTop: 2 }}>{o.desc}</div>
            </button>
          ))}
        </div>

        {/* Dates */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", marginBottom: 6 }}>
              {location === "planned" ? "PLANNED ARRIVAL" : "ARRIVAL"}
            </div>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", marginBottom: 6 }}>
              {location === "planned" ? "PLANNED DEPARTURE" : "DEPARTURE"}
            </div>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>

        {previewDays !== null && (
          <div style={{ background: "#0f1117", borderRadius: 8, padding: "9px 14px", fontSize: 14, color: locationColor, marginBottom: 16, fontWeight: 700 }}>
            {previewDays} day{previewDays !== 1 ? "s" : ""}
            {location === "colombia" ? " in Colombia" : " planned in Colombia"}
          </div>
        )}

        {location === "planned" && (
          <div style={{ background: "#1e3a5f22", border: "1px solid #60a5fa33", borderRadius: 8, padding: "9px 14px", fontSize: 13, color: "#93c5fd", marginBottom: 16, lineHeight: 1.6 }}>
            📅 Planned trips show your projected count — they won't affect your actual count until the dates pass.
          </div>
        )}

        <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", marginBottom: 6 }}>NOTE (OPTIONAL)</div>
        <input value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Bogotá work trip, Cartagena vacation" style={{ marginBottom: 20 }} />

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
            style={{ flex: 2, background: startDate && endDate ? locationColor : "#2a2d3e", color: startDate && endDate ? "#16192a" : "#4b5563", border: "none", borderRadius: 10, padding: "12px", fontWeight: 700, fontSize: 15 }}
          >
            {saving ? "Saving…" : trip ? "Save Changes" : location === "planned" ? "Add Planned Trip" : "Log Stay"}
          </button>
        </div>
      </div>
    </div>
  );
}
