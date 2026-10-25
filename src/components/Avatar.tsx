import { avatarSpec } from "@/lib/identity";

export function Avatar({ seed, size = 64, ring }: { seed: number; size?: number; ring?: string }) {
  const a = avatarSpec(seed);
  const id = `g${seed}`;
  const shapes = [
    "M50 8 C78 8 92 30 92 52 C92 78 74 92 50 92 C26 92 8 78 8 52 C8 30 22 8 50 8Z",
    "M50 6 L88 28 L88 72 L50 94 L12 72 L12 28Z",
    "M30 14 C40 4 60 4 70 14 C90 14 96 34 90 50 C98 70 84 92 62 88 C52 98 34 96 28 86 C8 84 2 62 12 50 C4 32 14 14 30 14Z",
  ];
  const eyes = [
    <g key="e0"><circle cx="37" cy="45" r="6" fill="#111" /><circle cx="63" cy="45" r="6" fill="#111" /></g>,
    <g key="e1"><rect x="30" y="40" width="14" height="6" rx="3" fill="#111" /><rect x="56" y="40" width="14" height="6" rx="3" fill="#111" /></g>,
    <g key="e2"><circle cx="37" cy="45" r="8" fill="#fff" /><circle cx="63" cy="45" r="8" fill="#fff" /><circle cx="39" cy="46" r="4" fill="#111" /><circle cx="65" cy="46" r="4" fill="#111" /></g>,
    <g key="e3"><path d="M30 46 Q37 38 44 46" stroke="#111" strokeWidth="4" fill="none" /><path d="M56 46 Q63 38 70 46" stroke="#111" strokeWidth="4" fill="none" /></g>,
  ];
  const mouths = [
    <path key="m0" d="M38 64 Q50 74 62 64" stroke="#111" strokeWidth="4" fill="none" strokeLinecap="round" />,
    <ellipse key="m1" cx="50" cy="66" rx="7" ry="5" fill="#111" />,
    <path key="m2" d="M36 64 H64" stroke="#111" strokeWidth="4" strokeLinecap="round" />,
    <path key="m3" d="M38 62 Q50 78 62 62 Z" fill="#111" />,
  ];
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="avatar"
      style={{ borderRadius: "50%", boxShadow: ring ? `0 0 0 3px ${ring}` : undefined, background: "#0003" }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={a.c1} />
          <stop offset="1" stopColor={a.c2} />
        </linearGradient>
      </defs>
      <g transform={`rotate(${a.rot} 50 50)`}>
        <path d={shapes[a.shape]} fill={`url(#${id})`} />
        {eyes[a.eyes]}
        {mouths[a.mouth]}
      </g>
    </svg>
  );
}

