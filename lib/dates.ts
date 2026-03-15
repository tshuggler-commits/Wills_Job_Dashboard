export function daysUntil(d: string | null): number | null {
  if (!d) return null;
  const target = new Date(d + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / 86400000);
}

export function daysSince(d: string | null): number | null {
  if (!d) return null;
  const target = new Date(d + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.floor((now.getTime() - target.getTime()) / 86400000);
}

export function fmtDate(d: string | null): string {
  if (!d) return "";
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function isMonday(): boolean {
  return new Date().getDay() === 1;
}

export function todayFormatted(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
