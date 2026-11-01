"use client";
/**
 * SHOTCLOCK UI strings (11 languages). Brand names, @shotclockfun, prices and the official
 * giveaway rules stay in English (rules show a translated "Official rules are in English" note).
 */
import { useCallback, useEffect } from "react";
import { usePlayer } from "./player";

export const LANGS = [
  ["en", "English"], ["es", "Español"], ["pt", "Português (BR)"], ["fr", "Français"], ["de", "Deutsch"], ["it", "Italiano"],
  ["ja", "日本語"], ["ko", "한국어"], ["zh", "中文 (简体)"], ["hi", "हिन्दी"], ["ar", "العربية"],
] as const;
export type Lang = (typeof LANGS)[number][0];
export const RTL = new Set(["ar"]);

const en = {
  nav_shot: "⏱ Shot Clock", nav_market: "Marketplace", nav_upload: "Upload & Value", nav_bundles: "Bundles", nav_dash: "Dashboard", nav_give: "🎁 Giveaway",
  beat: "Beat the clock", openMenu: "Open menu", closeMenu: "Close menu",
  banner: "prices are indicative heuristics, not appraisals. Offers, bids and purchases are simulated, and no money moves.",
  eb_have: "You have the {b} badge.", eb_join: "Join free for the {b} badge + {n} bonus {p}.", eb_ends: "ends in", eb_claim: "Claim my spot →",
  live: "LIVE · names are expiring right now", h1a: "Domains on the", h1b: "shot clock.",
  sub: "Real names. Real deadlines. Priced to move before they drop. SHOTCLOCK is the live, countdown-driven quick-sale floor for the domain trenches.",
  browse: "Browse the floor", value: "Value my names",
  st_live: "Live names & lots", st_floor: "Floor", st_expired: "Already expired", st_expired_sub: "in grace / redemption (est.)", st_lots: "Lots", st_lots_sub: "quick-sale bundles",
  run_t: "⏱ Running out first", run_s: "The next names to hit zero. Relative countdowns, live.", full: "Full shot clock →",
  top_t: "Top of the board", top_s: "Highest heuristic list prices on the floor right now.", viewall: "View all →",
  s1t: "On the clock", s1d: "Every name carries a live countdown to its expiry, grace or redemption deadline.",
  s2t: "Priced to move", s2d: "A transparent heuristic sets a range, a buy-now price and an instant pawn quote.",
  s3t: "Quick-sale lots", s3d: "Families of names get bundled into lots for bulk buyers and resellers.",
  s4t: "Bid fast", s4d: "Buy now, place a bid or make an offer before the clock runs out.",
  s5t: "Close", s5d: "v0.01 simulates the deal. Escrow and payments are on the roadmap.",
  ib_t: "Instant buyout", ib_d: "A fast, discounted price for when the names need to go before renewal day.",
  ip_t: "Instant pawn", ip_d: "Borrow against a name at a loan-to-value set by quality and urgency. Quotes only in v0.01.",
  tl_t: "Trench lots", tl_d: "Bundles of the long tail for resellers who buy in bulk.",
  follow: "Follow", backTop: "Back to top", theme: "Theme", system: "System", light: "Light", dark: "Dark", language: "Language",
  rulesEnglish: "Official rules are in English. Translations are for convenience only.",
  myPoints: "My points & profile",
  nf_t: "This name already dropped.", nf_s: "The page you're looking for isn't on the floor.", nf_home: "Back to the floor",
};
export type Key = keyof typeof en;
type D = Partial<Record<Key, string>>;

