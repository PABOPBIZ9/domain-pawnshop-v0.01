export function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Weighted pick using crypto RNG when available. */
export function weightedPick<T extends { weight: number }>(items: readonly T[]): T {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r: number;
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const b = new Uint32Array(1);
    crypto.getRandomValues(b);
    r = (b[0] / 4294967296) * total;
  } else r = Math.random() * total;
  for (const it of items) {
    if ((r -= it.weight) < 0) return it;
  }
  return items[items.length - 1];
}

export const fmt = (n: number) => n.toLocaleString("en-US");
