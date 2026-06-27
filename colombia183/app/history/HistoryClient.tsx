"use client";
import { useState } from "react";
import { Trip, getTripDays } from "@/lib/tax-logic";
import Navbar from "@/components/Navbar";
import TripRow from "@/components/TripRow";
import AddTripModal from "@/components/AddTripModal";

export default function HistoryClient({ initialTrips, userEmail }: { initialTrips: Trip[]; userEmail: string }) {
  const [trips, setTrips] = useState<Trip[]>(initialTrips);
  const [filter, setFilter] = useState<"all" | "colombia" | "outside">("all");
  const [editTrip, setEditTrip] = useState<Trip | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const filtered = trips
    .filter(t => filter === "all" || t.location === filter)
    .sort((a, b) => b.start_date > a.start_date ? 1 : -1);

  const totalColombia = trips.filter(t => t.location === "colombia").reduce((a, t) => a + getTripDays(t), 0);
  const totalOutside = trips.filter(t => t.location === "outside").reduce((a, t) => a + getTripDays(t), 0);

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

  async function handleAdd(data: Omit<Trip, "id" | "user_id" | "created_at">) {
    const res = await fetch("/api/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.trip) setTrips(t => [json.trip, ...t]);
  }

  return (
    <>
      <Navbar email={userEmail} />
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 16px 80px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.5px" }}>Stay History</h1>
            <p style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>{trips.length} entries · {totalColombia} days in Colombia · {totalOutside} days outside</p>
          </div>
          <button onClick={() => { setEditTrip(null); setShowAdd(true); }} style={{ background: "#FCD116", color: "#16192a", border: "none", borderRadius: 8, padding: "9px 18px", fontWeight: 700, fontSize: 14 }}>
            + Add Stay
          </button>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20, background: "#16192a", padding: 4, borderRadius: 10, border: "1px solid #2a2d3e" }}>
          {([["all", "All"], ["colombia", "🇨🇴 Colombia"], ["outside", "✈️ Outside"]] as const).map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v)} style={{ flex: 1, padding: "8px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 600, background: filter === v ? "#FCD116" : "transparent", color: filter === v ? "#16192a" : "#6b7280", transition: "all .15s" }}>
              {l}
            </button>
          ))}
        </div>

        {/* Trips */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#4b5563" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
            <div style={{ fontWeight: 600, color: "#6b7280" }}>No {filter !== "all" ? filter : ""} stays found</div>
          </div>
        ) : (
          filtered.map(t => (
            <TripRow key={t.id} trip={t} onDelete={handleDelete} onEdit={trip => { setEditTrip(trip); setShowAdd(true); }} />
          ))
        )}
      </div>

      {showAdd && (
        <AddTripModal
          trip={editTrip}
          onSave={editTrip ? handleEdit : handleAdd}
          onClose={() => { setShowAdd(false); setEditTrip(null); }}
        />
      )}
    </>
  );
}
