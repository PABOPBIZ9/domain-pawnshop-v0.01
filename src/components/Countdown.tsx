"use client";

import { useTick } from "@/lib/now";
import { formatCountdown, TIER_META, type Tier } from "@/lib/shotclock";
import { Chip } from "./ui";

/** Relative countdown only — never renders a wall-clock time or time zone. */
export function Countdown({ endsAt, label, size = "sm" }: { endsAt?: number; label?: string; size?: "sm" | "lg" }) {
  const now = useTick();
  if (!endsAt) return null;
  const left = endsAt - now;
  const hot = left < 3 * 86_400_000;
  if (!now) return <span className="font-mono text-mute text-xs">⏱ --:--:--</span>;
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono ${size === "lg" ? "text-lg" : "text-[11px]"} ${left <= 0 ? "text-mute" : hot ? "text-hot" : "text-acid"}`}>
      <span className={left > 0 && hot ? "animate-pulse" : ""}>⏱</span>
      {label && <span className="text-mute font-sans">{left <= 0 ? "clock ran out" : label}</span>}
      {left > 0 && <span className="tabular-nums">{formatCountdown(left)}</span>}
    </span>
  );
}

export function TierChip({ tier }: { tier: Tier }) {
  return <Chip tone={TIER_META[tier].tone}>{TIER_META[tier].short}</Chip>;
}
