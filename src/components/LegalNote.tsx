"use client";
import { useT } from "@/lib/i18n";
export function LegalNote() {
  const { t, lang } = useT();
  if (lang === "en") return null;
  return <p className="lx-champagne rounded-lg px-3 py-2 text-sm font-bold">🌐 {t("rulesEnglish")}</p>;
}
