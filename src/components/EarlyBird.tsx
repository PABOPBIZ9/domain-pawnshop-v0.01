"use client";

import { earlyBird } from "@/config/site";
import { points } from "@/config/social";
import { requestJoin, usePlayer } from "@/lib/player";
import { useTick } from "@/lib/now";
import { formatCountdown } from "@/lib/shotclock";

/** Slim early-bird bar. Hidden once the cutoff passes (11:59 PM ET, Nov 1, 2026). */
export function EarlyBirdBar() {
  const now = useTick();
  const { player } = usePlayer();
  const end = Date.parse(earlyBird.endsAt);
  if (!earlyBird.enabled || !now || now > end) return null;
  const has = player?.badges?.includes(earlyBird.badge);
  return (
    <div id="early-bird" className="lx-champagne text-sm">
      <div className="max-w-7xl mx-auto px-4 py-1.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center">
        <span className="font-black">{earlyBird.chip}</span>
        <span>{has ? `You have the ${earlyBird.badge} badge.` : `Join free for the ${earlyBird.badge} badge + ${earlyBird.bonusPoints} bonus ${points.short}.`}</span>
        <span className="lx-chip font-mono font-bold tabular-nums rounded px-2">ends in {formatCountdown(end - now)}</span>
        {!player ? <button onClick={requestJoin} className="font-black underline underline-offset-2">Claim my spot →</button> : null}
      </div>
    </div>
  );
}
