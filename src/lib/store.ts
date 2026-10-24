"use client";

import { useSyncExternalStore } from "react";
import { buildSeed, simulatedOffersFor } from "./seed";
import { SAMPLE_CSV, parsePortfolio, type ParsedRow } from "./csv";
import type { Activity, AppState, Bundle, Listing, Offer, OfferType } from "./types";
import { nice, valuate } from "./valuation";

const KEY = "domain-pawnshop:v0.01";

const EMPTY: AppState = { version: 1, seeded: false, portfolio: [], listings: [], bundles: [], offers: [], activity: [] };

let state: AppState | null = null;
const listeners = new Set<() => void>();

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function load(): AppState {
  if (state) return state;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      if (parsed && parsed.version === 1) {
        state = parsed;
        return state;
      }
    }
  } catch {
    // ignore corrupt storage
  }
  state = buildSeed(Date.now());
  persist();
  return state;
}

function persist() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // storage full / disabled — keep in memory
  }
}

function set(updater: (s: AppState) => AppState) {
  state = updater(load());
  persist();
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      state = null;
      l();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}

export function useStore(): AppState & { hydrated: boolean } {
  const s = useSyncExternalStore(subscribe, load, () => EMPTY);
  return { ...s, hydrated: s !== EMPTY };
}

function act(type: Activity["type"], text: string, amount?: number, demo = false): Activity {
  return { id: uid("a"), type, text, amount, demo, createdAt: Date.now() };
}

/* ---------- Actions ---------- */

export function addToPortfolio(rows: ParsedRow[]): number {
  let added = 0;
  set((s) => {
    const existing = new Set(s.portfolio.map((p) => p.domain));
    const fresh = rows
      .filter((r) => !r.error && !existing.has(r.domain))
      .map((r) => ({ id: uid("p"), domain: r.domain, registrar: r.registrar, expiry: r.expiry, costBasis: r.costBasis, addedAt: Date.now() }));
    added = fresh.length;
    if (!fresh.length) return s;
    return { ...s, portfolio: [...fresh, ...s.portfolio], activity: [act("upload", `${fresh.length} domain${fresh.length > 1 ? "s" : ""} added to your portfolio`), ...s.activity] };
  });
  return added;
}

export function loadSamplePortfolio() {
  return addToPortfolio(parsePortfolio(SAMPLE_CSV));
}

export function removeFromPortfolio(ids: string[]) {
  set((s) => ({ ...s, portfolio: s.portfolio.filter((p) => !ids.includes(p.id)) }));
}

function listingWithSim(s: AppState, listing: Listing, label: string): AppState {
  const sims = simulatedOffersFor(listing, Date.now());
  return {
    ...s,
    listings: [listing, ...s.listings],
    offers: [...sims, ...s.offers],
    activity: [
      ...sims.map((o) => act(o.type, `Simulated ${o.type} on ${listing.title} from ${o.from}`, o.amount, true)),
      act("list", label, listing.price),
      ...s.activity,
    ],
  };
}

export function listDomain(domain: string, price: number, minBid: number) {
  set((s) => {
    if (s.listings.some((l) => l.mine && l.status === "active" && l.kind === "domain" && l.title === domain)) return s;
    const p = s.portfolio.find((x) => x.domain === domain);
    const listing: Listing = {
      id: uid("l"),
      kind: "domain",
      title: domain,
      domains: [domain],
      price: nice(price),
      minBid: nice(minBid),
      seller: "you",
      mine: true,
      demo: false,
      status: "active",
      createdAt: Date.now(),
      expiry: p?.expiry,
      registrar: p?.registrar,
    };
    return listingWithSim(s, listing, `You listed ${domain}`);
  });
}

export function createBundle(name: string, domains: string[]): string {
  const id = uid("b");
  set((s) => ({ ...s, bundles: [{ id, name, domains, createdAt: Date.now(), listed: false }, ...s.bundles] }));
  return id;
}

