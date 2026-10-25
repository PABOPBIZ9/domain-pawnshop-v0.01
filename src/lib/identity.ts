import { mulberry } from "./rng";

const ADJ = ["Cosmic","Turbo","Sneaky","Golden","Fuzzy","Mighty","Lucky","Neon","Salty","Breezy","Chonky","Zesty","Sleepy","Wild","Crispy","Jolly","Pixel","Rowdy","Swift","Spicy","Frosty","Bouncy","Glitchy","Velvet"];
const NOUN = ["Otter","Puck","Noodle","Falcon","Taco","Panda","Comet","Pickle","Yeti","Waffle","Gecko","Rocket","Mango","Badger","Sushi","Kraken","Pretzel","Llama","Biscuit","Narwhal","Dumpling","Ferret","Nacho","Moose"];

export function funName(seed: number): string {
  const r = mulberry(seed);
  return `${ADJ[Math.floor(r() * ADJ.length)]} ${NOUN[Math.floor(r() * NOUN.length)]}`;
}

export function handleFromName(name: string, n: number): string {
  return `${name.toLowerCase().replace(/[^a-z0-9]+/g, "")}${n}`.slice(0, 20);
}

const PALETTES = [
  ["#7c5cff", "#2ee6a8"], ["#ff4d8d", "#ffd23f"], ["#00c2ff", "#7c5cff"], ["#ff9a3d", "#ff4d2e"],
  ["#2ee6a8", "#00c2ff"], ["#ffd23f", "#2ee6a8"], ["#e8457a", "#8b5cf6"], ["#35d6c4", "#ffd23f"],
];

export type AvatarSpec = { c1: string; c2: string; eyes: number; mouth: number; shape: number; rot: number };

export function avatarSpec(seed: number): AvatarSpec {
  const r = mulberry(seed ^ 0x9e3779b9);
  const [c1, c2] = PALETTES[Math.floor(r() * PALETTES.length)];
  return { c1, c2, eyes: Math.floor(r() * 4), mouth: Math.floor(r() * 4), shape: Math.floor(r() * 3), rot: Math.floor(r() * 40) - 20 };
}

export const newSeed = () => Math.floor(Math.random() * 2 ** 31);
