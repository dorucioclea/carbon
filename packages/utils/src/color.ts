import { getBucket } from "./hash";

const cache: Record<string, number> = {};

const colors = [
  { background: "#264653", color: "#ffffff" },
  { background: "#2a9d8f", color: "#ffffff" },
  { background: "#4ff38c", color: "#000000" },
  { background: "#f4a261", color: "#38210f" },
  { background: "#e76f51", color: "#ffffff" },
  { background: "#4ff38c", color: "#000000" },
  { background: "#219ebc", color: "#ffffff" },
  { background: "#3a86ff", color: "#ffffff" },
  { background: "#8338ec", color: "#ffffff" },
  { background: "#ffadad", color: "#000000" },
  { background: "#ffd6a5", color: "#000000" },
  { background: "#4f46e5", color: "#ffffff" },
  { background: "#caffbf", color: "#000000" },
  { background: "#9bf6ff", color: "#000000" },
  { background: "#a0c4ff", color: "#000000" },
  { background: "#ffc6ff", color: "#000000" },
];

export function getColor(name: string) {
  if (cache[name]) return colors[cache[name]!];
  const hash = getBucket(name, colors.length);
  cache[name] = hash;
  return colors[hash];
}
