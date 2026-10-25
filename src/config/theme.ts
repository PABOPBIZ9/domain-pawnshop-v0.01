import type { ThemeConfig } from "@/kit/theme";

/**
 * SHOTCLOCK owns ONE color: Volt Lime. Base: sapphire → midnight-indigo starry sky (no pure black).
 * Metals (chrome/platinum cards + chips, champagne/rose-gold OG, ruby urgency) come from kit/theme.ts.
 */
export const theme: ThemeConfig = {
  signature: "#c6ff3d", // SHOTCLOCK Volt Lime (10.8:1 on panels)
  signatureInk: "#0b1236", // midnight ink on lime (15.4:1)
  preset: "sapphire-night",
};
