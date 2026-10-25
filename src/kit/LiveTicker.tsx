"use client";

import Link from "next/link";
import { useTick } from "@/lib/now";
import { etDateTime, left } from "./et";
import type { TickerConfig } from "./types";

const TONE: Record<string, string> = { hot: "lx-ruby-text", gold: "lx-og-text", accent: "text-accent", primary: "text-primary" };

/** "PGB LIVE"-style marquee of upcoming deadlines. ET labels only. Pauses on hover; static with reduced motion. */
export default function LiveTicker({ cfg }: { cfg: TickerConfig }) {
  const now = useTick();
  if (!cfg.enabled || !now) return <div className="kit-ticker h-8" aria-hidden />;
  const items = cfg.events
    .map((e) => ({ ...e, t: Date.parse(e.at) }))
    .filter((e) => Number.isFinite(e.t) && e.t > now)
    .sort((a, b) => a.t - b.t);
  if (!items.length) return null;
  const row = (k: string) => (
    <div key={k} className="flex shrink-0 items-center" aria-hidden={k === "b" ? true : undefined}>
      {items.map((e, i) => {
        const body = (
          <span className="flex items-center gap-2 whitespace-nowrap px-4 text-xs">
            <b className={`font-black uppercase tracking-wider ${TONE[e.tone ?? "accent"]}`}>{e.label}</b>
            <span className="opacity-85">{e.text}</span>
            <span className="text-mute">{etDateTime(e.t)}</span>
            <span className="lx-chip rounded px-1.5 py-0.5 font-mono font-bold tabular-nums">{left(e.t - now)}</span>
          </span>
        );
        return (
          <span key={`${k}${i}`} className="flex items-center border-r border-line">
            {e.href ? <Link href={e.href} tabIndex={k === "b" ? -1 : undefined} className="hover:underline">{body}</Link> : body}
          </span>
        );
      })}
    </div>
  );
  return (
    <div className="kit-ticker flex h-8 items-center overflow-hidden" role="region" aria-label={`${cfg.label} ticker`}>
      <span className="lx-ruby z-10 flex h-full shrink-0 items-center gap-1.5 px-3 text-xs font-black uppercase tracking-widest">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />{cfg.label}
      </span>
      <div className="relative min-w-0 flex-1 overflow-hidden">
        <div className="kit-marquee flex w-max">{row("a")}{row("b")}</div>
      </div>
    </div>
  );
}