const es: D = { myPoints: "Mis puntos y perfil", nav_shot: "⏱ Reloj", nav_market: "Mercado", nav_upload: "Subir y valorar", nav_bundles: "Lotes", nav_dash: "Panel", nav_give: "🎁 Sorteo",
  beat: "Gánale al reloj", openMenu: "Abrir menú", closeMenu: "Cerrar menú",
  banner: "los precios son estimaciones heurísticas, no tasaciones. Ofertas, pujas y compras son simuladas y no se mueve dinero.",
  eb_have: "Ya tienes la insignia {b}.", eb_join: "Únete gratis y obtén la insignia {b} + {n} {p} extra.", eb_ends: "termina en", eb_claim: "Reservar mi lugar →",
  live: "EN VIVO · hay nombres expirando ahora mismo", h1a: "Dominios contra el", h1b: "reloj.",
  sub: "Nombres reales. Plazos reales. Precios para vender antes de que caigan. SHOTCLOCK es el piso de venta rápida en vivo, con cuenta regresiva, para las trincheras de dominios.",
  browse: "Explorar el piso", value: "Valorar mis nombres",
  st_live: "Nombres y lotes en vivo", st_floor: "Precio mínimo", st_expired: "Ya expirados", st_expired_sub: "en gracia / redención (est.)", st_lots: "Lotes", st_lots_sub: "paquetes de venta rápida",
  run_t: "⏱ Los primeros en agotarse", run_s: "Los próximos nombres en llegar a cero. Cuentas regresivas en vivo.", full: "Reloj completo →",
  top_t: "Lo más alto del tablero", top_s: "Los precios heurísticos más altos del piso ahora mismo.", viewall: "Ver todo →",
  s1t: "Contra el reloj", s1d: "Cada nombre tiene una cuenta regresiva hasta su vencimiento, gracia o redención.",
  s2t: "Precio para vender", s2d: "Una heurística transparente fija un rango, un precio de compra inmediata y una cotización de empeño.",
  s3t: "Lotes de venta rápida", s3d: "Las familias de nombres se agrupan en lotes para compradores al por mayor y revendedores.",
  s4t: "Puja rápido", s4d: "Compra ya, puja o haz una oferta antes de que se acabe el tiempo.",
  s5t: "Cierra", s5d: "La v0.01 simula el trato. Depósito en garantía y pagos están en la hoja de ruta.",
  ib_t: "Compra instantánea", ib_d: "Un precio rápido con descuento cuando los nombres deben salir antes de la renovación.",
  ip_t: "Empeño instantáneo", ip_d: "Pide prestado contra un nombre según su calidad y urgencia. Solo cotizaciones en v0.01.",
  tl_t: "Lotes de trinchera", tl_d: "Paquetes de cola larga para revendedores que compran al por mayor.",
  follow: "Sigue a", backTop: "Volver arriba", theme: "Tema", system: "Sistema", light: "Claro", dark: "Oscuro", language: "Idioma",
  rulesEnglish: "Las reglas oficiales están en inglés. Las traducciones son solo de referencia.",
  nf_t: "Este nombre ya cayó.", nf_s: "La página que buscas no está en el piso.", nf_home: "Volver al piso" };

const pt: D = { myPoints: "Meus pontos e perfil", nav_shot: "⏱ Relógio", nav_market: "Mercado", nav_upload: "Enviar e avaliar", nav_bundles: "Lotes", nav_dash: "Painel", nav_give: "🎁 Sorteio",
  beat: "Vença o relógio", openMenu: "Abrir menu", closeMenu: "Fechar menu",
  banner: "os preços são estimativas heurísticas, não avaliações. Ofertas, lances e compras são simulados e nenhum dinheiro é movimentado.",
  eb_have: "Você já tem o selo {b}.", eb_join: "Entre grátis e ganhe o selo {b} + {n} {p} de bônus.", eb_ends: "termina em", eb_claim: "Garantir minha vaga →",
  live: "AO VIVO · nomes expirando agora mesmo", h1a: "Domínios contra o", h1b: "relógio.",
  sub: "Nomes reais. Prazos reais. Preços para vender antes de caírem. SHOTCLOCK é o pregão de venda rápida ao vivo, com contagem regressiva, para as trincheiras de domínios.",
  browse: "Ver o pregão", value: "Avaliar meus nomes",
  st_live: "Nomes e lotes ao vivo", st_floor: "Piso", st_expired: "Já expirados", st_expired_sub: "em carência / resgate (est.)", st_lots: "Lotes", st_lots_sub: "pacotes de venda rápida",
  run_t: "⏱ Acabando primeiro", run_s: "Os próximos nomes a zerar. Contagens regressivas ao vivo.", full: "Relógio completo →",
  top_t: "Topo do quadro", top_s: "Os maiores preços heurísticos do pregão agora.", viewall: "Ver tudo →",
  s1t: "Contra o relógio", s1d: "Cada nome tem uma contagem regressiva até o vencimento, carência ou resgate.",
  s2t: "Preço para vender", s2d: "Uma heurística transparente define uma faixa, um preço de compra imediata e uma cotação de penhor.",
  s3t: "Lotes de venda rápida", s3d: "Famílias de nomes viram lotes para compradores em volume e revendedores.",
  s4t: "Lance rápido", s4d: "Compre já, dê um lance ou faça uma oferta antes que o tempo acabe.",
  s5t: "Feche", s5d: "A v0.01 simula o negócio. Custódia e pagamentos estão no roadmap.",
  ib_t: "Compra instantânea", ib_d: "Um preço rápido com desconto quando os nomes precisam sair antes da renovação.",
  ip_t: "Penhor instantâneo", ip_d: "Pegue emprestado com um nome como garantia, conforme qualidade e urgência. Só cotações na v0.01.",
  tl_t: "Lotes de trincheira", tl_d: "Pacotes de cauda longa para revendedores que compram em volume.",
  follow: "Siga", backTop: "Voltar ao topo", theme: "Tema", system: "Sistema", light: "Claro", dark: "Escuro", language: "Idioma",
  rulesEnglish: "As regras oficiais estão em inglês. As traduções são apenas para conveniência.",
  nf_t: "Este nome já caiu.", nf_s: "A página que você procura não está no pregão.", nf_home: "Voltar ao pregão" };

