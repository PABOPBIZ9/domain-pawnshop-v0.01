/**
 * SHOTCLOCK social + promo config (ported from DOU STARTER KIT).
 *
 * TODO(handles): the placeholder handle is "@shotclock", but NO account has been confirmed.
 * Nothing is linked until you set `handleConfirmed: true` and/or fill a platform handle below.
 * Never add a handle for an account that doesn't exist.
 */
import type { Platform } from "@/lib/socials";

export const social = {
  brandShort: "SHOTCLOCK",
  handle: "shotclock", // TODO: placeholder only
  handleConfirmed: false, // TODO: flip to true once @shotclock (or your real handle) is claimed
  buildingInPublic: "Building in public. v0.01: real names on the clock, simulated money.",
  // TODO: fill in real handles as accounts are claimed. Empty = not rendered.
  socials: [
    { platform: "x", handle: "" },
    { platform: "tiktok", handle: "" },
    { platform: "instagram", handle: "" },
    { platform: "youtube", handle: "" },
    { platform: "discord", handle: "" },
    { platform: "kick", handle: "" },
    { platform: "twitch", handle: "" },
    { platform: "telegram", handle: "" },
    { platform: "threads", handle: "" },
    { platform: "linkedin", handle: "" },
    { platform: "reddit", handle: "" },
    { platform: "substack", handle: "" },
  ] as { platform: Platform; handle: string }[],
  legal: [
    { label: "How it works", href: "/" },
    { label: "Shot Clock", href: "/shotclock" },
    { label: "DOU DIGITAL", href: "/dou" },
  ],
};

/** Clock Points: free, no cash value. Daily caps keep it sane. */
export const points = {
  name: "CLOCK POINTS",
  short: "CP",
  disclaimer: "CLOCK POINTS are free, just for fun and have no cash value. They can't be bought, redeemed, transferred or exchanged for money, domains or discounts.",
  join: 100,
  dailyVisit: 10,
  offer: 10, // per simulated offer/bid/buy
  offerDailyCap: 10, // actions per day that earn points
};
