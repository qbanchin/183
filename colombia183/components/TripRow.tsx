"use client";
import { Trip, formatDate, getTripDays, isFuture } from "@/lib/tax-logic";

interface Props {
  trip: Trip;
  onDelete: (id: string) => void;
  onEdit: (trip: Trip) => void;
}

export default function TripRow({ trip, onDelete, onEdit }: Props) {
  const isPlanned = trip.location === "planned";
  const days = getTripDays(trip);
  const future = isFuture(trip);

  const icon = isPlanned ? "📅" : "🇨🇴";
  const borderColor = isPlanned ? "#60a5fa55" : "#FCD11633";
  const leftColor = isPlanned ? "#60a5fa" : "#FCD116";
  const dayColor = isPlanned ? "#60a5fa" : "#FCD116";
  const label = isPlanned ? "Planned Colombia Trip" : "In Colombia";

  return (
    <div style={{
      background: "#16192a",
      border: `1px solid ${borderColor}`,
      borderLeft: `4px solid ${leftColor}`,
      borderRadius: 10,
      padding: "13px 14px",
      marginBottom: 8,
      display: "flex",
      alignItems: "center",
      gap: 12,
      opacity: isPlanned ? 0.85 : 1,
    }}>
      <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: "#e8e4d9", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {label}
          <span style={{ fontWeight: 800, color: dayColor, fontSize: 13 }}>{days}d</span>
          {isPlanned && (
            <span style={{ fontSize: 10, fontWeight: 700, color: "#60a5fa", background: "#60a5fa22", borderRadius: 4, padding: "1px 6px" }}>PLANNED</span>
          )}
          {future && !isPlanned && (
            <span style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", background: "#a78bfa22", borderRadius: 4, padding: "1px 6px" }}>UPCOMING</span>
          )}
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
        <button onClick={() => onEdit(trip)} style={{ background: "transparent", border: "1px solid #374151", color: "#9ca3af", borderRadius: 6, padding: "4px 10px", fontSize: 12 }}>
          Edit
        </button>
        <button onClick={() => onDelete(trip.id)} style={{ background: "transparent", border: "1px solid #374151", color: "#ef4444", borderRadius: 6, padding: "4px 10px", fontSize: 12 }}>
          ✕
        </button>
      </div>
    </div>
  );
}