const fr: D = { myPoints: "Mes points et profil", nav_shot: "⏱ Chrono", nav_market: "Marché", nav_upload: "Importer et estimer", nav_bundles: "Lots", nav_dash: "Tableau de bord", nav_give: "🎁 Concours",
  beat: "Battez le chrono", openMenu: "Ouvrir le menu", closeMenu: "Fermer le menu",
  banner: "les prix sont des estimations heuristiques, pas des expertises. Offres, enchères et achats sont simulés ; aucun argent ne circule.",
  eb_have: "Vous avez le badge {b}.", eb_join: "Inscrivez-vous gratuitement pour le badge {b} + {n} {p} bonus.", eb_ends: "fin dans", eb_claim: "Réserver ma place →",
  live: "EN DIRECT · des noms expirent en ce moment", h1a: "Des domaines contre le", h1b: "chrono.",
  sub: "De vrais noms. De vraies échéances. Des prix pour vendre avant l'expiration. SHOTCLOCK est la salle de vente rapide en direct, rythmée par le compte à rebours.",
  browse: "Parcourir la salle", value: "Estimer mes noms",
  st_live: "Noms et lots en direct", st_floor: "Prix plancher", st_expired: "Déjà expirés", st_expired_sub: "en grâce / rédemption (est.)", st_lots: "Lots", st_lots_sub: "lots de vente rapide",
  run_t: "⏱ Les premiers à expirer", run_s: "Les prochains noms à atteindre zéro. Comptes à rebours en direct.", full: "Chrono complet →",
  top_t: "En tête du tableau", top_s: "Les prix heuristiques les plus élevés du moment.", viewall: "Tout voir →",
  s1t: "Contre la montre", s1d: "Chaque nom affiche un compte à rebours jusqu'à son expiration, sa période de grâce ou de rédemption.",
  s2t: "Prix pour vendre", s2d: "Une heuristique transparente fixe une fourchette, un prix d'achat immédiat et une offre de prêt sur gage.",
  s3t: "Lots express", s3d: "Les familles de noms sont regroupées en lots pour les acheteurs en gros et les revendeurs.",
  s4t: "Enchérissez vite", s4d: "Achetez, enchérissez ou faites une offre avant la fin du chrono.",
  s5t: "Concluez", s5d: "La v0.01 simule la transaction. Séquestre et paiements sont prévus.",
  ib_t: "Rachat immédiat", ib_d: "Un prix rapide et réduit quand les noms doivent partir avant le renouvellement.",
  ip_t: "Prêt sur gage immédiat", ip_d: "Empruntez contre un nom selon sa qualité et l'urgence. Devis uniquement en v0.01.",
  tl_t: "Lots de tranchée", tl_d: "Des lots de longue traîne pour les revendeurs qui achètent en gros.",
  follow: "Suivre", backTop: "Haut de page", theme: "Thème", system: "Système", light: "Clair", dark: "Sombre", language: "Langue",
  rulesEnglish: "Le règlement officiel est en anglais. Les traductions sont fournies à titre indicatif.",
  nf_t: "Ce nom a déjà expiré.", nf_s: "La page recherchée n'est pas en vente.", nf_home: "Retour à la salle" };

