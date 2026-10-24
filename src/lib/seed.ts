import type { Activity, AppState, Listing, Offer, Registrar } from "./types";
import { nice, valuate } from "./valuation";

const DAY = 86_400_000;

const DEMO_SELLERS = ["demo_whale", "demo_flipper", "demo_namepunk", "demo_tldmaxi", "demo_dropcatcher", "demo_ape"];
const DEMO_BUYERS = ["demo_bidbot", "demo_reseller", "demo_endUser", "demo_fundA", "demo_collector"];

const DEMO_DOMAINS: [string, Registrar, number | null][] = [
  ["swapgarden.com", "GoDaddy", 220],
  ["zentro.io", "Namecheap", 40],
  ["kush.ai", "Dynadot", 300],
  ["loanpilot.com", "GoDaddy", 9],
  ["moonbag.crypto", "Unstoppable", null],
  ["pixelhive.co", "Namecheap", 120],
  ["fitwolf.app", "Dynadot", 25],
  ["cashroot.net", "GoDaddy", 500],
  ["gg.xyz", "Namecheap", 80],
  ["datadojo.ai", "Dynadot", -3],
  ["nftmint.x", "Unstoppable", null],
  ["homeflip.org", "GoDaddy", 12],
  ["brivo.com", "Namecheap", 600],
  ["chefbot.io", "Dynadot", 55],
  ["tokenranch.com", "GoDaddy", 33],
  ["best-cheap-pizza-deals.net", "Namecheap", 7],
  ["8421.com", "Dynadot", 410],
  ["solsurf.wallet", "Unstoppable", null],
  ["tripforge.co", "GoDaddy", 190],
  ["yogaloop.com", "Namecheap", 70],
  ["gamevault.gg", "Dynadot", 240],
  ["qrtzl.com", "GoDaddy", 18],
];

function iso(t: number) {
  return new Date(t).toISOString().slice(0, 10);
}

/** Simple deterministic hash for stable pseudo-random demo numbers. */
export function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function buildSeed(now: number): AppState {
  const listings: Listing[] = [];
  const offers: Offer[] = [];
  const activity: Activity[] = [];

  DEMO_DOMAINS.forEach(([domain, registrar, days], i) => {
    const expiry = days === null ? "" : iso(now + days * DAY);
    const v = valuate(domain, expiry, now);
    const h = hash(domain);
    const price = nice(v.low + ((v.high - v.low) * (h % 100)) / 160);
    const createdAt = now - (i + 1) * 47 * 60_000;
    const id = `demo-l-${i}`;
    listings.push({
      id,
      kind: "domain",
      title: domain,
      domains: [domain],
      price,
      minBid: nice(price * 0.5),
      seller: DEMO_SELLERS[h % DEMO_SELLERS.length],
      mine: false,
      demo: true,
      status: "active",
      createdAt,
      expiry,
      registrar,
    });
    activity.push({ id: `demo-a-l${i}`, type: "list", text: `${domain} listed`, amount: price, demo: true, createdAt });
    if (h % 3 === 0) {
      const amt = nice(price * (0.55 + (h % 30) / 100));
      offers.push({
        id: `demo-o-${i}`,
        listingId: id,
        amount: amt,
        from: DEMO_BUYERS[h % DEMO_BUYERS.length],
        type: "bid",
        status: "pending",
        mine: false,
        demo: true,
        createdAt: createdAt + 20 * 60_000,
      });
      activity.push({ id: `demo-a-b${i}`, type: "bid", text: `Bid on ${domain}`, amount: amt, demo: true, createdAt: createdAt + 20 * 60_000 });
    }
  });

  const bundles: [string, string[]][] = [
    ["Crypto Starter Pack", ["degenloot.xyz", "chainpup.io", "mintbro.com", "hodlhut.net"]],
    ["AI Long-Tail Lot (10)", ["promptdock.ai", "agentcart.io", "botbazaar.net", "llmlabs.xyz", "neuralnest.co", "aidojo.app", "gptshop.org", "modelmart.io", "vectorvan.com", "tokenizer.dev"]],
    ["Cannabis Brand Bundle", ["dankdesk.com", "budbox.co", "kushkart.net"]],
  ];
  bundles.forEach(([name, domains], i) => {
    const sum = domains.reduce((s, d) => s + valuate(d, "", now).buyout, 0);
    const price = nice(sum * 1.1);
    const createdAt = now - (i + 2) * 3 * 3_600_000;
    listings.push({
      id: `demo-b-${i}`,
      kind: "bundle",
      title: name,
      domains,
      price,
      minBid: nice(price * 0.5),
      seller: DEMO_SELLERS[i + 1],
      mine: false,
      demo: true,
      status: "active",
      createdAt,
    });
    activity.push({ id: `demo-a-bl${i}`, type: "list", text: `Bundle "${name}" listed (${domains.length} names)`, amount: price, demo: true, createdAt });
  });

  // a few historical demo sales for volume stats
  [["vaultly.com", 1450], ["ape.gg", 900], ["roofbot.io", 120], ["leafhub.net", 65]].forEach(([d, amt], i) => {
    const createdAt = now - (i + 1) * 5 * 3_600_000;
    listings.push({
      id: `demo-s-${i}`,
      kind: "domain",
      title: d as string,
      domains: [d as string],
      price: amt as number,
      minBid: 0,
      seller: DEMO_SELLERS[i],
      mine: false,
      demo: true,
      status: "sold",
      createdAt,
    });
    activity.push({ id: `demo-a-s${i}`, type: "sale", text: `${d} sold`, amount: amt as number, demo: true, createdAt });
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
    amount: nice(listing.price * (0.5 + ((h >> (k * 4)) % 40) / 100)),
    from: DEMO_BUYERS[(h + k) % DEMO_BUYERS.length],
    type: (k === 0 ? "offer" : "bid") as Offer["type"],
    status: "pending" as const,
    mine: false,
    demo: true,
    createdAt: now + (k + 1) * 1000,
  }));
}
