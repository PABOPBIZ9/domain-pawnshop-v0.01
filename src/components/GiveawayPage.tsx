"use client";

import KitGiveaway from "@/kit/Giveaway";
import { useT } from "@/lib/i18n";
import { giveaway } from "@/config/giveaway";
import { site } from "@/config/site";
import { giveawayEntered, requestJoin, usePlayer } from "@/lib/player";

export function GiveawayPage() {
  const { player } = usePlayer();
  const { t, lang } = useT();
  return (
    <KitGiveaway
      cfg={giveaway}
      rulesNote={lang === "en" ? undefined : t("rulesEnglish")}
      member={player ? { name: player.name, handle: `player${player.number}` } : null}
      onJoin={requestJoin}
      onEnter={(id) => giveawayEntered(id, giveaway.participant.badge, giveaway.participant.points)}
      shareUrl={`https://${site.domains.current}`}
    />
  );
}
