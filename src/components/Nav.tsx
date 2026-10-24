"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/market", label: "Marketplace" },
  { href: "/upload", label: "Upload & Value" },
  { href: "/bundles", label: "Bundles" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Nav() {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-ink/80 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 font-black tracking-tight text-lg">
          <span className="grid place-items-center w-8 h-8 rounded-lg bg-acid text-black text-sm">P.</span>
          <span>
            PAWN<span className="text-acid">.</span>DOMAINS
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
        <Link href="/upload" className="ml-auto btn btn-acid text-sm hidden md:inline-block">
          Get an instant offer
        </Link>
      </div>
    </header>
  );
}
