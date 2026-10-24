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
