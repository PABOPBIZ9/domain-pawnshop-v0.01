"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/shotclock", label: "⏱ Shot Clock" },
  { href: "/market", label: "Marketplace" },
  { href: "/upload", label: "Upload & Value" },
  { href: "/bundles", label: "Bundles" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dou", label: "DOU DIGITAL" },
];

export function Nav() {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-ink/80 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 font-black tracking-tight text-lg">
          <span className="grid place-items-center w-8 h-8 rounded-lg bg-acid text-black text-base">⏱</span>
          <span>
            SHOT<span className="text-acid">CLOCK</span>
          </span>
          <span className="hidden sm:inline text-[10px] font-mono px-1.5 py-0.5 rounded bg-panel2 border border-line text-mute">v0.01</span>
        </Link>
        <nav className="flex gap-1 overflow-x-auto text-sm">
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
        <Link href="/shotclock" className="ml-auto btn btn-acid text-sm hidden md:inline-block">
          Beat the clock
        </Link>
      </div>
      <div className="border-t border-line bg-hot/10 text-[11px] text-center px-4 py-1.5 text-white/80">
        <b className="text-hot">v0.01:</b> prices are indicative heuristics, not appraisals. Offers, bids and purchases are simulated, and no money moves.
      </div>
    </header>
  );
}
