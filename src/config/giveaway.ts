/**
 * SHOTCLOCK Launch Giveaway. The page, hero numbers and Official Rules are generated from this file.
 * EVERY PRIZE BELOW IS A PLACEHOLDER: no prize has been committed. rulesReviewed stays false
 * (DEMO warning shows) until the rules are legally reviewed.
 */
import type { GiveawayConfig } from "@/kit/types";
import { HANDLE } from "./social";

export const giveaway: GiveawayConfig = {
  id: "shotclock-launch-26",
  name: "SHOTCLOCK Launch Giveaway",
  sponsor: "DOU DIGITAL", // TODO: confirm legal sponsor entity + address
  sponsorEmail: "TODO-contact-email", // TODO: set the real contact inbox
  siteName: "SHOTCLOCK player profile",
  startsAt: "2026-10-24T00:00:00-04:00", // TODO: confirm start
  endsAt: "2026-11-26T23:59:00-05:00", // TODO: confirm end (11:59 PM ET)
  drawWithinDays: 7,
  claimDays: 7,
  rulesReviewed: false,
  placeholderNotice: "DEMO / PLACEHOLDER: these prizes and rules are not final and have not been legally reviewed. No prize is committed yet.",
  eligibility: {
    minAge: 18,
    worldwide: true,
    excludedCountries: { IT: "Italy", BR: "Brazil", CN: "China (mainland)", CU: "Cuba", IR: "Iran", KP: "North Korea", SY: "Syria", RU: "Russia", BY: "Belarus" },
    excludedRegions: { "CA-QC": "Province of Quebec (Canada)", "UA-43": "Crimea", "UA-40": "Sevastopol", "UA-14": "Donetsk region", "UA-09": "Luhansk region" },
    regionRequired: {
      CA: { "CA-AB": "Alberta", "CA-BC": "British Columbia", "CA-MB": "Manitoba", "CA-NB": "New Brunswick", "CA-NL": "Newfoundland and Labrador", "CA-NS": "Nova Scotia", "CA-NT": "Northwest Territories", "CA-NU": "Nunavut", "CA-ON": "Ontario", "CA-PE": "Prince Edward Island", "CA-QC": "Quebec", "CA-SK": "Saskatchewan", "CA-YT": "Yukon" },
      UA: { "UA-43": "Crimea", "UA-40": "Sevastopol", "UA-14": "Donetsk region", "UA-09": "Luhansk region", "UA-OTHER": "Another region of Ukraine" },
    },
    otherExcluded: "any jurisdiction where registration, bonding or a local permit would be required to run this promotion",
    skillQuestionCountries: ["CA"],
  },
  ways: [
    { id: "account", title: "Claim your player spot", value: "+1", points: 1, detail: "Join free and tap Enter.", verification: "auto" },
    { id: "x", title: `Follow @${HANDLE} on X`, value: "+2", points: 2, detail: "Tap Follow, we count the click.", verification: "self-reported", href: `https://x.com/${HANDLE}`, external: true },
    { id: "tiktok", title: `Follow @${HANDLE} on TikTok`, value: "+2", points: 2, detail: "Tap Follow, we count the click.", verification: "self-reported", href: `https://www.tiktok.com/@${HANDLE}`, external: true },
    { id: "instagram", title: `Follow @${HANDLE} on Instagram`, value: "+2", points: 2, detail: "Tap Follow, we count the click.", verification: "self-reported", href: `https://www.instagram.com/${HANDLE}`, external: true },
    { id: "youtube", title: `Subscribe on YouTube`, value: "+2", points: 2, detail: "Tap Subscribe, we count the click.", verification: "self-reported", href: `https://www.youtube.com/@${HANDLE}`, external: true },
    { id: "share", title: "Share SHOTCLOCK", value: "+1/day", points: 1, perDay: true, detail: "Share the site once a day.", verification: "self-reported" },
  ],
  referralCap: 0,
  questDailyCap: 0,
  participant: { badge: "SHOTCLOCK Launch '26", emoji: "⏱", points: 100, currency: "CP" },
  prizes: [
    { place: "1st", title: "TODO grand prize", detail: "Placeholder. Set the real prize, quantity and ARV.", arv: 0, qty: 1, tier: "grand", art: "🏆", placeholder: true },
    { place: "2nd–3rd", title: "TODO runner-up prize", detail: "Placeholder.", arv: 0, qty: 2, tier: "mid", art: "🎁", placeholder: true },
    { place: "Bonus", title: "TODO bonus prize", detail: "Placeholder.", arv: 0, qty: 5, tier: "bonus", art: "⏱", placeholder: true },
  ],
  // TODO: optional creator prize (Clip Crown style): best clip about SHOTCLOCK, judged on criteria in the rules.
  notAffiliated: ["X", "TikTok", "Instagram", "YouTube", "GoDaddy", "Namecheap", "Dynadot", "Unstoppable Domains"],
  faq: [
    { q: "Who can enter?", a: "Anyone 18+ (or the age of majority where you live) in an eligible country. A few places are excluded by law; see the rules." },
    { q: "Do bids, offers or buys add entries?", a: "No. Marketplace activity is simulated in v0.01 and never adds entries. No purchase necessary." },
    { q: "What are the prizes?", a: "Prizes are being finalized. Everything shown is a placeholder until announced." },
    { q: "How are winners picked?", a: "A random draw from all eligible entries after the giveaway ends. Where required (e.g. Canada), winners answer a math skill question." },
  ],
};
