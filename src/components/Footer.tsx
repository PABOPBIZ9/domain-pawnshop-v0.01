"use client";

import SiteFooter from "@/kit/SiteFooter";
import { footer } from "@/config/site";
import { setLang } from "@/lib/player";
import { LANGS, useLangSync, useT } from "@/lib/i18n";

export const chooseLang = (l: string) => { try { localStorage.setItem("sc.lang.chosen", "1"); } catch {} setLang(l); };

/** 18-social footer (PuckGold pattern): "Follow SHOTCLOCK · @shotclockfun". */
export function Footer() {
  const { t, lang } = useT();
  useLangSync(setLang);
  return (
    <SiteFooter cfg={footer} langs={LANGS.map((l) => ({ code: l[0], label: `🌐 ${l[1]}` }))} lang={lang} onLang={chooseLang}
      labels={{ follow: t("follow"), backToTop: t("backTop"), changeLanguage: t("language") }} />
  );
}
