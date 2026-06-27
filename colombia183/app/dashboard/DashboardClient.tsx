"use client";
import { useState } from "react";
import { Trip, computeRollingMax, getStatusLevel, toISO, getTripDays } from "@/lib/tax-logic";
import Navbar from "@/components/Navbar";
import TripRow from "@/components/TripRow";
import AddTripModal from "@/components/AddTripModal";
import EmailModal from "@/components/EmailModal";

export default function DashboardClient({
  initialTrips,
  userEmail,
}: {
  initialTrips: Trip[];
  userEmail: string;
}) {
  const [trips, setTrips] = useState<Trip[]>(initialTrips);
  const [showAdd, setShowAdd] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [editTrip, setEditTrip] = useState<Trip | null>(null);

  const { maxDays, windowStart, windowEnd } = computeRollingMax(trips);
  const status = getStatusLevel(maxDays);
  const remaining = Math.max(0, 183 - maxDays);
  const pct = Math.min(100, (maxDays / 183) * 100);

  const totalColDays = trips
    .filter(t => t.location === "colombia")
    .reduce((acc, t) => acc + getTripDays(t), 0);

  const statusColor = { safe: "#2f855a", warning: "#dd6b20", resident: "#e53e3e" }[status];
  const statusLabel = { safe: "✅ Safe", warning: "⚡ Approaching Limit", resident: "⚠️ Tax Resident" }[status];

  async function handleAdd(data: Omit<Trip, "id" | "user_id" | "created_at">) {
    const res = await fetch("/api/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.trip) setTrips(t => [json.trip, ...t]);
  }

  async function handleEdit(data: Omit<Trip, "id" | "user_id" | "created_at">) {
    if (!editTrip) return;
    const res = await fetch(`/api/trips/${editTrip.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.trip) setTrips(t => t.map(x => x.id === editTrip.id ? json.trip : x));
  }

  async function handleDelete(id: string) {
    await fetch(`/api/trips/${id}`, { method: "DELETE" });
    setTrips(t => t.filter(x => x.id !== id));
  }

  async function handleAddMultiple(newTrips: Omit<Trip, "id" | "user_id" | "created_at">[]) {
    const added: Trip[] = [];
    for (const t of newTrips) {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(t),
      });
      const json = await res.json();
      if (json.trip) added.push(json.trip);
    }
    setTrips(prev => [...added, ...prev]);
  }

  const recentTrips = [...trips].sort((a, b) => b.start_date > a.start_date ? 1 : -1).slice(0, 4);

  return (
    <>
      <Navbar email={userEmail} />

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 16px 80px" }}>

        {/* Status card */}
        <div style={{ background: "#16192a", borderRadius: 16, padding: "24px", marginBottom: 16, border: "1px solid #2a2d3e", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: statusColor }} />

          <div style={{ display: "flex", gap: 28, alignItems: "flex-start", flexWrap: "wrap" }}>
            {/* Gauge */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <svg width={190} height={105} viewBox="0 0 190 105">
                <path d="M 10 95 A 85 85 0 0 1 180 95" fill="none" stroke="#2a2d3e" strokeWidth={14} strokeLinecap="round" />
                <path d="M 10 95 A 85 85 0 0 1 180 95" fill="none" stroke={statusColor}
                  strokeWidth={14} strokeLinecap="round"
                  strokeDasharray={`${(pct / 100) * 267} 267`} />
                <text x="95" y="74" textAnchor="middle" fill={statusColor} fontSize="32" fontWeight="800" fontFamily="Inter, sans-serif">{maxDays}</text>
                <text x="95" y="92" textAnchor="middle" fill="#6b7280" fontSize="12" fontFamily="Inter, sans-serif">of 183 days</text>
              </svg>
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 180, paddingTop: 4 }}>
              <div style={{ display: "inline-block", background: statusColor + "22", color: statusColor, borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700, marginBottom: 12, border: `1px solid ${statusColor}44` }}>
                {statusLabel}
              </div>

              <div style={{ fontSize: 36, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{remaining}</div>
              <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 20 }}>days before residency threshold</div>

              {windowStart && windowEnd && (
                <div style={{ fontSize: 12, color: "#9ca3af", background: "#0f1117", borderRadius: 8, padding: "8px 12px" }}>
                  <span style={{ fontWeight: 700, color: "#6b7280" }}>Worst 365-day window · </span>
                  {new Date(windowStart).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  {" → "}
                  {new Date(windowEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </div>
              )}
            </div>
          </div>

          {status === "resident" && (
            <div style={{ marginTop: 16, background: "#7f1d1d22", border: "1px solid #ef444433", borderRadius: 10, padding: "12px 16px", fontSize: 14, color: "#fca5a5", lineHeight: 1.6 }}>
              You have exceeded 183 days in a rolling 365-day window. You may be considered a Colombian tax resident. Contact a Colombian tax advisor immediately.
            </div>
          )}
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
          {[
            { label: "Colombia days (total)", val: totalColDays },
            { label: "Stays logged", val: trips.length },
            { label: "Rolling max", val: `${maxDays} / 183` },
          ].map(s => (
            <div key={s.label} style={{ background: "#16192a", borderRadius: 12, padding: "14px", border: "1px solid #2a2d3e" }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#FCD116" }}>{s.val}</div>
              <div style={{ fontSize: 11, color: "#4b5563", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          <button onClick={() => { setEditTrip(null); setShowAdd(true); }} style={{ flex: 1, background: "#FCD116", color: "#16192a", border: "none", borderRadius: 10, padding: "13px", fontWeight: 700, fontSize: 15 }}>
            + Add Stay
          </button>
          <button onClick={() => setShowEmail(true)} style={{ flex: 1, background: "#16192a", color: "#e8e4d9", border: "1px solid #2a2d3e", borderRadius: 10, padding: "13px", fontWeight: 700, fontSize: 15 }}>
            ✉️ Flight Email
          </button>
        </div>

        {/* Recent trips */}
        {recentTrips.length > 0 && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#4b5563", letterSpacing: "0.08em", marginBottom: 10 }}>RECENT STAYS</div>
            {recentTrips.map(t => (
              <TripRow key={t.id} trip={t} onDelete={handleDelete} onEdit={trip => { setEditTrip(trip); setShowAdd(true); }} />
            ))}
          </div>
        )}

        {trips.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 24px", color: "#4b5563" }}>
            <div style={{ fontSize: 44, marginBottom: 16 }}>🗓️</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#6b7280", marginBottom: 8 }}>No stays logged yet</div>
            <div style={{ fontSize: 14 }}>Add your first Colombia stay or paste a flight confirmation email.</div>
          </div>
        )}

        {/* Disclaimer */}
        <div style={{ marginTop: 32, padding: "12px 16px", background: "#16192a", borderRadius: 10, border: "1px solid #2a2d3e", fontSize: 12, color: "#374151", lineHeight: 1.6 }}>
          <span style={{ color: "#FCD116", fontWeight: 700 }}>⚖️ Disclaimer:</span> Informational only. The 183-day threshold applies to any rolling 365-day period. Consult a Colombian tax professional.
        </div>
      </div>

      {/* Modals */}
      {showAdd && (
        <AddTripModal
          trip={editTrip}
          onSave={editTrip ? handleEdit : handleAdd}
          onClose={() => { setShowAdd(false); setEditTrip(null); }}
        />
      )}
      {showEmail && (
        <EmailModal onAdd={handleAddMultiple} onClose={() => setShowEmail(false)} />
      )}
    </>
  );
}
