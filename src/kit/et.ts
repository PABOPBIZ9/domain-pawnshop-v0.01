/** Eastern Time display helpers. The UI shows ET labels only, never the viewer's own zone. */
const TZ = "America/New_York";

export function etDateTime(t: number): string {
  const s = new Date(t).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: TZ });
  return `${s} ET`;
}

export function etDate(t: number, style: "short" | "long" = "short"): string {
  return new Date(t).toLocaleDateString("en-US", style === "long" ? { dateStyle: "long", timeZone: TZ } : { month: "short", day: "numeric", timeZone: TZ });
}

export function etLong(t: number): string {
  return `${new Date(t).toLocaleString("en-US", { dateStyle: "long", timeStyle: "short", timeZone: TZ })} ET`;
}

export function left(ms: number): string {
  if (ms <= 0) return "0s";
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  const p = (n: number) => String(n).padStart(2, "0");
  return d > 0 ? `${d}d ${p(h)}:${p(m)}:${p(sec)}` : `${p(h)}:${p(m)}:${p(sec)}`;
}

export function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

export const usd = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 });
