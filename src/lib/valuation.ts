import { categorize, isPronounceable, priceTier, type PriceTier } from "./categories";
import { splitWords } from "./words";

/**
 * Domain Pawnshop v0.01 indicative valuation engine.
 * Deterministic, transparent heuristic. NOT an appraisal.
 * Same input (domain + expiry + reference date) always yields the same output.
 */

export const TLD_MULTIPLIER: Record<string, number> = {
  com: 1.0,
  ai: 0.8,
  io: 0.55,
  co: 0.45,
  net: 0.35,
  org: 0.35,
  app: 0.35,
  dev: 0.3,
  gg: 0.3,
  eth: 0.3,
  crypto: 0.25,
  me: 0.25,
  so: 0.22,
  xyz: 0.15,
  nft: 0.2,
  x: 0.2,
  wallet: 0.15,
  dao: 0.15,
  bitcoin: 0.12,
  blockchain: 0.12,
  club: 0.1,
  online: 0.08,
  site: 0.08,
};
export const DEFAULT_TLD_MULTIPLIER = 0.1;

export const TLD_TIER: Record<string, string> = {
  com: "Tier 1",
  ai: "Tier 1",
  io: "Tier 2",
  co: "Tier 2",
  net: "Tier 2",
  org: "Tier 2",
  app: "Tier 2",
  dev: "Tier 3",
  gg: "Tier 3",
  eth: "Web3",
  crypto: "Web3",
  nft: "Web3",
  x: "Web3",
  wallet: "Web3",
  dao: "Web3",
  bitcoin: "Web3",
  blockchain: "Web3",
};

const LENGTH_BASE: [maxLen: number, base: number][] = [
  [2, 25000],
  [3, 6000],
  [4, 1800],
  [5, 900],
  [6, 500],
  [7, 320],
  [8, 220],
  [10, 140],
  [14, 70],
  [Infinity, 25],
];

const HOT_KEYWORDS = ["ai", "crypto", "pay", "bank", "loan", "cash", "bot", "data", "health", "home", "nft", "token", "trade"];

export interface Factor {
  label: string;
  /** Multiplier applied, e.g. 1.8, or null for informational rows */
  multiplier: number | null;
  detail: string;
}

export interface Valuation {
  domain: string;
  label: string;
  tld: string;
  length: number;
  category: string;
  tier: PriceTier;
  low: number;
  high: number;
  mid: number;
  /** 0–100 */
  score: number;
  ltv: number;
  pawnOffer: number;
  buyout: number;
  daysToExpiry: number | null;
  urgency: "expired" | "critical" | "soon" | "ok" | "unknown";
  factors: Factor[];
}

export function normalizeDomain(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "")
    .replace(/[^a-z0-9.-]/g, "");
}

export function isValidDomain(d: string): boolean {
  return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9-]+)+$/.test(d) && d.length <= 253;
}

export function splitDomain(domain: string): { label: string; tld: string } {
  const d = normalizeDomain(domain);
  const i = d.indexOf(".");
  if (i === -1) return { label: d, tld: "" };
  return { label: d.slice(0, i), tld: d.slice(i + 1) };
}

export function daysUntil(expiry: string | undefined, now: number): number | null {
  if (!expiry) return null;
  const t = Date.parse(expiry + (expiry.length === 10 ? "T00:00:00Z" : ""));
  if (Number.isNaN(t)) return null;
  return Math.floor((t - now) / 86_400_000);
}

/** Round to a "marketplace-friendly" number. */
export function nice(n: number): number {
  if (n < 10) return Math.max(1, Math.round(n));
  if (n < 100) return Math.round(n / 5) * 5;
  if (n < 1000) return Math.round(n / 10) * 10;
  if (n < 10000) return Math.round(n / 50) * 50;
  return Math.round(n / 500) * 500;
}

