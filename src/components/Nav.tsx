"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { PlayerChip } from "./Player";
import { Ticker } from "./Ticker";
import { EarlyBirdBar } from "./EarlyBird";
import { ThemeToggle } from "@/kit/ThemeToggle";
import { AuthButton } from "@/kit/auth/auth";
import { requestJoin } from "@/lib/player";
import { LANGS, useT, type Key } from "@/lib/i18n";
import { chooseLang } from "./Footer";

const LINKS: { href: string; k: Key | null; label?: string }[] = [
  { href: "/shotclock", k: "nav_shot" },
  { href: "/market", k: "nav_market" },
  { href: "/upload", k: "nav_upload" },
  { href: "/bundles", k: "nav_bundles" },
  { href: "/dashboard", k: "nav_dash" },
  { href: "/giveaway", k: "nav_give" },
  { href: "/pricing", k: null, label: "👑 OG" },
  { href: "/dou", k: null, label: "DOU DIGITAL" },
];

export function Nav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const { t, lang } = useT();
  const lbl = (l: (typeof LINKS)[number]) => (l.k ? t(l.k) : l.label);
  return (
    <>
    <Ticker />
    <EarlyBirdBar />
    <header className="sticky top-0 z-30 border-b border-line bg-ink/80 backdrop-blur">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center gap-2 lg:gap-6">
        <Link href="/" className="flex shrink-0 min-h-11 items-center gap-1.5 sm:gap-2 font-black tracking-tight text-base sm:text-lg">
          <span className="grid place-items-center w-8 h-8 rounded-lg lx-sig text-base">⏱</span>
          <span>
            SHOT<span className="text-acid">CLOCK</span>
          </span>
          <span className="hidden sm:inline text-[10px] font-mono px-1.5 py-0.5 rounded bg-panel2 border border-line text-mute">v0.01</span>
        </Link>
        <nav aria-label="Main" className="hidden xl:flex gap-1 text-sm">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${path.startsWith(l.href) ? "bg-panel2 text-white" : "text-mute hover:text-white"}`}
            >
              {lbl(l)}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden 2xl:flex items-center gap-2"><ThemeToggle className="border border-line bg-panel2" labels={{ theme: t("theme"), system: t("system"), light: t("light"), dark: t("dark") }} />
          <label className="theme-toggle border border-line bg-panel2" title={t("language")}>
            <span aria-hidden>🌐</span>
            <select aria-label={t("language")} value={lang} onChange={(e) => chooseLang(e.target.value)} className="max-w-[6.5rem]">
              {LANGS.map(([c, n]) => <option key={c} value={c}>{n}</option>)}
            </select>
          </label></div>
          <div className="hidden sm:block"><PlayerChip /></div>
          <AuthButton />
          <button
            type="button"
            className="2xl:hidden grid place-items-center w-11 h-11 rounded-lg border border-line bg-panel2 text-white"
            aria-label={open ? t("closeMenu") : t("openMenu")}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? <path d="M5 5l10 10M15 5L5 15" /> : <path d="M3 5h14M3 10h14M3 15h14" />}
            </svg>
          </button>
          <Link href="/shotclock" className="btn btn-acid text-sm hidden 2xl:inline-block whitespace-nowrap">
            {t("beat")}
          </Link>
        </div>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Main" className="2xl:hidden border-t border-line bg-ink/95 backdrop-blur">
          <ul className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm xl:hidden">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center min-h-11 px-3 py-2.5 rounded-lg border border-line ${path.startsWith(l.href) ? "bg-panel2 text-white" : "text-white/85 hover:text-white"}`}
                >
                  {lbl(l)}
                </Link>
              </li>
            ))}
          </ul>
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap gap-2">
            <ThemeToggle className="min-h-11 border border-line bg-panel2" labels={{ theme: t("theme"), system: t("system"), light: t("light"), dark: t("dark") }} />
            <label className="theme-toggle min-h-11 border border-line bg-panel2" title={t("language")}>
              <span aria-hidden>🌐</span>
              <select aria-label={t("language")} value={lang} onChange={(e) => chooseLang(e.target.value)}>
                {LANGS.map(([c, n]) => <option key={c} value={c}>{n}</option>)}
              </select>
            </label>
            <button type="button" onClick={() => { setOpen(false); requestJoin(); }} className="sm:hidden theme-toggle min-h-11 border border-line bg-panel2 font-bold">🏅 {t("myPoints")}</button>
          </div>
        </nav>
      )}
      <div className="border-t border-line bg-hot/10 text-[11px] text-center px-4 py-1.5 text-white/80">
        <b className="text-hot">v0.01:</b> {t("banner")}
      </div>
    </header>
    </>
  );
}
