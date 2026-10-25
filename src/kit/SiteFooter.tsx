"use client";

import Link from "next/link";
import { useState } from "react";
import { ICONS } from "@/lib/social-icons";
import { profileUrl, type Platform } from "@/lib/socials";
import { FOOTER_18, type FooterConfig } from "./types";

type Lang = { code: string; label: string };

function chipUrl(cfg: FooterConfig, p: Platform): string | null | "hidden" {
  const o = cfg.overrides?.[p];
  if (o === "") return "hidden";
  if (!cfg.handleConfirmed) return null;
  if (o && /^https?:\/\//.test(o)) return o;
  return profileUrl(p, o || cfg.handle);
}

/**
 * PuckGold-style footer: newsletter, 4 link columns, "Follow SHORT · @handle" with 18 chips,
 * © line, legal links, language switcher, Back to top.
 */
export default function SiteFooter({ cfg, langs, lang, onLang, labels }: {
  cfg: FooterConfig;
  langs: readonly Lang[];
  lang: string;
  onLang: (code: string) => void;
  labels?: { follow?: string; backToTop?: string; changeLanguage?: string };
}) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [done, setDone] = useState(false);
  const platforms = cfg.platforms ?? FOOTER_18;
  const nl = cfg.newsletter;

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nl || !/.+@.+\..+/.test(email) || !consent) return;
    try {
      const k = nl.storageKey;
      const list: string[] = JSON.parse(localStorage.getItem(k) || "[]");
      if (!list.includes(email)) list.push(email);
      localStorage.setItem(k, JSON.stringify(list));
    } catch {}
    setDone(true);
    setEmail("");
  };

  return (
    <footer className="mt-16 border-t border-line bg-panel/60">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_2fr]">
          <div>
            <div className="text-xl font-black tracking-tight">{cfg.brand}</div>
            <p className="mt-1 text-sm text-mute">{cfg.tagline}</p>
            {nl ? (
              <form className="mt-5" onSubmit={subscribe}>
                <label htmlFor="nl-email" className="text-sm font-bold">{nl.title}</label>
                <div className="mt-2 flex gap-2">
                  <input id="nl-email" type="email" className="input w-full" placeholder={nl.placeholder} value={email} onChange={(e) => setEmail(e.target.value)} />
                  <button className="btn btn-primary text-sm" disabled={!consent || !email}>{nl.cta}</button>
                </div>
                <label className="mt-2 flex items-start gap-2 text-xs text-mute">
                  <input type="checkbox" className="mt-0.5" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                  <span>{nl.consent}</span>
                </label>
                {done ? <p className="mt-2 text-xs text-accent">You&apos;re on the list (saved in this browser for v0.01).</p> : null}
              </form>
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {cfg.columns.map((c) => (
              <div key={c.title}>
                <h3 className="text-xs font-black uppercase tracking-widest text-mute">{c.title}</h3>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {c.links.map((l) => (
                    <li key={l.label}><Link href={l.href} className="opacity-85 hover:opacity-100 hover:underline">{l.label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10">
          <h3 className="text-sm font-black">
            {labels?.follow ?? "Follow"} {cfg.brandShort} · @{cfg.handle}
            {!cfg.handleConfirmed ? <span className="pill ml-2 bg-gold/20 text-gold">coming soon</span> : null}
          </h3>
          {cfg.buildingInPublic ? <p className="mt-1 text-xs text-mute">{cfg.buildingInPublic}</p> : null}
          <ul className="mt-3 flex flex-wrap gap-2" aria-label="Social links">
            {platforms.map((p) => {
              const url = chipUrl(cfg, p);
              if (url === "hidden") return null;
              const title = ICONS[p].title;
              const inner = (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={ICONS[p].path} /></svg>
                  <span className="text-xs font-semibold">{title}</span>
                </>
              );
              return (
                <li key={p}>
                  {url ? (
                    <a href={url} target="_blank" rel="noopener noreferrer me" aria-label={`${title} @${cfg.handle}`}
                      className="flex items-center gap-1.5 rounded-full border border-line bg-panel2 px-3 py-1.5 text-mute transition hover:border-primary hover:text-current">
                      {inner}
                    </a>
                  ) : (
                    <span title={`${title}: coming soon`} aria-label={`${title}: coming soon`}
                      className="flex cursor-default items-center gap-1.5 rounded-full border border-dashed border-line px-3 py-1.5 text-mute opacity-60">
                      {inner}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {cfg.disclaimers?.length ? (
          <div className="mt-8 space-y-1 text-xs text-mute">{cfg.disclaimers.map((d) => <p key={d}>{d}</p>)}</div>
        ) : null}

        <div className="mt-6 flex flex-col gap-4 border-t border-line pt-6 text-sm text-mute md:flex-row md:items-center md:justify-between">
          <div>{cfg.copyright}</div>
          <nav className="flex flex-wrap items-center gap-4">
            {cfg.legal.map((l) => <Link key={l.label} href={l.href} className="hover:underline">{l.label}</Link>)}
            <label className="flex items-center gap-2">
              <span className="sr-only">{labels?.changeLanguage ?? "Change language"}</span>
              <span aria-hidden>🌐</span>
              <select className="input !w-auto !py-1 text-sm" value={lang} onChange={(e) => onLang(e.target.value)} aria-label={labels?.changeLanguage ?? "Change language"}>
                {langs.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
            </label>
            <a href="#top" className="hover:underline">{labels?.backToTop ?? "Back to top"} ↑</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
