"use client";
import { useState, useEffect } from "react";
import { Trip, parseDate, daysBetween } from "@/lib/tax-logic";

interface Props {
  trip?: Trip | null;
  onSave: (data: Omit<Trip, "id" | "user_id" | "created_at">) => Promise<void>;
  onClose: () => void;
}

interface LocationInfo {
  country: string;
  countryCode: string;
  city?: string;
  inColombia: boolean;
}

export default function AddTripModal({ trip, onSave, onClose }: Props) {
  const [location, setLocation] = useState<"colombia" | "planned">("colombia");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (trip) {
      setLocation(trip.location === "outside" ? "colombia" : trip.location as "colombia" | "planned");
      setStartDate(trip.start_date);
      setEndDate(trip.end_date);
      setNote(trip.note || "");
    } else {
      // Auto-detect location when opening for a new stay
      detectLocation();
    }
  }, [trip]);

  async function detectLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const countryCode = data.address?.country_code?.toUpperCase();
          const country = data.address?.country ?? "Unknown";
          const city = data.address?.city ?? data.address?.town ?? data.address?.state ?? "";
          const inColombia = countryCode === "CO";
          setLocationInfo({ country, countryCode, city, inColombia });
          // Auto-set type based on location
          setLocation(inColombia ? "colombia" : "planned");
        } catch {}
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 8000 }
    );
  }

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

  const locationColor = location === "colombia" ? "#FCD116" : "#60a5fa";

  const colombiaLabel = locationInfo?.inColombia
    ? `In Colombia${locationInfo.city ? ` · ${locationInfo.city}` : ""}`
    : "In Colombia";

  const plannedLabel = locationInfo && !locationInfo.inColombia
    ? `Planned Trip (currently in ${locationInfo.country})`
    : "Planned Trip";

  const locationOptions = [
    { v: "colombia" as const, label: colombiaLabel, desc: "Confirmed past or current stay" },
    { v: "planned" as const, label: plannedLabel, desc: "Future Colombia stay" },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000a", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 200, padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 480, background: "#16192a", borderRadius: 20, padding: 28, border: "1px solid #2a2d3e", boxShadow: "0 -4px 40px #000a", maxHeight: "90dvh", overflowY: "auto" }}>
        <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 4 }}>{trip ? "Edit Stay" : "Add Stay"}</div>
        <div style={{ fontSize: 13, color: "#6b7280", marginBottom: locating ? 8 : 24 }}>
          Log a confirmed stay or plan a future trip to Colombia.
        </div>

        {/* Location detection status */}
        {locating && (
          <div style={{ fontSize: 12, color: "#60a5fa", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
            <span>📍</span> Detecting your location…
          </div>
        )}

        {locationInfo && !locating && (
          <div style={{ fontSize: 12, marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ color: locationInfo.inColombia ? "#6ee7b7" : "#93c5fd" }}>
              📍 {locationInfo.inColombia ? "You're in Colombia" : `You're in ${locationInfo.country}`}
              {locationInfo.city ? ` · ${locationInfo.city}` : ""}
            </span>
            <button
              onClick={detectLocation}
              style={{ background: "transparent", border: "none", color: "#6b7280", fontSize: 11, cursor: "pointer", textDecoration: "underline" }}
            >
              Refresh
            </button>
          </div>
        )}

        {!locationInfo && !locating && (
          <button
            onClick={detectLocation}
            style={{ fontSize: 12, color: "#6b7280", background: "transparent", border: "1px solid #2a2d3e", borderRadius: 6, padding: "4px 10px", cursor: "pointer", marginBottom: 16 }}
          >
            📍 Detect my location
          </button>
        )}

        {/* Type toggle */}
        <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", marginBottom: 8 }}>TYPE</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          {locationOptions.map(o => (
            <button
              key={o.v}
              onClick={() => setLocation(o.v)}
              style={{
                padding: "11px 14px", borderRadius: 8, textAlign: "left",
                border: `2px solid ${location === o.v ? locationColor : "#2a2d3e"}`,
                background: location === o.v ? locationColor + "15" : "transparent",
                color: location === o.v ? locationColor : "#9ca3af",
                fontWeight: 600, fontSize: 14, cursor: "pointer",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}
            >
              <span>{o.label}</span>
              <span style={{ fontSize: 11, fontWeight: 400, opacity: 0.7 }}>{o.desc}</span>
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
          <button onClick={onClose} style={{ flex: 1, background: "#0f1117", color: "#9ca3af", border: "1px solid #2a2d3e", borderRadius: 10, padding: "12px", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !startDate || !endDate}
            style={{ flex: 2, background: startDate && endDate ? locationColor : "#2a2d3e", color: startDate && endDate ? "#16192a" : "#4b5563", border: "none", borderRadius: 10, padding: "12px", fontWeight: 700, fontSize: 15, cursor: "pointer" }}
          >
            {saving ? "Saving…" : trip ? "Save Changes" : location === "planned" ? "Add Planned Trip" : "Log Stay"}
          </button>
        </div>
      </div>
    </div>
  );
}
