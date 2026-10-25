import { ICONS } from "@/lib/social-icons";
import type { Platform } from "@/lib/socials";

export function SocialIcon({ p, size = 18 }: { p: Platform; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={ICONS[p].path} />
    </svg>
  );
}