export function deleteBundle(id: string) {
  set((s) => ({ ...s, bundles: s.bundles.filter((b) => b.id !== id) }));
}

export function listBundle(bundle: Bundle, price: number, minBid: number) {
  set((s) => {
    const listing: Listing = {
      id: uid("l"),
      kind: "bundle",
      title: bundle.name,
      domains: bundle.domains,
      price: nice(price),
      minBid: nice(minBid),
      seller: "you",
      mine: true,
      demo: false,
      status: "active",
      createdAt: Date.now(),
      bundleId: bundle.id,
    };
    const next = listingWithSim(s, listing, `You listed bundle "${bundle.name}" (${bundle.domains.length} names)`);
    return { ...next, bundles: next.bundles.map((b) => (b.id === bundle.id ? { ...b, listed: true } : b)) };
  });
}

export function delist(listingId: string) {
  set((s) => {
    const l = s.listings.find((x) => x.id === listingId);
    if (!l) return s;
    return {
      ...s,
      listings: s.listings.map((x) => (x.id === listingId ? { ...x, status: "delisted" } : x)),
      bundles: s.bundles.map((b) => (b.id === l.bundleId ? { ...b, listed: false } : b)),
      offers: s.offers.map((o) => (o.listingId === listingId && o.status === "pending" ? { ...o, status: "declined" } : o)),
      activity: [act("delist", `${l.title} delisted`), ...s.activity],
    };
  });
}

export function placeOffer(listingId: string, amount: number, type: OfferType) {
  set((s) => {
    const l = s.listings.find((x) => x.id === listingId);
    if (!l) return s;
    const offer: Offer = { id: uid("o"), listingId, amount: Math.round(amount), from: "you", type, status: "pending", mine: true, demo: false, createdAt: Date.now() };
    return { ...s, offers: [offer, ...s.offers], activity: [act(type, `You placed a ${type} on ${l.title}`, offer.amount), ...s.activity] };
  });
}

export function buyNow(listingId: string) {
  set((s) => {
    const l = s.listings.find((x) => x.id === listingId);
    if (!l || l.status !== "active") return s;
    return {
      ...s,
      listings: s.listings.map((x) => (x.id === listingId ? { ...x, status: "sold" } : x)),
      offers: s.offers.map((o) => (o.listingId === listingId && o.status === "pending" ? { ...o, status: "declined" } : o)),
      activity: [act("sale", `You bought ${l.title} (simulated — no payment taken)`, l.price), ...s.activity],
    };
  });
}

export function respondOffer(offerId: string, accept: boolean) {
  set((s) => {
    const o = s.offers.find((x) => x.id === offerId);
    if (!o) return s;
    const l = s.listings.find((x) => x.id === o.listingId);
    let listings = s.listings;
    let offers = s.offers.map((x) => (x.id === offerId ? { ...x, status: accept ? ("accepted" as const) : ("declined" as const) } : x));
    let portfolio = s.portfolio;
    const acts: Activity[] = [];
    if (accept && l) {
      listings = listings.map((x) => (x.id === l.id ? { ...x, status: "sold", price: o.amount } : x));
      offers = offers.map((x) => (x.listingId === l.id && x.status === "pending" ? { ...x, status: "declined" } : x));
      portfolio = portfolio.filter((p) => !l.domains.includes(p.domain));
      acts.push(act("accept", `You accepted ${o.from}'s ${o.type} on ${l.title} (simulated sale)`, o.amount));
    } else if (l) {
      acts.push(act("decline", `You declined ${o.from}'s ${o.type} on ${l.title}`, o.amount));
    }
    return { ...s, listings, offers, portfolio, activity: [...acts, ...s.activity] };
  });
}

export function resetAll(reseed = true) {
  set(() => (reseed ? buildSeed(Date.now()) : { ...EMPTY, seeded: true }));
}

export function quickQuote(domain: string, expiry?: string) {
  return valuate(domain, expiry, Date.now());
}
