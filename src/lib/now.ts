"use client";

import { useSyncExternalStore } from "react";

const CLIENT_NOW = typeof window !== "undefined" ? Date.now() : 0;
const noop = () => () => {};

/** Stable "now" for the session (0 during server prerender). */
export function useNow(): number {
  return useSyncExternalStore(noop, () => CLIENT_NOW, () => 0);
}

export function ago(t: number, now: number): string {
  const s = Math.max(0, Math.round((now - t) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

/* ---------- 1s ticker for live countdowns ---------- */
let tick = 0;
const tickListeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function subscribeTick(l: () => void) {
  tickListeners.add(l);
  if (!timer) {
    tick = Date.now();
    timer = setInterval(() => {
      tick = Date.now();
      tickListeners.forEach((fn) => fn());
    }, 1000);
  }
  return () => {
    tickListeners.delete(l);
    if (!tickListeners.size && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

/** Live "now" that updates every second on the client (0 on the server). */
export function useTick(): number {
  return useSyncExternalStore(subscribeTick, () => tick || CLIENT_NOW, () => 0);
}
