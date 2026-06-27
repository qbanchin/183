export interface Trip {
  id: string;
  user_id?: string;
  location: "colombia" | "outside" | "planned";
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  note?: string;
  created_at?: string;
}

export function parseDate(str: string): Date {
  return new Date(str + "T12:00:00");
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
  // Actual: only past + current days in last 365 days from today
  daysLast365: number;
  // Projected: actual + planned future Colombia stays in the next 365 days
  projectedDays: number;
  windowStart: Date;
  windowEnd: Date;
  // Worst historical window
  worstDays: number;
  worstWindowStart: Date | null;
  worstWindowEnd: Date | null;
}

export function computeRolling(trips: Trip[]): RollingResult {
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  const windowStart = addDays(today, -364); // 365-day window ending today

  // Confirmed past/current Colombia stays
  const confirmedStays = trips
    .filter(t => t.location === "colombia" && t.start_date && t.end_date)
    .map(t => ({ start: parseDate(t.start_date), end: parseDate(t.end_date) }));

  // Planned future Colombia stays
  const plannedStays = trips
    .filter(t => t.location === "planned" && t.start_date && t.end_date)
    .map(t => ({ start: parseDate(t.start_date), end: parseDate(t.end_date) }));

  // ACTUAL: count confirmed days in last 365 days (up to today only)
  let daysLast365 = 0;
  for (const s of confirmedStays) {
    const overlapStart = new Date(Math.max(s.start.getTime(), windowStart.getTime()));
    const overlapEnd = new Date(Math.min(s.end.getTime(), today.getTime()));
    if (overlapEnd >= overlapStart) {
      daysLast365 += daysBetween(overlapStart, overlapEnd);
    }
  }

  // PROJECTED: actual days + planned future stays
  // For each planned stay, count days that fall within a rolling 365-day window
  // We check the window from today - 364 through the end of the planned stay
  let projectedDays = daysLast365;
  for (const s of plannedStays) {
    // Only count future planned days (start from tomorrow)
    const futureStart = new Date(Math.max(s.start.getTime(), addDays(today, 1).getTime()));
    const futureEnd = s.end;
    if (futureEnd < futureStart) continue;

    // The rolling window shifts as days pass — use the worst case window
    // which starts 364 days before the end of the planned stay
    const worstWindowForPlanned = addDays(futureEnd, -364);
    const effectiveWindowStart = new Date(Math.max(windowStart.getTime(), worstWindowForPlanned.getTime()));

    // Count confirmed days in that window
    let confirmedInWindow = 0;
    for (const c of confirmedStays) {
      const os = new Date(Math.max(c.start.getTime(), effectiveWindowStart.getTime()));
      const oe = new Date(Math.min(c.end.getTime(), futureEnd.getTime()));
      if (oe >= os) confirmedInWindow += daysBetween(os, oe);
    }

    // Count planned days in that window
    const plannedInWindow = daysBetween(
      new Date(Math.max(futureStart.getTime(), effectiveWindowStart.getTime())),
      futureEnd
    );

    const totalInWindow = confirmedInWindow + plannedInWindow;
    if (totalInWindow > projectedDays) projectedDays = totalInWindow;
  }

  // WORST HISTORICAL: check all windows starting from any confirmed stay
  let worstDays = daysLast365;
  let worstWindowStart: Date | null = windowStart;
  let worstWindowEnd: Date | null = today;

  for (const s of confirmedStays) {
    const wStart = s.start;
    const wEnd = addDays(wStart, 364);
    let count = 0;
    for (const s2 of confirmedStays) {
      const os = new Date(Math.max(s2.start.getTime(), wStart.getTime()));
      const oe = new Date(Math.min(s2.end.getTime(), wEnd.getTime()));
      if (oe >= os) count += daysBetween(os, oe);
    }
    if (count > worstDays) {
      worstDays = count;
      worstWindowStart = wStart;
      worstWindowEnd = wEnd;
    }
  }

  return {
    daysLast365,
    projectedDays,
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

export function isFuture(trip: Trip): boolean {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return parseDate(trip.start_date) > today;
}