const de: D = { myPoints: "Meine Punkte & Profil", nav_shot: "⏱ Countdown", nav_market: "Marktplatz", nav_upload: "Hochladen & bewerten", nav_bundles: "Pakete", nav_dash: "Dashboard", nav_give: "🎁 Gewinnspiel",
  beat: "Schlag die Uhr", openMenu: "Menü öffnen", closeMenu: "Menü schließen",
  banner: "Preise sind heuristische Richtwerte, keine Gutachten. Angebote, Gebote und Käufe sind simuliert, es fließt kein Geld.",
  eb_have: "Du hast das {b}-Abzeichen.", eb_join: "Kostenlos beitreten: {b}-Abzeichen + {n} Bonus-{p}.", eb_ends: "endet in", eb_claim: "Platz sichern →",
  live: "LIVE · Namen laufen gerade ab", h1a: "Domains gegen die", h1b: "Uhr.",
  sub: "Echte Namen. Echte Fristen. Preise, die verkaufen, bevor sie fallen. SHOTCLOCK ist der Live-Schnellverkauf mit Countdown für Domain-Profis.",
  browse: "Angebote ansehen", value: "Meine Namen bewerten",
  st_live: "Live-Namen & Pakete", st_floor: "Mindestpreis", st_expired: "Bereits abgelaufen", st_expired_sub: "in Kulanz / Wiederherstellung (geschätzt)", st_lots: "Pakete", st_lots_sub: "Schnellverkaufs-Bündel",
  run_t: "⏱ Laufen zuerst ab", run_s: "Die nächsten Namen bei null. Live-Countdowns.", full: "Ganzer Countdown →",
  top_t: "Spitze der Tafel", top_s: "Die höchsten heuristischen Preise gerade jetzt.", viewall: "Alle ansehen →",
  s1t: "Auf Zeit", s1d: "Jeder Name hat einen Live-Countdown bis Ablauf, Kulanz- oder Wiederherstellungsfrist.",
  s2t: "Preis zum Verkaufen", s2d: "Eine transparente Heuristik setzt Spanne, Sofortkaufpreis und Pfandangebot.",
  s3t: "Schnellverkaufs-Pakete", s3d: "Namensfamilien werden zu Paketen für Großkäufer und Wiederverkäufer gebündelt.",
  s4t: "Schnell bieten", s4d: "Sofort kaufen, bieten oder ein Angebot machen, bevor die Uhr abläuft.",
  s5t: "Abschließen", s5d: "v0.01 simuliert den Deal. Treuhand und Zahlungen sind geplant.",
  ib_t: "Sofortankauf", ib_d: "Ein schneller, rabattierter Preis, wenn Namen vor der Verlängerung weg müssen.",
  ip_t: "Sofortpfand", ip_d: "Leihe gegen einen Namen, je nach Qualität und Dringlichkeit. In v0.01 nur Angebote.",
  tl_t: "Long-Tail-Pakete", tl_d: "Bündel aus dem Long Tail für Wiederverkäufer, die in Menge kaufen.",
  follow: "Folge", backTop: "Nach oben", theme: "Design", system: "System", light: "Hell", dark: "Dunkel", language: "Sprache",
  rulesEnglish: "Die offiziellen Teilnahmebedingungen sind auf Englisch. Übersetzungen dienen nur der Orientierung.",
  nf_t: "Dieser Name ist schon weg.", nf_s: "Die gesuchte Seite gibt es hier nicht.", nf_home: "Zurück zum Marktplatz" };

const it: D = { myPoints: "I miei punti e profilo", nav_shot: "⏱ Cronometro", nav_market: "Mercato", nav_upload: "Carica e valuta", nav_bundles: "Lotti", nav_dash: "Pannello", nav_give: "🎁 Concorso",
  beat: "Batti il cronometro", openMenu: "Apri menu", closeMenu: "Chiudi menu",
  banner: "i prezzi sono stime euristiche, non perizie. Offerte, puntate e acquisti sono simulati e non si muove denaro.",
  eb_have: "Hai il badge {b}.", eb_join: "Iscriviti gratis per il badge {b} + {n} {p} bonus.", eb_ends: "termina tra", eb_claim: "Prenota il mio posto →",
  live: "LIVE · nomi in scadenza proprio ora", h1a: "Domini contro il", h1b: "cronometro.",
  sub: "Nomi veri. Scadenze vere. Prezzi per vendere prima che scadano. SHOTCLOCK è la sala di vendita rapida live, a conto alla rovescia, per chi vive di domini.",
  browse: "Esplora la sala", value: "Valuta i miei nomi",
  st_live: "Nomi e lotti live", st_floor: "Prezzo minimo", st_expired: "Già scaduti", st_expired_sub: "in grazia / riscatto (stima)", st_lots: "Lotti", st_lots_sub: "pacchetti a vendita rapida",
  run_t: "⏱ I primi a scadere", run_s: "I prossimi nomi ad arrivare a zero. Conti alla rovescia live.", full: "Cronometro completo →",
  top_t: "In cima alla classifica", top_s: "I prezzi euristici più alti in sala adesso.", viewall: "Vedi tutto →",
  s1t: "A tempo", s1d: "Ogni nome ha un conto alla rovescia fino a scadenza, grazia o riscatto.",
  s2t: "Prezzo per vendere", s2d: "Un'euristica trasparente fissa una forbice, un prezzo compra-subito e una quotazione di pegno.",
  s3t: "Lotti rapidi", s3d: "Le famiglie di nomi diventano lotti per acquirenti all'ingrosso e rivenditori.",
  s4t: "Punta veloce", s4d: "Compra subito, punta o fai un'offerta prima che scada il tempo.",
  s5t: "Chiudi", s5d: "La v0.01 simula l'affare. Escrow e pagamenti sono in programma.",
  ib_t: "Acquisto immediato", ib_d: "Un prezzo rapido e scontato quando i nomi devono partire prima del rinnovo.",
  ip_t: "Pegno immediato", ip_d: "Prendi in prestito su un nome in base a qualità e urgenza. Solo preventivi nella v0.01.",
  tl_t: "Lotti di trincea", tl_d: "Pacchetti di coda lunga per rivenditori che comprano in blocco.",
  follow: "Segui", backTop: "Torna su", theme: "Tema", system: "Sistema", light: "Chiaro", dark: "Scuro", language: "Lingua",
  rulesEnglish: "Il regolamento ufficiale è in inglese. Le traduzioni sono solo indicative.",
  nf_t: "Questo nome è già scaduto.", nf_s: "La pagina che cerchi non è in sala.", nf_home: "Torna alla sala" };

