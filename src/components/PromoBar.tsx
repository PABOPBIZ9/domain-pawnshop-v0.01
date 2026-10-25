"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { useTick } from "@/lib/now";
import { formatCountdown } from "@/lib/shotclock";

/** Promo bar: always points at the next REAL deadline on the board (no invented offers). */
export function PromoBar() {
  const { listings } = useStore();
  const now = useTick();
  if (!now) return null;
  const next = listings
    .filter((l) => l.status === "active" && l.endsAt && l.endsAt > now)
    .sort((a, b) => (a.endsAt ?? 0) - (b.endsAt ?? 0))[0];
  if (!next) return null;
  return (
    <div className="bg-acid text-black text-sm">
      <div className="max-w-7xl mx-auto px-4 py-1.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center">
        <span className="font-black">⏱ On the clock</span>
        <span className="font-mono font-bold">{next.title}</span>
        <span>{next.clockLabel ?? "ends in"}</span>
        <span className="font-mono font-bold tabular-nums bg-black/15 rounded px-2">{formatCountdown(next.endsAt! - now)}</span>
        <Link href="/shotclock" className="font-black underline underline-offset-2">Beat the clock →</Link>
      </div>
    </div>
  );
}