export function valuate(domain: string, expiry?: string, now: number = Date.now()): Valuation {
  const d = normalizeDomain(domain);
  const { label, tld } = splitDomain(d);
  const factors: Factor[] = [];
  const len = label.length;

  // 1. Length base
  const base = LENGTH_BASE.find(([max]) => len <= max)![1];
  factors.push({ label: "Length", multiplier: null, detail: `${len} chars → base $${base.toLocaleString("en-US")}` });

  let value = base;

  // 2. TLD tier
  const tldMult = TLD_MULTIPLIER[tld] ?? DEFAULT_TLD_MULTIPLIER;
  value *= tldMult;
  factors.push({ label: "TLD", multiplier: tldMult, detail: `.${tld || "?"} (${TLD_TIER[tld] ?? "Long-tail"})` });

  // 3. Hyphens & digits
  const hyphens = (label.match(/-/g) || []).length;
  const digits = (label.match(/\d/g) || []).length;
  const allNumeric = /^\d+$/.test(label);
  if (hyphens > 0) {
    const m = hyphens === 1 ? 0.4 : 0.2;
    value *= m;
    factors.push({ label: "Hyphens", multiplier: m, detail: `${hyphens} hyphen${hyphens > 1 ? "s" : ""} reduce liquidity` });
  }
  if (allNumeric) {
    const m = len <= 4 ? 1.5 : 0.8;
    value *= m;
    factors.push({ label: "Numeric", multiplier: m, detail: len <= 4 ? "Short all-numeric premium" : "Long numeric string" });
  } else if (digits > 0) {
    value *= 0.5;
    factors.push({ label: "Digits", multiplier: 0.5, detail: `${digits} digit${digits > 1 ? "s" : ""} mixed with letters` });
  }

  // 4. Dictionary / brandability
  const clean = label.replace(/-/g, "");
  const words = allNumeric ? null : splitWords(clean);
  if (words && words.length === 1) {
    value *= 3;
    factors.push({ label: "Dictionary word", multiplier: 3, detail: `"${words[0]}" is a single dictionary word` });
  } else if (words && words.length === 2) {
    value *= 1.8;
    factors.push({ label: "Two-word combo", multiplier: 1.8, detail: words.join(" + ") });
  } else if (words && words.length === 3) {
    value *= 1.2;
    factors.push({ label: "Three-word phrase", multiplier: 1.2, detail: words.join(" + ") });
  } else if (!allNumeric && isPronounceable(clean)) {
    value *= 1.3;
    factors.push({ label: "Brandable", multiplier: 1.3, detail: "Pronounceable letter pattern" });
  } else if (!allNumeric && len > 4) {
    value *= 0.4;
    factors.push({ label: "Hard to say", multiplier: 0.4, detail: "No dictionary words, awkward pattern" });
  }

  // 5. Hot keyword
  const hot = HOT_KEYWORDS.find((k) => clean.includes(k));
  if (hot && !allNumeric) {
    value *= 1.25;
    factors.push({ label: "Hot keyword", multiplier: 1.25, detail: `Contains "${hot}"` });
  }

  const category = categorize(label, tld);
  factors.push({ label: "Category", multiplier: null, detail: category });

  const mid = Math.max(5, value);
  const low = nice(Math.max(5, mid * 0.6));
  const high = nice(Math.max(10, mid * 1.6));

  // 6. Expiry urgency → affects liquidity offers, not the value range
  const days = daysUntil(expiry, now);
  let urgency: Valuation["urgency"] = "unknown";
  let ltv = 0.3;
  let buyoutMult = 0.55;
  if (days !== null) {
    if (days < 0) {
      urgency = "expired";
      ltv = 0.1;
      buyoutMult = 0.3;
    } else if (days <= 14) {
      urgency = "critical";
      ltv = 0.15;
      buyoutMult = 0.4;
    } else if (days <= 60) {
      urgency = "soon";
      ltv = 0.22;
      buyoutMult = 0.48;
    } else {
      urgency = "ok";
    }
  }
  const score = Math.max(1, Math.min(100, Math.round((Math.log10(mid) / Math.log10(50000)) * 100)));
  if (score >= 70) ltv += 0.05;

  factors.push({
    label: "Expiry urgency",
    multiplier: null,
    detail:
      days === null
        ? "No expiry date provided"
        : days < 0
          ? `Expired ${-days}d ago (redemption risk) → LTV ${Math.round(ltv * 100)}%`
          : `${days}d to expiry → LTV ${Math.round(ltv * 100)}%`,
  });

  return {
    domain: d,
    label,
    tld,
    length: len,
    category,
    tier: priceTier(mid),
    low,
    high,
    mid: nice(mid),
    score,
    ltv,
    pawnOffer: nice(low * ltv),
    buyout: nice(low * buyoutMult),
    daysToExpiry: days,
    urgency,
    factors,
  };
}

export function usd(n: number): string {
  return "$" + Math.round(n).toLocaleString("en-US");
}