const ja: D = { myPoints: "ポイントとプロフィール", nav_shot: "⏱ ショットクロック", nav_market: "マーケット", nav_upload: "アップロードと査定", nav_bundles: "まとめ売り", nav_dash: "ダッシュボード", nav_give: "🎁 プレゼント",
  beat: "時間に勝て", openMenu: "メニューを開く", closeMenu: "メニューを閉じる",
  banner: "価格は目安の推定値で、鑑定ではありません。オファー、入札、購入はシミュレーションで、実際のお金は動きません。",
  eb_have: "{b}バッジを獲得済みです。", eb_join: "無料登録で{b}バッジ＋ボーナス{n}{p}。", eb_ends: "残り", eb_claim: "枠を確保する →",
  live: "ライブ · いまドメインが失効中", h1a: "ドメインは", h1b: "時間との勝負。",
  sub: "本物の名前。本物の期限。失効前に売れる価格。SHOTCLOCKはカウントダウン式のライブ即売ドメインマーケットです。",
  browse: "フロアを見る", value: "ドメインを査定",
  st_live: "出品中の名前とロット", st_floor: "最低価格", st_expired: "失効済み", st_expired_sub: "猶予／償還期間（推定）", st_lots: "ロット", st_lots_sub: "即売まとめ",
  run_t: "⏱ まもなく終了", run_s: "次にゼロになる名前。ライブのカウントダウン。", full: "すべて見る →",
  top_t: "ボードのトップ", top_s: "現在いちばん高い推定価格。", viewall: "すべて表示 →",
  s1t: "時間制限", s1d: "各名前に失効・猶予・償還期限までのライブカウントダウン。",
  s2t: "売れる価格", s2d: "透明なロジックで価格帯、即決価格、即時質入れ額を算出。",
  s3t: "即売ロット", s3d: "関連ドメインをまとめてバルク購入者や転売業者向けに。",
  s4t: "すばやく入札", s4d: "時間切れの前に即決、入札、またはオファー。",
  s5t: "成約", s5d: "v0.01は取引をシミュレーション。エスクローと決済は今後対応予定。",
  ib_t: "即時買取", ib_d: "更新日前に手放したいときの、すばやい割引価格。",
  ip_t: "即時質入れ", ip_d: "品質と緊急度に応じてドメインを担保に借入。v0.01は見積もりのみ。",
  tl_t: "まとめロット", tl_d: "大量購入する転売業者向けのロングテールまとめ。",
  follow: "フォロー", backTop: "トップへ戻る", theme: "テーマ", system: "システム", light: "ライト", dark: "ダーク", language: "言語",
  rulesEnglish: "公式ルールは英語版が正式です。翻訳は参考用です。",
  nf_t: "この名前はすでに失効しました。", nf_s: "お探しのページは見つかりません。", nf_home: "フロアに戻る" };

