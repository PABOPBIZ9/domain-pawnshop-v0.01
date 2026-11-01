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
import { useT } from "@/lib/i18n";

const STEPS = [["⏱", "s1t", "s1d"], ["🧮", "s2t", "s2d"], ["📦", "s3t", "s3d"], ["🔨", "s4t", "s4d"], ["💸", "s5t", "s5d"]] as const;

export function Home() {
  const s = useStore();
  const { t: tr } = useT();
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
          <div className="inline-flex items-center gap-2 text-xs font-mono px-2.5 py-1 rounded-full lx-ruby">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> {tr("live")}
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.02]">
            {tr("h1a")} <span className="text-acid">{tr("h1b")}</span>
          </h1>
          <p className="text-lg text-mute max-w-xl">
            {tr("sub")}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/shotclock" className="btn btn-acid text-base px-6 py-3">
              ⏱ {tr("beat")}
            </Link>
            <Link href="/market" className="btn btn-ghost text-base px-6 py-3">
              {tr("browse")}
            </Link>
            <Link href="/upload" className="btn btn-ghost text-base px-6 py-3">
              {tr("value")}
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Stat label={tr("st_live")} value={s.hydrated ? active.length : "—"} />
          <Stat label={tr("st_floor")} value={s.hydrated ? usd(floor) : "—"} />
          <Stat label={tr("st_expired")} value={s.hydrated ? expired : "—"} sub={tr("st_expired_sub")} />
          <Stat label={tr("st_lots")} value={s.hydrated ? active.filter((l) => l.kind === "bundle").length : "—"} sub={tr("st_lots_sub")} />
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-black">{tr("run_t")}</h2>
            <p className="text-sm text-mute">{tr("run_s")}</p>
          </div>
          <Link href="/shotclock" className="text-sm text-acid">
            {tr("full")}
          </Link>
        </div>
        <ShotClockBoard limit={8} compact />
      </section>

      <section className="grid sm:grid-cols-5 gap-3">
        {STEPS.map(([icon, tk, dk], i) => (
          (() => { const t = tr(tk), d = tr(dk); return (
          <div key={t} className="card p-4">
            <div className="text-2xl">{icon}</div>
            <div className="font-bold mt-2">
              <span className="text-mute font-mono text-xs mr-1">0{i + 1}</span>
              {t}
            </div>
            <p className="text-xs text-mute mt-1">{d}</p>
          </div>
          ); })()
        ))}
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-black">{tr("top_t")}</h2>
            <p className="text-sm text-mute">{tr("top_s")}</p>
          </div>
          <Link href="/market" className="text-sm text-acid">
            {tr("viewall")}
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
          <h3 className="font-bold text-base">{tr("ib_t")}</h3>
          <p className="text-mute mt-1">{tr("ib_d")}</p>
        </div>
        <div>
          <h3 className="font-bold text-base">{tr("ip_t")}</h3>
          <p className="text-mute mt-1">{tr("ip_d")}</p>
        </div>
        <div>
          <h3 className="font-bold text-base">{tr("tl_t")}</h3>
          <p className="text-mute mt-1">{tr("tl_d")}</p>
        </div>
      </section>

      <OgOffer cfg={ogOffer} />

      <DouTeaser />

      <ListingModal l={s.listings.find((l) => l.id === openId) ?? null} offers={s.offers} now={now} onClose={() => setOpenId(null)} />
    </div>
  );
}
