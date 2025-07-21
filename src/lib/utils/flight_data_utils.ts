export function formatFlightDuration(durationMinutes: number): string {
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  return `${hours}h ${minutes}m`;
}

export function formatTimeToGo(timeMinutes: number): string {
  if (timeMinutes <= 0) return "Arrived";
  const hours = Math.floor(timeMinutes / 60);
  const minutes = timeMinutes % 60;
  return `${hours}h ${minutes}m`;
}
