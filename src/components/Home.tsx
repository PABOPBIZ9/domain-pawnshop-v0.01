"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { useNow } from "@/lib/now";
import { usd } from "@/lib/valuation";
import { ListingCard } from "./ListingCard";
import { ListingModal } from "./ListingModal";
import { DemoBadge, Stat } from "./ui";

const STEPS = [
  ["📥", "Upload", "Paste a list or CSV from GoDaddy, Namecheap, Dynadot, Unstoppable & more."],
  ["🧮", "Value", "Transparent heuristic gives a range, an instant pawn quote and a buyout price."],
  ["📦", "Bundle", "Auto-group the long tail by category, TLD, length or price tier."],
  ["🏷️", "List", "Drop names or lots on an OpenSea-style marketplace with buy-now + min bid."],
  ["⚡", "Get bids", "Collect offers fast, accept or decline, and turn inventory into liquidity."],
];

export function Home() {
  const s = useStore();
  const now = useNow();
  const [openId, setOpenId] = useState<string | null>(null);
  const active = s.listings.filter((l) => l.status === "active");
  const trending = [...active]
    .sort((a, b) => s.offers.filter((o) => o.listingId === b.id).length - s.offers.filter((o) => o.listingId === a.id).length || b.price - a.price)
    .slice(0, 8);
  const floor = active.length ? Math.min(...active.map((l) => l.price)) : 0;
  const volume = s.listings.filter((l) => l.status === "sold").reduce((t, l) => t + l.price, 0);

  return (
    <div className="space-y-12">
      <section className="pt-6 pb-2 grid lg:grid-cols-[1.2fr_1fr] gap-8 items-center">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 text-xs font-mono px-2.5 py-1 rounded-full border border-acid/30 bg-acid/10 text-acid">
            ⚡ v0.01 · instant liquidity for domain bags
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.02]">
            The digital <span className="text-acid">pawnshop</span> for domain names.
          </h1>
          <p className="text-lg text-mute max-w-xl">
            Upload your portfolio, get indicative valuations in seconds, bundle the long tail, and sell to investors, resellers and end users — before
            renewals eat you alive.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/upload" className="btn btn-acid text-base px-6 py-3">
              Get an instant offer
            </Link>
            <Link href="/market" className="btn btn-ghost text-base px-6 py-3">
              Browse marketplace
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Floor" value={s.hydrated ? usd(floor) : "—"} />
          <Stat label="Listed" value={s.hydrated ? active.length : "—"} />
          <Stat label="Volume" value={s.hydrated ? usd(volume) : "—"} sub="incl. demo sales" />
          <Stat label="Registrars" value="5" sub="GoDaddy · Namecheap · Dynadot · UD · Other" />
        </div>
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
            <h2 className="text-2xl font-black">Trending listings</h2>
            <p className="text-sm text-mute">
              Seeded with <DemoBadge /> so you can try bidding and buying.
            </p>
          </div>
          <Link href="/market" className="text-sm text-acid">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {trending.map((l) => (
            <ListingCard key={l.id} l={l} offers={s.offers} now={now} onOpen={() => setOpenId(l.id)} />
          ))}
        </div>
      </section>

      <section className="card p-6 grid md:grid-cols-3 gap-6 text-sm">
        <div>
          <h3 className="font-bold text-base">Instant pawn</h3>
          <p className="text-mute mt-1">Borrow against a name at a loan-to-value set by quality and expiry urgency. (Quotes only in v0.01.)</p>
        </div>
        <div>
          <h3 className="font-bold text-base">Instant buyout</h3>
          <p className="text-mute mt-1">A fast, discounted sale price for when you just need the names gone before renewal day.</p>
        </div>
        <div>
          <h3 className="font-bold text-base">Bulk liquidation</h3>
          <p className="text-mute mt-1">Lots and bundles for the hundreds of names that never justify a broker.</p>
        </div>
      </section>

      <ListingModal l={s.listings.find((l) => l.id === openId) ?? null} offers={s.offers} now={now} onClose={() => setOpenId(null)} />
    </div>
  );
}
