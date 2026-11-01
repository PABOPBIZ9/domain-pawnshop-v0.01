/**
 * ONE place for every paid tier. Live charges stay OFF unless NEXT_PUBLIC_PAYMENTS_ENABLED === "true".
 * Card: Whop checkout (plan IDs from env). Crypto: wallet transfer via Dynamic (needs a receiving address).
 */
export const PAYMENTS_ENABLED = process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === "true";
export const CRYPTO_RECEIVER_EVM = process.env.NEXT_PUBLIC_CRYPTO_RECEIVER_EVM ?? "";
export const CRYPTO_RECEIVER_SOL = process.env.NEXT_PUBLIC_CRYPTO_RECEIVER_SOL ?? "";

export type Tier = { id: string; name: string; priceUsd: number; interval: "month" | "once"; whopPlan: string; cryptoAmount: string; perks: string[] };

// NEXT_PUBLIC_* must be referenced literally so Next.js inlines them at build time.
export const TIERS: Tier[] = [
  { id: "platinum", name: "OG Platinum", priceUsd: 3.5, interval: "month", whopPlan: process.env.NEXT_PUBLIC_WHOP_PLAN_PLATINUM ?? "", cryptoAmount: process.env.NEXT_PUBLIC_CRYPTO_AMOUNT_PLATINUM ?? "", perks: ["OG Platinum badge", "Early access to drops", "Members-only quests"] },
  { id: "gold", name: "OG Gold", priceUsd: 9, interval: "month", whopPlan: process.env.NEXT_PUBLIC_WHOP_PLAN_GOLD ?? "", cryptoAmount: process.env.NEXT_PUBLIC_CRYPTO_AMOUNT_GOLD ?? "", perks: ["Everything in Platinum", "Priority listing slots", "Monthly bonus points"] },
  { id: "diamond", name: "OG Diamond", priceUsd: 25, interval: "month", whopPlan: process.env.NEXT_PUBLIC_WHOP_PLAN_DIAMOND ?? "", cryptoAmount: process.env.NEXT_PUBLIC_CRYPTO_AMOUNT_DIAMOND ?? "", perks: ["Everything in Gold", "Diamond badge + cosmetics", "Creator spotlight"] },
  { id: "ogpass", name: "OG Pass", priceUsd: 36, interval: "once", whopPlan: process.env.NEXT_PUBLIC_WHOP_PLAN_OG_PASS ?? "", cryptoAmount: process.env.NEXT_PUBLIC_CRYPTO_AMOUNT_OG_PASS ?? "", perks: ["OG Founder badge", "A year of priority listing slots", "First look at every drop"] },
];

/** Accepts a Whop plan ID (plan_xxx) or a full checkout URL. */
export const whopUrl = (plan: string) => (!plan ? "" : plan.startsWith("http") ? plan : `https://whop.com/checkout/${plan}`);
export const cardReady = (t: Tier) => PAYMENTS_ENABLED && !!t.whopPlan;
/** Crypto needs an explicit per-tier amount in the NATIVE token (e.g. "0.0011" ETH) — never derived from the USD price. */
export const cryptoReady = (t: Tier) => PAYMENTS_ENABLED && !!t.cryptoAmount && !!(CRYPTO_RECEIVER_EVM || CRYPTO_RECEIVER_SOL);
