export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "AI & Tech": ["ai", "bot", "byte", "cloud", "code", "cyber", "data", "dev", "tech", "robot", "logic", "node", "pixel", "app", "web", "smart", "mind", "brain"],
  "Crypto & Web3": ["crypto", "coin", "token", "chain", "block", "nft", "dao", "defi", "eth", "sol", "wallet", "mint", "degen", "meta", "hash", "swap", "pump", "moon"],
  Finance: ["bank", "cash", "loan", "lend", "fund", "pay", "money", "trade", "stock", "wealth", "tax", "invest", "pawn", "dollar", "earn", "credit"],
  Cannabis: ["weed", "ganja", "kush", "hemp", "bud", "cbd", "thc", "leaf", "dank", "420"],
  Health: ["health", "fit", "gym", "yoga", "cure", "heal", "vita", "care", "doc", "med", "clinic"],
  Gaming: ["game", "play", "quest", "ninja", "gg", "clan", "arena", "esport", "level", "loot"],
  "Real Estate": ["home", "house", "land", "villa", "rent", "estate", "realty", "roof", "yard"],
  "Food & Drink": ["food", "pizza", "chef", "cafe", "eat", "meal", "wine", "beer", "tea", "juice", "kitchen", "bake", "sushi"],
  Travel: ["travel", "trip", "tour", "fly", "jet", "hotel", "beach", "sail"],
};

export const CATEGORIES = [...Object.keys(CATEGORY_KEYWORDS), "Numeric", "Short (≤4)", "Brandable", "Other"];

export function categorize(label: string, tld: string): string {
  const l = label.toLowerCase();
  if (/^\d+$/.test(l)) return "Numeric";
  if (["crypto", "nft", "wallet", "x", "eth", "dao", "bitcoin", "blockchain"].includes(tld)) return "Crypto & Web3";
  if (tld === "ai") return "AI & Tech";
  for (const [cat, kws] of Object.entries(CATEGORY_KEYWORDS)) {
    if (kws.some((k) => (k.length <= 3 ? l === k || l.startsWith(k) || l.endsWith(k) : l.includes(k)))) return cat;
  }
  if (l.length <= 4) return "Short (≤4)";
  return isPronounceable(l) ? "Brandable" : "Other";
}

export function isPronounceable(label: string): boolean {
  const l = label.toLowerCase().replace(/[^a-z]/g, "");
  if (l.length < 3 || l.length > 10) return false;
  const vowels = (l.match(/[aeiouy]/g) || []).length / l.length;
  if (vowels < 0.25 || vowels > 0.65) return false;
  return !/[^aeiouy]{4,}/.test(l) && !/[aeiou]{3,}/.test(l);
}

export type PriceTier = "Floor" | "Mid" | "Premium" | "Grail";
export const PRICE_TIERS: PriceTier[] = ["Floor", "Mid", "Premium", "Grail"];

export function priceTier(value: number): PriceTier {
  if (value < 50) return "Floor";
  if (value < 500) return "Mid";
  if (value < 5000) return "Premium";
  return "Grail";
}

export const TIER_LABEL: Record<PriceTier, string> = {
  Floor: "Floor (< $50)",
  Mid: "Mid ($50–$500)",
  Premium: "Premium ($500–$5k)",
  Grail: "Grail ($5k+)",
};
