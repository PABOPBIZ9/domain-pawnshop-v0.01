"use client";

import { useSyncExternalStore } from "react";
import { points } from "@/config/social";
import { earlyBird } from "@/config/site";
import { newSeed } from "./identity";

export type Player = {
  number: number;
  name: string;
  seed: number;
  balance: number;
  dayKey: string;
  offersToday: number;
  visitClaimed: boolean;
  /** Free badges, e.g. "OG Early-Bird", "SHOTCLOCK Launch '26". */
  badges?: string[];
};

type PS = { player: Player | null; lang: string };
const KEY = "shotclock:player";
const COUNTER = "shotclock:player-counter";
const EMPTY: PS = { player: null, lang: "en" };
let cache: PS | null = null;
const ls = new Set<() => void>();

function load(): PS {
  if (cache) return cache;
  if (typeof window === "undefined") return EMPTY;
  try {
    cache = { ...EMPTY, ...(JSON.parse(localStorage.getItem(KEY) || "null") ?? {}) };
  } catch {
    cache = EMPTY;
  }
  return cache!;
}
function save(fn: (s: PS) => PS) {
  cache = fn(load());
  try { localStorage.setItem(KEY, JSON.stringify(cache)); } catch {}
  ls.forEach((l) => l());
}
const sub = (l: () => void) => (ls.add(l), () => void ls.delete(l));
export const usePlayer = () => useSyncExternalStore(sub, load, () => EMPTY);

export const dayKeyOf = (t: number) => { const d = new Date(t); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
const dk = () => dayKeyOf(Date.now());
const roll = (p: Player): Player => (p.dayKey === dk() ? p : { ...p, dayKey: dk(), offersToday: 0, visitClaimed: false });

export function join(name: string, seed: number) {
  const n = Number(localStorage.getItem(COUNTER) || "0") + 1;
  localStorage.setItem(COUNTER, String(n));
  const og = earlyBird.enabled && Date.now() <= Date.parse(earlyBird.endsAt);
  save((s) => ({ ...s, player: {
    number: n, name, seed, balance: points.join + (og ? earlyBird.bonusPoints : 0), dayKey: dk(), offersToday: 0, visitClaimed: false,
    badges: og ? [earlyBird.badge] : [],
  } }));
}
export function shuffle() {
  save((s) => (s.player ? { ...s, player: { ...s.player, seed: newSeed() } } : s));
}
export function claimVisit() {
  save((s) => {
    if (!s.player) return s;
    const p = roll(s.player);
    if (p.visitClaimed) return { ...s, player: p };
    return { ...s, player: { ...p, visitClaimed: true, balance: p.balance + points.dailyVisit } };
  });
}
/** Call after a simulated offer / bid / buy. Capped per day. */
export function rewardOffer() {
  save((s) => {
    if (!s.player) return s;
    const p = roll(s.player);
    if (p.offersToday >= points.offerDailyCap) return { ...s, player: p };
    return { ...s, player: { ...p, offersToday: p.offersToday + 1, balance: p.balance + points.offer } };
  });
}
export function setLang(lang: string) {
  save((s) => ({ ...s, lang }));
}
/** Giveaway participant reward: badge + points, once per giveaway. */
export function giveawayEntered(id: string, badge: string, pts: number) {
  save((s) => {
    if (!s.player) return s;
    const b = s.player.badges ?? [];
    const key = `giveaway:${id}`;
    if (b.includes(key)) return s;
    return { ...s, player: { ...s.player, badges: [...b, key, badge], balance: s.player.balance + pts } };
  });
}

/* ---------- open the join panel from anywhere ---------- */
export const JOIN_EVENT = "shotclock:join";
export const requestJoin = () => window.dispatchEvent(new Event(JOIN_EVENT));
