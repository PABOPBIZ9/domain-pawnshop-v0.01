/**
 * SHOTCLOCK social config. The handle lives in ONE value (HANDLE) and feeds all 18 footer links.
 * Confirmed by the owner: @shotclockfun (for now). Set an override to "" to hide a platform
 * whose account isn't live yet, or to a different handle if one platform differs.
 */
import type { Platform } from "@/lib/socials";
import { FOOTER_18 } from "@/kit/types";

export const HANDLE = "shotclockfun";

export const social = {
  brandShort: "SHOTCLOCK",
  handle: HANDLE,
  handleConfirmed: true,
  buildingInPublic: "Building in public. v0.01: real names on the clock, simulated money.",
  /** All 18 platforms in footer order, each built from HANDLE (WhatsApp = generic wa.me, no number). */
  socials: FOOTER_18.map((platform) => ({ platform, handle: HANDLE })) as { platform: Platform; handle: string }[],
  /** Per-platform exceptions, e.g. { kick: "" } to hide one. */
  overrides: {} as Partial<Record<Platform, string>>,
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
