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
  // Primary: days in Colombia in the last 365 days from TODAY
  daysLast365: number;
  windowStart: Date;
  windowEnd: Date;
  // Secondary: worst historical window (may be higher)
  worstDays: number;
  worstWindowStart: Date | null;
  worstWindowEnd: Date | null;
}

export function computeRolling(trips: Trip[]): RollingResult {
  const stays = trips
    .filter(t => t.location === "colombia" && t.start_date && t.end_date)
    .map(t => ({ start: parseDate(t.start_date), end: parseDate(t.end_date) }))
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const windowStart = addDays(today, -364); // 365-day window ending today

  // PRIMARY: count days in last 365 days from today
  let daysLast365 = 0;
  for (const s of stays) {
    const overlapStart = new Date(Math.max(s.start.getTime(), windowStart.getTime()));
    const overlapEnd = new Date(Math.min(s.end.getTime(), today.getTime()));
    if (overlapEnd >= overlapStart) {
      daysLast365 += daysBetween(overlapStart, overlapEnd);
    }
  }

  // SECONDARY: check all historical windows to find worst ever
  let worstDays = daysLast365;
  let worstWindowStart: Date | null = windowStart;
  let worstWindowEnd: Date | null = today;

  for (const s of stays) {
    const wStart = s.start;
    const wEnd = addDays(wStart, 364);
    let count = 0;
    for (const s2 of stays) {
      const overlapStart = new Date(Math.max(s2.start.getTime(), wStart.getTime()));
      const overlapEnd = new Date(Math.min(s2.end.getTime(), wEnd.getTime()));
      if (overlapEnd >= overlapStart) {
        count += daysBetween(overlapStart, overlapEnd);
      }
    }
    if (count > worstDays) {
      worstDays = count;
      worstWindowStart = wStart;
      worstWindowEnd = wEnd;
    }
  }

  return {
    daysLast365,
    windowStart,
    windowEnd: today,
    worstDays,
    worstWindowStart,
    worstWindowEnd,
  };
}

export function getTripDays(trip: Trip): number {
  if (!trip.start_date || !trip.end_date) return 0;
  return daysBetween(parseDate(trip.start_date), parseDate(trip.end_date));
}

export function getStatusLevel(days: number): "safe" | "warning" | "resident" {
  if (days >= 183) return "resident";
  if (days >= 150) return "warning";
  return "safe";
}