const ko: D = { myPoints: "내 포인트 & 프로필", nav_shot: "⏱ 샷클락", nav_market: "마켓", nav_upload: "업로드 및 평가", nav_bundles: "묶음", nav_dash: "대시보드", nav_give: "🎁 경품",
  beat: "시간을 이겨라", openMenu: "메뉴 열기", closeMenu: "메뉴 닫기",
  banner: "가격은 참고용 추정치이며 감정가가 아닙니다. 제안, 입찰, 구매는 시뮬레이션이며 실제 돈은 오가지 않습니다.",
  eb_have: "{b} 배지를 보유 중입니다.", eb_join: "무료 가입하고 {b} 배지 + 보너스 {n} {p} 받기.", eb_ends: "종료까지", eb_claim: "자리 잡기 →",
  live: "LIVE · 지금 만료되는 도메인", h1a: "도메인,", h1b: "시간과의 승부.",
  sub: "진짜 이름. 진짜 마감. 떨어지기 전에 팔리는 가격. SHOTCLOCK은 카운트다운 기반 라이브 급매 도메인 마켓입니다.",
  browse: "매물 보기", value: "내 도메인 평가",
  st_live: "라이브 도메인 및 묶음", st_floor: "최저가", st_expired: "이미 만료", st_expired_sub: "유예 / 복구 기간 (추정)", st_lots: "묶음", st_lots_sub: "급매 번들",
  run_t: "⏱ 곧 마감", run_s: "다음으로 0이 되는 도메인. 실시간 카운트다운.", full: "전체 보기 →",
  top_t: "보드 상위", top_s: "현재 가장 높은 추정 가격.", viewall: "모두 보기 →",
  s1t: "카운트다운", s1d: "모든 도메인에 만료·유예·복구 마감까지 실시간 카운트다운.",
  s2t: "팔리는 가격", s2d: "투명한 공식으로 가격대, 즉시 구매가, 즉시 담보 견적을 산정.",
  s3t: "급매 묶음", s3d: "관련 도메인을 묶어 대량 구매자와 리셀러에게.",
  s4t: "빠른 입찰", s4d: "시간이 끝나기 전에 즉시 구매, 입찰 또는 제안.",
  s5t: "거래 완료", s5d: "v0.01은 거래를 시뮬레이션합니다. 에스크로와 결제는 로드맵에 있습니다.",
  ib_t: "즉시 매입", ib_d: "갱신일 전에 처분해야 할 때를 위한 빠른 할인가.",
  ip_t: "즉시 담보", ip_d: "품질과 긴급도에 따라 도메인을 담보로 대출. v0.01은 견적만 제공.",
  tl_t: "벌크 묶음", tl_d: "대량 구매 리셀러를 위한 롱테일 번들.",
  follow: "팔로우", backTop: "맨 위로", theme: "테마", system: "시스템", light: "라이트", dark: "다크", language: "언어",
  rulesEnglish: "공식 규정은 영어본이 기준입니다. 번역은 참고용입니다.",
  nf_t: "이 도메인은 이미 만료됐어요.", nf_s: "찾는 페이지가 없습니다.", nf_home: "마켓으로 돌아가기" };

const zh: D = { myPoints: "我的积分和资料", nav_shot: "⏱ 倒计时", nav_market: "市场", nav_upload: "上传与估值", nav_bundles: "打包", nav_dash: "控制台", nav_give: "🎁 抽奖",
  beat: "挑战倒计时", openMenu: "打开菜单", closeMenu: "关闭菜单",
  banner: "价格为启发式估算，并非评估。报价、出价和购买均为模拟，不涉及真实资金。",
  eb_have: "你已获得 {b} 徽章。", eb_join: "免费加入，获得 {b} 徽章 + {n} 额外{p}。", eb_ends: "剩余", eb_claim: "抢占名额 →",
  live: "直播中 · 域名正在到期", h1a: "域名，", h1b: "争分夺秒。",
  sub: "真实域名，真实截止日，到期前低价速卖。SHOTCLOCK 是倒计时驱动的域名实时快卖平台。",
  browse: "浏览市场", value: "为我的域名估值",
  st_live: "在售域名与打包", st_floor: "最低价", st_expired: "已到期", st_expired_sub: "宽限期 / 赎回期（估）", st_lots: "打包", st_lots_sub: "快卖组合",
  run_t: "⏱ 即将到期", run_s: "下一批归零的域名，实时倒计时。", full: "完整倒计时 →",
  top_t: "榜单前列", top_s: "当前估价最高的域名。", viewall: "查看全部 →",
  s1t: "倒计时", s1d: "每个域名都有到期、宽限或赎回截止的实时倒计时。",
  s2t: "速卖定价", s2d: "透明算法给出价格区间、一口价和即时质押报价。",
  s3t: "快卖打包", s3d: "同类域名打包，面向批量买家和转售商。",
  s4t: "快速出价", s4d: "在时间结束前一口价购买、出价或报价。",
  s5t: "成交", s5d: "v0.01 为模拟交易，担保与支付功能在规划中。",
  ib_t: "即时收购", ib_d: "续费日前需要出手时的快速折扣价。",
  ip_t: "即时质押", ip_d: "按质量和紧急程度以域名抵押借款。v0.01 仅提供报价。",
  tl_t: "批量打包", tl_d: "面向批量采购转售商的长尾组合。",
  follow: "关注", backTop: "返回顶部", theme: "主题", system: "跟随系统", light: "浅色", dark: "深色", language: "语言",
  rulesEnglish: "正式规则以英文为准，译文仅供参考。",
  nf_t: "这个域名已经掉落。", nf_s: "你要找的页面不存在。", nf_home: "返回市场" };

