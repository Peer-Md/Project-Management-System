export function parseISODate(dateStr) {
  return new Date(`${dateStr}T00:00:00.000Z`);
}

export function formatISODate(date) {
  return date.toISOString().slice(0, 10);
}

export function addDays(date, days) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function durationFromDates(startDate, endDate) {
  const ms = parseISODate(endDate) - parseISODate(startDate);
  return Math.max(1, Math.floor(ms / (1000 * 60 * 60 * 24)) + 1);
}
