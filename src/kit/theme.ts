/**
 * Luxe theme presets. Each brand picks ONE signature color + ONE base preset.
 * Rule: no pure-black dark mode. Every preset is a rich, deep gradient (no #000).
 * Contrast (WCAG AA, checked): text and mute on panel/base ≥ 4.5:1, signature on panel ≥ 4.5:1 for the
 * shipped signatures, chip ink on chrome ≥ 7:1, white on ruby ≥ 4.5:1, ink on champagne ≥ 7:1.
 */
export type LuxePreset = "sapphire-night" | "ruby-royale" | "rose-gold" | "platinum" | "phoenix";

type Palette = {
  /** Background gradient stops: top → middle → bottom. */
  base: [string, string, string];
  panel: string;
  panel2: string;
  text: string;
  mute: string;
  /** Ruby used for urgency text on this base (fills always use the ruby gradient). */
  rubyText: string;
  stars: number; // 0–1 star opacity
};

export const PRESETS: Record<LuxePreset, Palette> = {
  "sapphire-night": { base: ["#10225e", "#161452", "#0b1038"], panel: "#18245c", panel2: "#1f2d6c", text: "#f1f4ff", mute: "#b3bde6", rubyText: "#ff7a93", stars: 0.9 },
  "ruby-royale": { base: ["#4a0a1f", "#2e0a24", "#1a0b26"], panel: "#3e1027", panel2: "#4c1632", text: "#fff3f6", mute: "#e8bccb", rubyText: "#ff8aa0", stars: 0.6 },
  "rose-gold": { base: ["#4a2733", "#33203a", "#21172e"], panel: "#3d2636", panel2: "#4a2f42", text: "#fff6f3", mute: "#ecccd2", rubyText: "#ff8aa0", stars: 0.55 },
  platinum: { base: ["#343d52", "#262d40", "#1b2132"], panel: "#2e3649", panel2: "#384157", text: "#f5f7fb", mute: "#c4ccdb", rubyText: "#ff9cae", stars: 0.45 },
  phoenix: { base: ["#5a1d08", "#3e0b20", "#200b2c"], panel: "#43172a", panel2: "#521d33", text: "#fff5ef", mute: "#f2c6b0", rubyText: "#ff8aa0", stars: 0.7 },
};

/** Shared luxe metals (same on every brand so OG/early-bird/urgency read the same everywhere). */
export const METALS = {
  champagne: "#f4dca8",
  roseGold: "#f0b2a1",
  chrome: "#e7ebf5",
  platinum: "#c9d0e2",
  ruby: "#b0123a",
  rubyHi: "#e0285a",
  ink: "#0d1640", // text on chrome / metal chips
  champagneInk: "#2a1420", // text on champagne / rose-gold fills
};

export type ThemeConfig = {
  /** The ONE color the brand owns (Snapchat-yellow style). Used for primary CTAs, focus rings and highlights. */
  signature: string;
  /** Text color on top of the signature (pick dark for light signatures). */
  signatureInk: string;
  preset: LuxePreset;
};

const hexToRgb = (h: string) => { const x = h.replace("#", ""); return [0, 2, 4].map((i) => parseInt(x.slice(i, i + 2), 16)).join(" "); };

/** CSS custom properties for <html style>. All kit + app colors derive from these. */
export function themeVars(t: ThemeConfig): Record<string, string> {
  const p = PRESETS[t.preset];
  return {
    "--lx-sig": t.signature,
    "--lx-sig-rgb": hexToRgb(t.signature),
    "--lx-sig-ink": t.signatureInk,
    "--lx-base-0": p.base[0],
    "--lx-base-1": p.base[1],
    "--lx-base-2": p.base[2],
    "--lx-panel": p.panel,
    "--lx-panel2": p.panel2,
    "--lx-text": p.text,
    "--lx-mute": p.mute,
    "--lx-ruby-text": p.rubyText,
    "--lx-stars": String(p.stars),
    "--lx-champagne": METALS.champagne,
    "--lx-rose": METALS.roseGold,
    "--lx-chrome": METALS.chrome,
    "--lx-platinum": METALS.platinum,
    "--lx-ruby": METALS.ruby,
    "--lx-ruby-hi": METALS.rubyHi,
    "--lx-ink": METALS.ink,
    "--lx-champagne-ink": METALS.champagneInk,
  };
}
