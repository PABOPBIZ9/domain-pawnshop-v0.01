"use client";

import SiteFooter from "@/kit/SiteFooter";
import { footer } from "@/config/site";
import { setLang, usePlayer } from "@/lib/player";

const LANGS = [
  ["en", "🇺🇸 English", "Follow", "Back to top"], ["ja", "🇯🇵 日本語", "フォロー", "トップへ戻る"], ["ko", "🇰🇷 한국어", "팔로우", "맨 위로"],
  ["zh", "🇨🇳 中文", "关注", "返回顶部"], ["ru", "🇷🇺 Русский", "Подписаться", "Наверх"], ["es", "🇪🇸 Español", "Sigue a", "Volver arriba"],
  ["nl", "🇳🇱 Nederlands", "Volg", "Terug naar boven"], ["it", "🇮🇹 Italiano", "Segui", "Torna su"], ["fr", "🇫🇷 Français", "Suivre", "Haut de page"],
  ["de", "🇩🇪 Deutsch", "Folge", "Nach oben"], ["pt", "🇧🇷 Português", "Siga", "Voltar ao topo"],
] as const;

/** 18-social footer (PuckGold pattern): "Follow SHOTCLOCK · @shotclockfun". */
export function Footer() {
  const { lang } = usePlayer();
  const L = LANGS.find((l) => l[0] === lang) ?? LANGS[0];
  return (
    <SiteFooter cfg={footer} langs={LANGS.map((l) => ({ code: l[0], label: l[1] }))} lang={L[0]} onLang={setLang}
      labels={{ follow: L[2], backToTop: L[3] }} />
  );
}
