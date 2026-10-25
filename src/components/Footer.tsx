"use client";

import Link from "next/link";
import { social } from "@/config/social";
import { profileUrl, platformTitle } from "@/lib/socials";
import { setLang, usePlayer } from "@/lib/player";
import { SocialIcon } from "./SocialIcon";

const LANGS = [
  ["en", "🇺🇸 English", "Follow", "Back to top"], ["ja", "🇯🇵 日本語", "フォロー", "トップへ戻る"], ["ko", "🇰🇷 한국어", "팔로우", "맨 위로"],
  ["zh", "🇨🇳 中文", "关注", "返回顶部"], ["ru", "🇷🇺 Русский", "Подписаться", "Наверх"], ["es", "🇪🇸 Español", "Sigue a", "Volver arriba"],
  ["nl", "🇳🇱 Nederlands", "Volg", "Terug naar boven"], ["it", "🇮🇹 Italiano", "Segui", "Torna su"], ["fr", "🇫🇷 Français", "Suivre", "Haut de page"],
  ["de", "🇩🇪 Deutsch", "Folge", "Nach oben"], ["pt", "🇧🇷 Português", "Siga", "Voltar ao topo"],
] as const;

export function Footer() {
  const { lang } = usePlayer();
  const L = LANGS.find((l) => l[0] === lang) ?? LANGS[0];
  const links = social.socials
    .map((s) => ({ ...s, url: profileUrl(s.platform, s.handle) }))
    .filter((s): s is typeof s & { url: string } => !!s.url);
  return (
    <footer className="border-t border-line mt-12 bg-panel/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="max-w-md">
            <div className="font-black text-lg">
              {L[2]} {social.brandShort}
              {social.handleConfirmed ? <span className="text-mute"> · @{social.handle}</span> : null}
            </div>
            <p className="text-sm text-mute mt-1">{social.buildingInPublic}</p>
            {links.length === 0 ? <p className="text-xs text-mute mt-2">Socials coming soon.</p> : null}
          </div>
          {links.length ? (
            <ul className="flex flex-wrap gap-2 max-w-xl" aria-label="Social links">
              {links.map((s) => (
                <li key={s.platform}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={platformTitle(s.platform)} title={platformTitle(s.platform)}
                    className="w-10 h-10 rounded-xl border border-line bg-panel2 flex items-center justify-center text-mute hover:text-white hover:border-acid">
                    <SocialIcon p={s.platform} />
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className="mt-6 pt-5 border-t border-line text-xs text-mute flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
          <p className="max-w-2xl">
            <span className="font-bold text-white">SHOTCLOCK</span> v0.01 prototype. Prices are indicative heuristics, not appraisals. Offers and bids are simulated,
            and no real payments, escrow or transfers happen here. Your activity is stored only in your browser. Anything marked DEMO DATA is simulated.
            CLOCK POINTS have no cash value.
          </p>
          <nav className="flex flex-wrap items-center gap-4">
            {social.legal.map((l) => <Link key={l.label} href={l.href} className="hover:text-white">{l.label}</Link>)}
            <select aria-label="Language" className="input !py-1 text-xs" value={L[0]} onChange={(e) => setLang(e.target.value)}>
              {LANGS.map((l) => <option key={l[0]} value={l[0]}>{l[1]}</option>)}
            </select>
            <a href="#top" className="hover:text-white">↑ {L[3]}</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
