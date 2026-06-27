"use client";
import { Trip, formatDate, getTripDays } from "@/lib/tax-logic";

interface Props {
  trip: Trip;
  onDelete: (id: string) => void;
  onEdit: (trip: Trip) => void;
}

export default function TripRow({ trip, onDelete, onEdit }: Props) {
  const isColombia = trip.location === "colombia";
  const days = getTripDays(trip);

  return (
    <div style={{
      background: "#16192a",
      border: `1px solid ${isColombia ? "#FCD11633" : "#2a2d3e"}`,
      borderLeft: `4px solid ${isColombia ? "#FCD116" : "#374151"}`,
      borderRadius: 10,
      padding: "13px 14px",
      marginBottom: 8,
      display: "flex",
      alignItems: "center",
      gap: 12,
    }}>
      <span style={{ fontSize: 20, flexShrink: 0 }}>{isColombia ? "🇨🇴" : "✈️"}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: "#e8e4d9", display: "flex", alignItems: "center", gap: 8 }}>
          {isColombia ? "In Colombia" : "Outside Colombia"}
          <span style={{ fontWeight: 800, color: isColombia ? "#FCD116" : "#6b7280", fontSize: 13 }}>{days}d</span>
        </div>
        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
          {formatDate(trip.start_date)} → {formatDate(trip.end_date)}
        </div>
        {trip.note && (
          <div style={{ fontSize: 11, color: "#4b5563", marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {trip.note}
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        <button
          onClick={() => onEdit(trip)}
          style={{ background: "transparent", border: "1px solid #374151", color: "#9ca3af", borderRadius: 6, padding: "4px 10px", fontSize: 12 }}
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(trip.id)}
          style={{ background: "transparent", border: "1px solid #374151", color: "#ef4444", borderRadius: 6, padding: "4px 10px", fontSize: 12 }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
