/**
 * SHOTCLOCK site config: domains, footer, live ticker, early-bird and OG offer.
 * Times are ISO with an explicit ET offset; the UI shows ET labels only.
 */
import type { FooterConfig, OgOfferConfig, TickerConfig } from "@/kit/types";
import { points, social } from "./social";
import { giveaway } from "./giveaway";

/**
 * Canonical origin used for metadataBase, canonical links, sitemap and robots.
 * ONE value: switch to "https://shotclock.store" once Namecheap DNS points at Vercel (or set NEXT_PUBLIC_SITE_URL).
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://domain-pawnshop-v0-01.vercel.app").replace(/\/$/, "");

/** Brand colors for icons, manifest and theme-color (no pure black). */
export const BRAND_COLORS = { signature: "#c6ff3d", base: "#0b1038", sapphire: "#10225e" };

export const site = {
  name: "SHOTCLOCK",
  tagline: "Domains on the clock. Real names, expiring fast, priced to move.",
  domains: {
    /** Domain in use today. */
    current: "shotclock.store",
    /**
     * Planned primary vanity domain. NOT canonical yet: availability/registration is being checked.
     * TODO: once registered, set metadataBase + canonical in app/layout.tsx and redirect shotclock.store → here.
     */
    plannedPrimary: "", // shotclock.buzz is registered by someone else (Dynadot, exp. Jul 2027); shotclock.zone was unregistered as of Oct 24, 2026
    plannedTagline: "Find out what all the buzz is about.",
  },
};

/** Early-bird: free OG badge + bonus CLOCK POINTS for anyone who joins before the cutoff. */
export const earlyBird = {
  enabled: true,
  // 11:59 PM ET on Sun Nov 1, 2026. DST ends at 2:00 AM that day, so ET is EST (UTC-5) by then.
  endsAt: "2026-11-01T23:59:00-05:00",
  badge: "OG Early-Bird",
  bonusPoints: 250,
  chip: "🐣 Early-bird",
  hook: "Join free before the cutoff for the OG Early-Bird badge and bonus CLOCK POINTS.",
};

export const footer: FooterConfig = {
  brand: "SHOTCLOCK",
  brandShort: social.brandShort,
  tagline: site.tagline,
  handle: social.handle,
  handleConfirmed: social.handleConfirmed,
  overrides: social.overrides,
  buildingInPublic: social.buildingInPublic,
  newsletter: {
    title: "Get weekend drops and results",
    placeholder: "you@email.com",
    cta: "Subscribe",
    consent: "Yes, email me new drops and clock results. Unsubscribe anytime.",
    storageKey: "shotclock:newsletter",
  },
  columns: [
    { title: "Play", links: [{ label: "⏱ Shot Clock", href: "/shotclock" }, { label: "Marketplace", href: "/market" }, { label: "Bundles", href: "/bundles" }] },
    { title: "Fans", links: [{ label: "Launch Giveaway", href: "/giveaway" }, { label: "Dashboard", href: "/dashboard" }] },
    { title: "Explore", links: [{ label: "How it works", href: "/" }, { label: "Upload & Value", href: "/upload" }, { label: "DOU DIGITAL", href: "/dou" }] },
    { title: "Business", links: [{ label: "List your domains", href: "/upload" }, { label: "Partners · DOU DIGITAL", href: "/dou" }] },
  ],
  legal: [{ label: "Privacy", href: "/privacy" }, { label: "Terms", href: "/terms" }, { label: "Giveaway rules", href: "/giveaway#gw-rules" }],
  copyright: "© 2026 SHOTCLOCK · a DOU DIGITAL project. All rights reserved.",
  disclaimers: [
    "SHOTCLOCK v0.01 prototype. Prices are indicative heuristics, not appraisals. Offers and bids are simulated; no real payments, escrow or transfers happen here. Anything marked DEMO DATA is simulated.",
    points.disclaimer,
    "Giveaways: NO PURCHASE NECESSARY. 18+. Void where prohibited. Not affiliated with any registrar or platform named.",
  ],
};

/** Static ticker events. Board clocks (next expiries / sale ends) are added live in components/Ticker.tsx. */
export const ticker: TickerConfig = {
  enabled: true,
  label: "SHOTCLOCK LIVE",
  events: [
    { label: "Early-bird", text: "OG Early-Bird badge ends", at: earlyBird.endsAt, href: "/#early-bird", tone: "gold" },
    { label: "Giveaway", text: "Launch giveaway entries close", at: giveaway.endsAt, href: "/giveaway", tone: "hot" },
    // TODO: add real drops / auction closes / vote windows here (ISO with ET offset).
  ],
};

export const ogOffer: OgOfferConfig = {
  enabled: true,
  kicker: "Limited time · founding offer",
  title: "$36 SHOTCLOCK OG Offer", // TODO: confirm price + contents before selling
  body: "OG Founder badge, a year of priority listing slots and first look at every drop. Founding offer ends with the early-bird clock.",
  endsAt: earlyBird.endsAt,
  cta: "OG Pass · $36",
  href: "/#early-bird",
  paymentsEnabled: false, // payments are hard-off in v0.01 (no checkout exists)
  draft: true,
  fine: "Draft offer: not on sale. Cosmetic and access perks only, no cash value, never adds giveaway entries.",
};
