"use client";

import LiveTicker from "@/kit/LiveTicker";
import type { TickerEvent } from "@/kit/types";
import { ticker } from "@/config/site";
import { useStore } from "@/lib/store";
import { useNow } from "@/lib/now";

/** SHOTCLOCK LIVE: config events + the next real clocks on the board. ET labels only. */
export function Ticker() {
  const { listings } = useStore();
  const now = useNow();
  const board: TickerEvent[] = listings
    .filter((l) => l.status === "active" && !l.demo && l.endsAt && l.endsAt > now)
    .sort((a, b) => (a.endsAt ?? 0) - (b.endsAt ?? 0))
    .slice(0, 4)
    .map((l) => ({ label: "On the clock", text: `${l.title} ${(l.clockLabel ?? "ends").replace(/\s+in\b/, "")}`, at: new Date(l.endsAt!).toISOString(), href: "/shotclock", tone: "accent" }));
  return <LiveTicker cfg={{ ...ticker, events: [...board, ...ticker.events] }} />;
}
