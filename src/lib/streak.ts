export function atMidnight(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function dateKey(date: Date) {
  return atMidnight(date).toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/** Consecutive days completed, counting back from today (or yesterday if today isn't done yet). */
export function calculateStreak(completionDates: Date[]): number {
  const done = new Set(completionDates.map(dateKey));
  const today = atMidnight(new Date());

  let cursor = done.has(dateKey(today)) ? today : addDays(today, -1);
  let streak = 0;
  while (done.has(dateKey(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

/** Last `days` dates (oldest first) for a week/history strip. */
export function lastDays(days: number): Date[] {
  const today = atMidnight(new Date());
  return Array.from({ length: days }, (_, i) => addDays(today, i - (days - 1)));
}
