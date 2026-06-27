"use client";
import { useState } from "react";
import { Trip, computeRolling, getStatusLevel, toISO, getTripDays, formatDate } from "@/lib/tax-logic";
import Navbar from "@/components/Navbar";
import TripRow from "@/components/TripRow";
import AddTripModal from "@/components/AddTripModal";
import EmailModal from "@/components/EmailModal";
import GmailScanner from "@/components/GmailScanner";
import InstallPrompt from "@/components/InstallPrompt";

export default function DashboardClient({
  initialTrips,
  userEmail,
  gmailConnected,
}: {
  initialTrips: Trip[];
  userEmail: string;
  gmailConnected: boolean;
}) {
  const [trips, setTrips] = useState<Trip[]>(initialTrips);
  const [showAdd, setShowAdd] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [editTrip, setEditTrip] = useState<Trip | null>(null);

  const { daysLast365, projectedDays, windowStart, windowEnd, worstDays, worstWindowStart, worstWindowEnd } = computeRolling(trips);

  const status = getStatusLevel(daysLast365);
  const projectedStatus = getStatusLevel(projectedDays);
  const remaining = Math.max(0, 183 - daysLast365);
  const projectedRemaining = Math.max(0, 183 - projectedDays);
  const pct = Math.min(100, (daysLast365 / 183) * 100);
  const projectedPct = Math.min(100, (projectedDays / 183) * 100);

  const hasPlanned = trips.some(t => t.location === "planned");
  const totalColDays = trips.filter(t => t.location === "colombia").reduce((acc, t) => acc + getTripDays(t), 0);
  const plannedDays = trips.filter(t => t.location === "planned").reduce((acc, t) => acc + getTripDays(t), 0);

  const statusColor = { safe: "#2f855a", warning: "#dd6b20", resident: "#e53e3e" }[status];
  const projectedColor = { safe: "#2f855a", warning: "#dd6b20", resident: "#e53e3e" }[projectedStatus];
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

  const recentTrips = [...trips].sort((a, b) => b.start_date > a.start_date ? 1 : -1).slice(0, 5);
  const showWorstWarning = worstDays > daysLast365 && worstDays >= 150;

  return (
    <>
      <Navbar email={userEmail} />
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "12px 16px 0" }}><InstallPrompt /></div>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 16px 80px" }}>

        {/* Primary status card */}
        <div style={{ background: "#16192a", borderRadius: 16, padding: "24px", marginBottom: 12, border: "1px solid #2a2d3e", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: statusColor }} />

          <div style={{ fontSize: 11, fontWeight: 700, color: "#4b5563", letterSpacing: "0.08em", marginBottom: 16 }}>
            ACTUAL · LAST 365 DAYS · {formatDate(toISO(windowStart))} → {formatDate(toISO(windowEnd))}
          </div>

          <div style={{ display: "flex", gap: 28, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <svg width={190} height={105} viewBox="0 0 190 105">
                <path d="M 10 95 A 85 85 0 0 1 180 95" fill="none" stroke="#2a2d3e" strokeWidth={14} strokeLinecap="round" />
                <path d="M 10 95 A 85 85 0 0 1 180 95" fill="none" stroke={statusColor}
                  strokeWidth={14} strokeLinecap="round"
                  strokeDasharray={`${(pct / 100) * 267} 267`} />
                <text x="95" y="74" textAnchor="middle" fill={statusColor} fontSize="32" fontWeight="800" fontFamily="Inter, sans-serif">{daysLast365}</text>
                <text x="95" y="92" textAnchor="middle" fill="#6b7280" fontSize="12" fontFamily="Inter, sans-serif">of 183 days</text>
              </svg>
            </div>

            <div style={{ flex: 1, minWidth: 180, paddingTop: 4 }}>
              <div style={{ display: "inline-block", background: statusColor + "22", color: statusColor, borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700, marginBottom: 12, border: `1px solid ${statusColor}44` }}>
                {statusLabel}
              </div>
              <div style={{ fontSize: 36, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{remaining}</div>
              <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 16 }}>days remaining before residency</div>
              <div style={{ fontSize: 12, color: "#4b5563", background: "#0f1117", borderRadius: 8, padding: "8px 12px", lineHeight: 1.6 }}>
                Resets daily - any stays 366 days or more just dropped off.
              </div>
            </div>
          </div>

          {status === "resident" && (
            <div style={{ marginTop: 16, background: "#7f1d1d22", border: "1px solid #ef444433", borderRadius: 10, padding: "12px 16px", fontSize: 14, color: "#fca5a5", lineHeight: 1.6 }}>
              You have exceeded 183 days in the last 365 days. You may be a Colombian tax resident. Contact a tax advisor immediately.
            </div>
          )}
        </div>

        {/* Projected card */}
        {hasPlanned && (
          <div style={{ background: "#16192a", borderRadius: 16, padding: "20px 24px", marginBottom: 12, border: "1px solid #60a5fa33", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "#60a5fa" }} />
            <div style={{ fontSize: 11, fontWeight: 700, color: "#4b5563", letterSpacing: "0.08em", marginBottom: 14 }}>
              PROJECTED · IF ALL PLANNED TRIPS HAPPEN
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
              <svg width={150} height={85} viewBox="0 0 190 105">
                <path d="M 10 95 A 85 85 0 0 1 180 95" fill="none" stroke="#2a2d3e" strokeWidth={14} strokeLinecap="round" />
                <path d="M 10 95 A 85 85 0 0 1 180 95" fill="none" stroke={projectedColor}
                  strokeWidth={14} strokeLinecap="round"
                  strokeDasharray={`${(projectedPct / 100) * 267} 267`} />
                <text x="95" y="74" textAnchor="middle" fill={projectedColor} fontSize="32" fontWeight="800" fontFamily="Inter, sans-serif">{projectedDays}</text>
                <text x="95" y="92" textAnchor="middle" fill="#6b7280" fontSize="12" fontFamily="Inter, sans-serif">of 183 days</text>
              </svg>
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: projectedColor, lineHeight: 1 }}>{projectedRemaining}</div>
                <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 10 }}>days buffer with planned trips</div>
                <div style={{ fontSize: 12, color: "#60a5fa", background: "#60a5fa11", borderRadius: 8, padding: "8px 12px" }}>
                  +{plannedDays} planned days · {projectedDays - daysLast365} would count toward limit
                </div>
                {projectedDays >= 183 && (
                  <div style={{ marginTop: 10, fontSize: 13, color: "#fca5a5", background: "#7f1d1d22", borderRadius: 8, padding: "8px 12px" }}>
                    ⚠️ Your planned trips would push you over 183 days.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Worst historical warning */}
        {showWorstWarning && worstWindowStart && worstWindowEnd && (
          <div style={{ background: "#16192a", borderRadius: 12, padding: "14px 16px", marginBottom: 12, border: "1px solid #dd6b2033" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#dd6b20", marginBottom: 4 }}>⚠️ Historical Peak</div>
            <div style={{ fontSize: 13, color: "#9ca3af" }}>
              Your highest recorded 365-day count was <strong style={{ color: "#FCD116" }}>{worstDays} days</strong> in the window{" "}
              {formatDate(toISO(worstWindowStart))} → {formatDate(toISO(worstWindowEnd))}.
              {worstDays >= 183 && " This may have triggered tax residency in that period."}
            </div>
          </div>
        )}

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
          {[
            { label: "Days in last 365", val: daysLast365 },
            { label: "Planned days", val: plannedDays },
            { label: "All-time Colombia days", val: totalColDays },
          ].map(s => (
            <div key={s.label} style={{ background: "#16192a", borderRadius: 12, padding: "14px", border: "1px solid #2a2d3e" }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#FCD116" }}>{s.val}</div>
              <div style={{ fontSize: 11, color: "#4b5563", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <button onClick={() => { setEditTrip(null); setShowAdd(true); }} style={{ flex: 1, background: "#FCD116", color: "#16192a", border: "none", borderRadius: 10, padding: "13px", fontWeight: 700, fontSize: 15 }}>
            + Add Stay
          </button>
          <button onClick={() => setShowEmail(true)} style={{ flex: 1, background: "#16192a", color: "#e8e4d9", border: "1px solid #2a2d3e", borderRadius: 10, padding: "13px", fontWeight: 700, fontSize: 15 }}>
            ✉️ Paste Email
          </button>
        </div>

        {/* Gmail Scanner */}
        <div style={{ marginBottom: 24 }}>
          <GmailScanner onAdd={handleAddMultiple} gmailConnected={gmailConnected} />
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
            <div style={{ fontSize: 14 }}>Add a confirmed stay, plan a future trip, paste an email, or scan Gmail.</div>
          </div>
        )}

        <div style={{ marginTop: 32, padding: "12px 16px", background: "#16192a", borderRadius: 10, border: "1px solid #2a2d3e", fontSize: 12, color: "#374151", lineHeight: 1.6 }}>
          <span style={{ color: "#FCD116", fontWeight: 700 }}>⚖️ Disclaimer:</span> Informational only. The 183-day threshold applies to any rolling 365-day period under Colombia's Tax Code (Art. 10). Consult a Colombian tax professional.
        </div>
      </div>

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
