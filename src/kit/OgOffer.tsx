"use client";

import Link from "next/link";
import { useTick } from "@/lib/now";
import { etDateTime, left } from "./et";
import type { OgOfferConfig } from "./types";

/** Limited-time OG offer card ("$36 PuckGold OG Offer" pattern). Payments stay off unless enabled. */
export default function OgOffer({ cfg }: { cfg: OgOfferConfig }) {
  const now = useTick();
  if (!cfg.enabled) return null;
  const end = Date.parse(cfg.endsAt);
  const over = !!now && now >= end;
  return (
    <section className="card relative overflow-hidden p-6" style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--color-gold) 18%, var(--color-panel)), var(--color-panel))" }}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-xl">
          <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-widest text-gold">
            {cfg.kicker}
            {cfg.draft ? <span className="pill bg-hot/20 text-hot">Preview · not on sale yet</span> : null}
          </div>
          <h2 className="mt-1 text-2xl font-black sm:text-3xl">{cfg.title}</h2>
          <p className="mt-2 opacity-85">{cfg.body}</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-mute">{over ? "Offer ended" : `Ends ${etDateTime(end)}`}</div>
          <div className="font-mono text-2xl font-black tabular-nums">{now ? left(end - now) : "…"}</div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {cfg.paymentsEnabled && !over ? (
          <Link href={cfg.href} className="btn btn-primary">{cfg.cta}</Link>
        ) : (
          <button className="btn btn-ghost" disabled title="Checkout is turned off in v0.01">{over ? "Ended" : `${cfg.cta} (checkout coming soon)`}</button>
        )}
        <p className="text-xs text-mute">{cfg.fine}</p>
      </div>
    </section>
  );
}
