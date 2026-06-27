export interface Trip {
  id: string;
  user_id?: string;
  location: "colombia" | "outside";
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  note?: string;
  created_at?: string;
}

export function parseDate(str: string): Date {
  const d = new Date(str + "T12:00:00");
  return d;
}

export function toISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86400000) + 1;
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function formatDate(str: string): string {
  if (!str) return "";
  const d = parseDate(str);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export interface RollingResult {
  maxDays: number;
  windowStart: Date | null;
  windowEnd: Date | null;
}

export function computeRollingMax(trips: Trip[]): RollingResult {
  const stays = trips
    .filter(t => t.location === "colombia" && t.start_date && t.end_date)
    .map(t => ({ start: parseDate(t.start_date), end: parseDate(t.end_date) }))
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  if (!stays.length) return { maxDays: 0, windowStart: null, windowEnd: null };

  const today = new Date();
  today.setHours(12, 0, 0, 0);

  let maxDays = 0;
  let bestStart: Date | null = null;
  let bestEnd: Date | null = null;

  const candidates = [...stays.map(s => s.start), addDays(today, -364)];

  for (const windowStart of candidates) {
    const windowEnd = addDays(windowStart, 364);
    let count = 0;
    for (const s of stays) {
      const overlapStart = new Date(Math.max(s.start.getTime(), windowStart.getTime()));
      const overlapEnd = new Date(Math.min(s.end.getTime(), windowEnd.getTime()));
      if (overlapEnd >= overlapStart) {
        count += daysBetween(overlapStart, overlapEnd);
      }
    }
    if (count > maxDays) {
      maxDays = count;
      bestStart = windowStart;
      bestEnd = windowEnd;
    }
  }

  return { maxDays, windowStart: bestStart, windowEnd: bestEnd };
}

export function getTripDays(trip: Trip): number {
  if (!trip.start_date || !trip.end_date) return 0;
  return daysBetween(parseDate(trip.start_date), parseDate(trip.end_date));
}

export function getStatusLevel(maxDays: number): "safe" | "warning" | "resident" {
  if (maxDays >= 183) return "resident";
  if (maxDays >= 150) return "warning";
  return "safe";
}
