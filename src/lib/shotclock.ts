/**
 * SHOTCLOCK urgency model. Relative clocks only — no clock times or time zones are ever displayed.
 * Grace / redemption windows are typical-registrar ESTIMATES; always verify at the registrar.
 */
import { daysUntil } from "./valuation";

export const DAY_MS = 86_400_000;
export const GRACE_DAYS = 30;
export const REDEMPTION_DAYS = 60;

export type Tier = "REDEMPTION" | "GRACE" | "7D" | "30D" | "90D" | "LATER" | "UNKNOWN";

export const TIER_ORDER: Tier[] = ["REDEMPTION", "GRACE", "7D", "30D", "90D", "LATER", "UNKNOWN"];

export const TIER_META: Record<Tier, { label: string; short: string; tone: "hot" | "warn" | "acid" | "violet" | "default" }> = {
  REDEMPTION: { label: "Redemption (est.) — 31–60d past expiry", short: "REDEMPTION", tone: "hot" },
  GRACE: { label: "Grace (est.) — 1–30d past expiry", short: "GRACE", tone: "hot" },
  "7D": { label: "Expires within 7 days", short: "≤7 DAYS", tone: "hot" },
  "30D": { label: "Expires within 30 days", short: "≤30 DAYS", tone: "warn" },
  "90D": { label: "Expires within 90 days", short: "≤90 DAYS", tone: "violet" },
  LATER: { label: "90+ days left", short: "90+ DAYS", tone: "default" },
  UNKNOWN: { label: "No expiry date", short: "NO DATE", tone: "default" },
};

export function tierForDays(days: number | null): Tier {
  if (days === null) return "UNKNOWN";
  if (days < -GRACE_DAYS) return "REDEMPTION";
  if (days < 0) return "GRACE";
  if (days <= 7) return "7D";
  if (days <= 30) return "30D";
  if (days <= 90) return "90D";
  return "LATER";
}

export function tierOf(expiry: string | undefined, now: number): Tier {
  return tierForDays(daysUntil(expiry, now));
}

/** The moment the shot clock runs out, plus a human label for what happens then. */
export function clockFor(expiry: string | undefined): { target: number; label: string } | null {
  if (!expiry) return null;
  const t = Date.parse(expiry.length === 10 ? expiry + "T00:00:00Z" : expiry);
  if (Number.isNaN(t)) return null;
  return { target: t, label: "expires" };
}

/** Next deadline relative to now: expiry, then estimated end of grace, then estimated end of redemption. */
export function nextDeadline(expiry: string | undefined, now: number): { target: number; label: string } | null {
  const c = clockFor(expiry);
  if (!c) return null;
  if (now < c.target) return { target: c.target, label: "expires in" };
  const grace = c.target + GRACE_DAYS * DAY_MS;
  if (now < grace) return { target: grace, label: "grace ends in (est.)" };
  const red = c.target + REDEMPTION_DAYS * DAY_MS;
  if (now < red) return { target: red, label: "drops in (est.)" };
  return { target: red, label: "past redemption (est.)" };
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const hms = [h, m, sec].map((n) => String(n).padStart(2, "0")).join(":");
  return d > 0 ? `${d}d ${hms}` : hms;
}
