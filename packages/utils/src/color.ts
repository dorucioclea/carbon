import { getBucket } from "./hash";

const cache: Record<string, number> = {};

const colors = [
  { background: "#264653", color: "#ffffff" },
  { background: "#2a9d8f", color: "#ffffff" },
  { background: "#4ff38c", color: "#000000" },
  { background: "#f4a261", color: "#ffffff" },
  { background: "#e76f51", color: "#ffffff" },
  { background: "#8ecae6", color: "#ffffff" },
  { background: "#219ebc", color: "#ffffff" },
  { background: "#3a86ff", color: "#ffffff" },
  { background: "#ff006e", color: "#ffffff" },
  { background: "#8338ec", color: "#ffffff" },
];

export function getColor(name: string) {
  if (cache[name]) return colors[cache[name]];
  const hash = getBucket(name, colors.length);
  cache[name] = hash;
  return colors[hash];
}
