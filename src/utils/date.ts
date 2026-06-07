export function getEventTimestamp(date: string, time: string): number {
  return new Date(`${date}T${time}`).getTime();
}

export function isWithin24Hours(date: string, time: string): boolean {
  const eventTs = getEventTimestamp(date, time);
  const now = Date.now();
  const diff = eventTs - now;
  return diff > 0 && diff <= 24 * 60 * 60 * 1000;
}
