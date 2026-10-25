"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { PlayerChip } from "./Player";
import { Ticker } from "./Ticker";
import { EarlyBirdBar } from "./EarlyBird";

const LINKS = [
  { href: "/shotclock", label: "⏱ Shot Clock" },
  { href: "/market", label: "Marketplace" },
  { href: "/upload", label: "Upload & Value" },
  { href: "/bundles", label: "Bundles" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/giveaway", label: "🎁 Giveaway" },
  { href: "/dou", label: "DOU DIGITAL" },
];

export function Nav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <>
    <Ticker />
    <EarlyBirdBar />
    <header className="sticky top-0 z-30 border-b border-line bg-ink/80 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3 lg:gap-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-black tracking-tight text-lg">
          <span className="grid place-items-center w-8 h-8 rounded-lg lx-sig text-base">⏱</span>
          <span>
            SHOT<span className="text-acid">CLOCK</span>
          </span>
          <span className="hidden sm:inline text-[10px] font-mono px-1.5 py-0.5 rounded bg-panel2 border border-line text-mute">v0.01</span>
        </Link>
        <nav aria-label="Main" className="hidden lg:flex gap-1 text-sm">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${path.startsWith(l.href) ? "bg-panel2 text-white" : "text-mute hover:text-white"}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <PlayerChip />
          <button
            type="button"
            className="lg:hidden grid place-items-center w-10 h-10 rounded-lg border border-line bg-panel2 text-white"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? <path d="M5 5l10 10M15 5L5 15" /> : <path d="M3 5h14M3 10h14M3 15h14" />}
            </svg>
          </button>
          <Link href="/shotclock" className="btn btn-acid text-sm hidden xl:inline-block whitespace-nowrap">
            Beat the clock
          </Link>
        </div>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Main" className="lg:hidden border-t border-line bg-ink/95 backdrop-blur">
          <ul className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-2 gap-2 text-sm">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`block px-3 py-2.5 rounded-lg border border-line ${path.startsWith(l.href) ? "bg-panel2 text-white" : "text-white/85 hover:text-white"}`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <div className="border-t border-line bg-hot/10 text-[11px] text-center px-4 py-1.5 text-white/80">
        <b className="text-hot">v0.01:</b> prices are indicative heuristics, not appraisals. Offers, bids and purchases are simulated, and no money moves.
      </div>
    </header>
    </>
  );
}