const hi: D = { myPoints: "मेरे पॉइंट्स और प्रोफ़ाइल", nav_shot: "⏱ शॉट क्लॉक", nav_market: "मार्केटप्लेस", nav_upload: "अपलोड और वैल्यू", nav_bundles: "बंडल", nav_dash: "डैशबोर्ड", nav_give: "🎁 गिवअवे",
  beat: "घड़ी को हराओ", openMenu: "मेनू खोलें", closeMenu: "मेनू बंद करें",
  banner: "कीमतें अनुमानित हैं, मूल्यांकन नहीं। ऑफ़र, बोलियाँ और खरीदारी सिम्युलेटेड हैं, कोई पैसा नहीं जाता।",
  eb_have: "आपके पास {b} बैज है।", eb_join: "मुफ़्त जुड़ें और पाएँ {b} बैज + {n} बोनस {p}।", eb_ends: "खत्म होने में", eb_claim: "मेरी जगह पक्की करें →",
  live: "लाइव · डोमेन अभी एक्सपायर हो रहे हैं", h1a: "डोमेन", h1b: "घड़ी की दौड़ में।",
  sub: "असली नाम। असली डेडलाइन। गिरने से पहले बिकने वाली कीमत। SHOTCLOCK डोमेन के लिए लाइव, काउंटडाउन वाला क्विक-सेल फ़्लोर है।",
  browse: "फ़्लोर देखें", value: "मेरे डोमेन की वैल्यू",
  st_live: "लाइव नाम और लॉट", st_floor: "न्यूनतम कीमत", st_expired: "पहले ही एक्सपायर", st_expired_sub: "ग्रेस / रिडेम्पशन में (अनुमान)", st_lots: "लॉट", st_lots_sub: "क्विक-सेल बंडल",
  run_t: "⏱ सबसे पहले खत्म", run_s: "अगले नाम जो शून्य पर पहुँचेंगे। लाइव काउंटडाउन।", full: "पूरी शॉट क्लॉक →",
  top_t: "बोर्ड में सबसे ऊपर", top_s: "अभी फ़्लोर पर सबसे ऊँची अनुमानित कीमतें।", viewall: "सब देखें →",
  s1t: "घड़ी पर", s1d: "हर नाम पर एक्सपायरी, ग्रेस या रिडेम्पशन तक लाइव काउंटडाउन।",
  s2t: "बिकने वाली कीमत", s2d: "एक पारदर्शी फ़ॉर्मूला रेंज, तुरंत-खरीद कीमत और गिरवी कोट तय करता है।",
  s3t: "क्विक-सेल लॉट", s3d: "मिलते-जुलते नाम थोक खरीदारों और रीसेलर्स के लिए लॉट में।",
  s4t: "तेज़ बोली", s4d: "समय खत्म होने से पहले खरीदें, बोली लगाएँ या ऑफ़र दें।",
  s5t: "डील पक्की", s5d: "v0.01 डील को सिम्युलेट करता है। एस्क्रो और भुगतान रोडमैप पर हैं।",
  ib_t: "तुरंत खरीद", ib_d: "रिन्यूअल से पहले नाम बेचने के लिए तेज़, छूट वाली कीमत।",
  ip_t: "तुरंत गिरवी", ip_d: "गुणवत्ता और जल्दी के आधार पर नाम पर उधार। v0.01 में सिर्फ़ कोट।",
  tl_t: "थोक लॉट", tl_d: "थोक में खरीदने वाले रीसेलर्स के लिए लॉन्ग-टेल बंडल।",
  follow: "फ़ॉलो करें", backTop: "ऊपर जाएँ", theme: "थीम", system: "सिस्टम", light: "लाइट", dark: "डार्क", language: "भाषा",
  rulesEnglish: "आधिकारिक नियम अंग्रेज़ी में हैं। अनुवाद केवल सुविधा के लिए है।",
  nf_t: "यह नाम पहले ही गिर चुका है।", nf_s: "आप जो पेज ढूँढ रहे हैं वह यहाँ नहीं है।", nf_home: "फ़्लोर पर लौटें" };

