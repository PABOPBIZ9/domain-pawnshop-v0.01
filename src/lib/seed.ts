import type { Activity, AppState, Listing, Offer } from "./types";
import { nice, valuate } from "./valuation";
import { nextDeadline } from "./shotclock";
import { INVENTORY, INVENTORY_BUNDLES } from "@/data/inventory";

const DEMO_BUYERS = ["demo_bidbot", "demo_reseller", "demo_endUser", "demo_fundA", "demo_collector", "demo_trencher"];
export const HOUSE_SELLER = "SHOTCLOCK";

/** Simple deterministic hash (FNV-1a) for stable pseudo-random demo numbers. */
export function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Heuristic list price used for every real listing: max(mid, 2 × instant buyout). */
export function listPrice(domain: string, expiry: string, now: number): number {
  const v = valuate(domain, expiry, now);
  return nice(Math.max(v.mid, 2 * v.buyout));
}

export function bundlePrice(items: { domain: string; expiry: string }[], now: number): number {
  return nice(items.reduce((t, i) => t + valuate(i.domain, i.expiry, now).buyout, 0) * 1.2);
}

export function buildSeed(now: number): AppState {
  const listings: Listing[] = [];
  const offers: Offer[] = [];
  const activity: Activity[] = [];

  const pushDemoBid = (l: Listing, i: number) => {
    const h = hash(l.title);
    if (h % 4 !== 0) return;
    const amt = Math.max(1, nice(l.minBid * (1 + (h % 40) / 100)));
    const createdAt = l.createdAt + ((h % 50) + 5) * 60_000;
    offers.push({ id: `demo-o-${i}`, listingId: l.id, amount: amt, from: DEMO_BUYERS[h % DEMO_BUYERS.length], type: "bid", status: "pending", mine: false, demo: true, createdAt });
    activity.push({ id: `demo-a-b${i}`, type: "bid", text: `Bid on ${l.title}`, amount: amt, demo: true, createdAt });
  };

  INVENTORY.forEach((item, i) => {
    const price = listPrice(item.domain, item.expiry, now);
    const dl = nextDeadline(item.expiry, now);
    const createdAt = now - (i + 1) * 9 * 60_000;
    const l: Listing = {
      id: `sc-${item.domain}`,
      kind: "domain",
      title: item.domain,
      domains: [item.domain],
      price,
      minBid: Math.max(1, nice(price * 0.5)),
      seller: HOUSE_SELLER,
      mine: false,
      demo: false,
      status: "active",
      createdAt,
      expiry: item.expiry,
      registrar: item.registrar,
      endsAt: dl?.target,
      clockLabel: dl?.label,
    };
    listings.push(l);
    activity.push({ id: `sc-a-${i}`, type: "list", text: `${item.domain} hit the shot clock`, amount: price, demo: false, createdAt });
    pushDemoBid(l, i);
  });

  INVENTORY_BUNDLES.forEach((b, i) => {
    const price = bundlePrice(b.items, now);
    const deadlines = b.items.map((it) => nextDeadline(it.expiry, now)).filter((d): d is NonNullable<typeof d> => !!d);
    const first = deadlines.sort((a, c) => a.target - c.target)[0];
    const earliestExpiry = b.items.map((x) => x.expiry).filter(Boolean).sort()[0];
    const createdAt = now - (i + 1) * 23 * 60_000;
    const l: Listing = {
      id: `sc-b-${i}`,
      kind: "bundle",
      title: b.name,
      domains: b.items.map((x) => x.domain),
      price,
      minBid: Math.max(1, nice(price * 0.5)),
      seller: HOUSE_SELLER,
      mine: false,
      demo: false,
      status: "active",
      createdAt,
      expiry: earliestExpiry,
      endsAt: first?.target,
      clockLabel: first ? `first name ${first.label}` : undefined,
    };
    listings.push(l);
    activity.push({ id: `sc-ab-${i}`, type: "list", text: `Quick-sale lot "${b.name}" is live`, amount: price, demo: false, createdAt });
    pushDemoBid(l, 1000 + i);
  });

  activity.sort((a, b) => b.createdAt - a.createdAt);
  return { version: 1, seeded: true, portfolio: [], listings, bundles: [], offers, activity };
}

export function simulatedOffersFor(listing: Listing, now: number): Offer[] {
  const h = hash(listing.id + listing.title);
  const n = 1 + (h % 2);
  return Array.from({ length: n }, (_, k) => ({
    id: `sim-${listing.id}-${k}`,
    listingId: listing.id,
    amount: Math.max(1, nice(listing.price * (0.5 + ((h >> (k * 4)) % 40) / 100))),
    from: DEMO_BUYERS[(h + k) % DEMO_BUYERS.length],
    type: (k === 0 ? "offer" : "bid") as Offer["type"],
    status: "pending" as const,
    mine: false,
    demo: true,
    createdAt: now + (k + 1) * 1000,
  }));
}
