/**
 * DOU STARTER KIT shared templates (footer, live ticker, giveaway, OG offer).
 * Everything in src/kit is config-driven and copied verbatim between projects.
 * Pass config in as props; never import a brand file from here.
 */
import type { Platform } from "@/lib/socials";

/** PuckGold footer order: all 18 follow chips. */
export const FOOTER_18: Platform[] = [
  "discord", "kick", "medium", "spotify", "rumble", "substack", "telegram", "whatsapp", "facebook",
  "instagram", "linkedin", "pinterest", "snapchat", "threads", "tiktok", "twitch", "youtube", "x",
];

export type LinkItem = { label: string; href: string };

export type FooterConfig = {
  brand: string;
  brandShort: string; // used in "Follow SHORT · @handle"
  tagline: string;
  /** ONE handle for every platform (without @). */
  handle: string;
  /** Until true, chips render as "coming soon" (no outbound links). */
  handleConfirmed: boolean;
  /** Optional per-platform override: a different handle or a full URL. "" hides that chip. */
  overrides?: Partial<Record<Platform, string>>;
  platforms?: Platform[]; // defaults to FOOTER_18
  newsletter?: { title: string; placeholder: string; cta: string; consent: string; storageKey: string };
  columns: { title: string; links: LinkItem[] }[];
  legal: LinkItem[];
  copyright: string;
  disclaimers?: string[];
  buildingInPublic?: string;
};

export type TickerEvent = {
  label: string; // e.g. "GIVEAWAY"
  text: string; // e.g. "Entries close"
  at: string; // ISO with offset
  href?: string;
  tone?: "hot" | "gold" | "accent" | "primary";
};

export type TickerConfig = { enabled: boolean; label: string; events: TickerEvent[]; sampleNote?: string };

export type EntryWay = {
  id: string;
  title: string;
  value: string; // "+2", "+1/day", "+5 each"
  detail: string;
  verification: "verified" | "self-reported" | "auto";
  /** Entries this way adds when claimed (self-reported) or per verified unit. */
  points: number;
  perDay?: boolean;
  /** Verified/auto ways read their count from the app (props.verified[id]); self-reported ways are tap-through. */
  href?: string;
  external?: boolean;
};

export type Prize = {
  place: string;
  title: string;
  detail: string;
  arv: number;
  qty: number;
  tier: "grand" | "mid" | "bonus";
  art?: string; // emoji or short text tile, must match the prize
  placeholder?: boolean; // TODO prize, not committed
};

export type GiveawayConfig = {
  id: string;
  name: string;
  sponsor: string;
  sponsorEmail: string;
  siteName: string; // "SHOTCLOCK account"
  startsAt: string; // ISO with offset
  endsAt: string;
  drawWithinDays: number;
  claimDays: number;
  /** Set true ONLY after legal review. Until then a red DEMO/placeholder warning shows. */
  rulesReviewed: boolean;
  placeholderNotice?: string;
  eligibility: {
    minAge: number;
    worldwide: boolean;
    excludedCountries: Record<string, string>;
    excludedRegions: Record<string, string>;
    otherExcluded: string;
    skillQuestionCountries: string[];
    /** Countries where the entrant must also pick a province/region. */
    regionRequired: Record<string, Record<string, string>>;
  };
  ways: EntryWay[];
  referralCap: number;
  questDailyCap: number;
  participant: { badge: string; emoji: string; points: number; currency: string };
  prizes: Prize[];
  creatorPrize?: { title: string; detail: string; prize: string; arv: number; qty: number; href: string; judging: string };
  notAffiliated: string[];
  faq: { q: string; a: string }[];
  giftCardNote?: string;
};

export type OgOfferConfig = {
  enabled: boolean;
  kicker: string; // "Limited time · while supplies last"
  title: string; // "$36 PuckGold OG Offer"
  body: string;
  endsAt: string;
  cta: string;
  href: string;
  /** When payments are off the CTA becomes a waitlist / coming-soon state. */
  paymentsEnabled: boolean;
  draft?: boolean; // "Preview: not on sale yet"
  fine: string;
};