const ar: D = { myPoints: "نقاطي وملفي", nav_shot: "⏱ ساعة التصويب", nav_market: "السوق", nav_upload: "رفع وتقييم", nav_bundles: "الحزم", nav_dash: "لوحة التحكم", nav_give: "🎁 السحب",
  beat: "اسبق الوقت", openMenu: "فتح القائمة", closeMenu: "إغلاق القائمة",
  banner: "الأسعار تقديرات استرشادية وليست تقييمات رسمية. العروض والمزايدات والمشتريات محاكاة ولا تنتقل أي أموال.",
  eb_have: "لديك شارة {b}.", eb_join: "انضم مجانًا واحصل على شارة {b} + {n} {p} إضافية.", eb_ends: "ينتهي خلال", eb_claim: "احجز مكاني ←",
  live: "مباشر · نطاقات تنتهي الآن", h1a: "النطاقات في", h1b: "سباق مع الوقت.",
  sub: "أسماء حقيقية. مواعيد نهائية حقيقية. أسعار للبيع قبل السقوط. SHOTCLOCK هو سوق البيع السريع المباشر بالعد التنازلي لتجار النطاقات.",
  browse: "تصفح السوق", value: "قيّم نطاقاتي",
  st_live: "نطاقات وحزم مباشرة", st_floor: "أدنى سعر", st_expired: "منتهية بالفعل", st_expired_sub: "في فترة السماح / الاسترداد (تقديري)", st_lots: "الحزم", st_lots_sub: "حزم بيع سريع",
  run_t: "⏱ الأقرب للانتهاء", run_s: "النطاقات التالية التي ستصل إلى الصفر. عد تنازلي مباشر.", full: "الساعة الكاملة ←",
  top_t: "أعلى اللوحة", top_s: "أعلى الأسعار التقديرية في السوق الآن.", viewall: "عرض الكل ←",
  s1t: "على الساعة", s1d: "لكل نطاق عد تنازلي مباشر حتى الانتهاء أو فترة السماح أو الاسترداد.",
  s2t: "سعر للبيع", s2d: "معادلة شفافة تحدد نطاقًا سعريًا وسعر شراء فوري وعرض رهن فوري.",
  s3t: "حزم بيع سريع", s3d: "تُجمع عائلات النطاقات في حزم للمشترين بالجملة والموزعين.",
  s4t: "زايد بسرعة", s4d: "اشترِ الآن أو زايد أو قدّم عرضًا قبل نفاد الوقت.",
  s5t: "أتمم الصفقة", s5d: "الإصدار v0.01 يحاكي الصفقة. الضمان والمدفوعات ضمن الخطة.",
  ib_t: "شراء فوري", ib_d: "سعر سريع مخفض عندما يجب بيع النطاقات قبل موعد التجديد.",
  ip_t: "رهن فوري", ip_d: "اقترض مقابل نطاق حسب جودته ومدى الاستعجال. عروض أسعار فقط في v0.01.",
  tl_t: "حزم بالجملة", tl_d: "حزم من الذيل الطويل للموزعين الذين يشترون بالجملة.",
  follow: "تابع", backTop: "العودة للأعلى", theme: "المظهر", system: "النظام", light: "فاتح", dark: "داكن", language: "اللغة",
  rulesEnglish: "القواعد الرسمية باللغة الإنجليزية. الترجمات للتسهيل فقط.",
  nf_t: "هذا النطاق سقط بالفعل.", nf_s: "الصفحة التي تبحث عنها غير موجودة.", nf_home: "العودة إلى السوق" };

const DICTS: Record<string, D> = { en, es, pt, fr, de, it, ja, ko, zh, hi, ar };
const norm = (l: string): Lang => (LANGS.some((x) => x[0] === l) ? (l as Lang) : "en");

export function useT() {
  const { lang: raw } = usePlayer();
  const lang = norm(raw);
  const t = useCallback((k: Key, vars?: Record<string, string | number>) => {
    let s = DICTS[lang][k] ?? en[k];
    if (vars) for (const [a, b] of Object.entries(vars)) s = s.replace(`{${a}}`, String(b));
    return s;
  }, [lang]);
  return { t, lang };
}

/** Syncs <html lang/dir>, cookie, and first-visit auto-detect from navigator.language. */
export function useLangSync(setLang: (l: string) => void) {
  const { lang: raw } = usePlayer();
  useEffect(() => {
    if (!localStorage.getItem("sc.lang.chosen")) {
      const c = document.cookie.match(/(?:^|; )lang=(\w+)/)?.[1];
      const nav = (navigator.language || "en").slice(0, 2);
      const pick = c && DICTS[c] ? c : DICTS[nav] ? nav : "en";
      localStorage.setItem("sc.lang.chosen", "1");
      if (pick !== raw) setLang(pick);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const l = norm(raw);
    document.documentElement.lang = l === "zh" ? "zh-Hans" : l === "pt" ? "pt-BR" : l;
    document.documentElement.dir = RTL.has(l) ? "rtl" : "ltr";
    document.cookie = `lang=${l};path=/;max-age=31536000;samesite=lax`;
  }, [raw]);
}
