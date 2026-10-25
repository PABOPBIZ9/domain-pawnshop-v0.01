"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { useNow } from "@/lib/now";
import { tierOf } from "@/lib/shotclock";
import { usd } from "@/lib/valuation";
import { ListingCard } from "./ListingCard";
import { ListingModal } from "./ListingModal";
import { ShotClockBoard } from "./ShotClock";
import { Stat } from "./ui";
import { DouTeaser } from "./DouTeaser";
import OgOffer from "@/kit/OgOffer";
import { ogOffer } from "@/config/site";

const STEPS = [
  ["⏱", "On the clock", "Every name carries a live countdown to its expiry, grace or redemption deadline."],
  ["🧮", "Priced to move", "A transparent heuristic sets a range, a buy-now price and an instant pawn quote."],
  ["📦", "Quick-sale lots", "Families of names get bundled into lots for bulk buyers and resellers."],
  ["🔨", "Bid fast", "Buy now, place a bid or make an offer before the clock runs out."],
  ["💸", "Close", "v0.01 simulates the deal. Escrow and payments are on the roadmap."],
];

export function Home() {
  const s = useStore();
  const now = useNow();
  const [openId, setOpenId] = useState<string | null>(null);
  const active = s.listings.filter((l) => l.status === "active");
  const expired = active.filter((l) => l.kind === "domain" && (tierOf(l.expiry, now) === "GRACE" || tierOf(l.expiry, now) === "REDEMPTION")).length;
  const steals = [...active].sort((a, b) => b.price - a.price).slice(0, 8);
  const floor = active.length ? Math.min(...active.map((l) => l.price)) : 0;

  return (
    <div className="space-y-12">
      <section className="pt-6 pb-2 grid lg:grid-cols-[1.2fr_1fr] gap-8 items-center">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 text-xs font-mono px-2.5 py-1 rounded-full border border-hot/40 bg-hot/10 text-hot">
            <span className="w-2 h-2 rounded-full bg-hot animate-pulse" /> LIVE · names are expiring right now
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.02]">
            Domains on the <span className="text-acid">shot clock.</span>
          </h1>
          <p className="text-lg text-mute max-w-xl">
            Real names. Real deadlines. Priced to move before they drop. SHOTCLOCK is the live, countdown-driven quick-sale floor for the domain
            trenches.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/shotclock" className="btn btn-acid text-base px-6 py-3">
              ⏱ Beat the clock
            </Link>
            <Link href="/market" className="btn btn-ghost text-base px-6 py-3">
              Browse the floor
            </Link>
            <Link href="/upload" className="btn btn-ghost text-base px-6 py-3">
              Value my names
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Live names & lots" value={s.hydrated ? active.length : "—"} />
          <Stat label="Floor" value={s.hydrated ? usd(floor) : "—"} />
          <Stat label="Already expired" value={s.hydrated ? expired : "—"} sub="in grace / redemption (est.)" />
          <Stat label="Lots" value={s.hydrated ? active.filter((l) => l.kind === "bundle").length : "—"} sub="quick-sale bundles" />
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-black">⏱ Running out first</h2>
            <p className="text-sm text-mute">The next names to hit zero. Relative countdowns, live.</p>
          </div>
          <Link href="/shotclock" className="text-sm text-acid">
            Full shot clock →
          </Link>
        </div>
        <ShotClockBoard limit={8} compact />
      </section>

      <section className="grid sm:grid-cols-5 gap-3">
        {STEPS.map(([icon, t, d], i) => (
          <div key={t} className="card p-4">
            <div className="text-2xl">{icon}</div>
            <div className="font-bold mt-2">
              <span className="text-mute font-mono text-xs mr-1">0{i + 1}</span>
              {t}
            </div>
            <p className="text-xs text-mute mt-1">{d}</p>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-black">Top of the board</h2>
            <p className="text-sm text-mute">Highest heuristic list prices on the floor right now.</p>
          </div>
          <Link href="/market" className="text-sm text-acid">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {steals.map((l) => (
            <ListingCard key={l.id} l={l} offers={s.offers} now={now} onOpen={() => setOpenId(l.id)} />
          ))}
        </div>
      </section>

      <section className="card p-6 grid md:grid-cols-3 gap-6 text-sm">
        <div>
          <h3 className="font-bold text-base">Instant buyout</h3>
          <p className="text-mute mt-1">A fast, discounted price for when the names need to go before renewal day.</p>
        </div>
        <div>
          <h3 className="font-bold text-base">Instant pawn</h3>
          <p className="text-mute mt-1">Borrow against a name at a loan-to-value set by quality and urgency. Quotes only in v0.01.</p>
        </div>
        <div>
          <h3 className="font-bold text-base">Trench lots</h3>
          <p className="text-mute mt-1">Bundles of the long tail for resellers who buy in bulk.</p>
        </div>
      </section>

      <OgOffer cfg={ogOffer} />

      <DouTeaser />

      <ListingModal l={s.listings.find((l) => l.id === openId) ?? null} offers={s.offers} now={now} onClose={() => setOpenId(null)} />
    </div>
  );
}
