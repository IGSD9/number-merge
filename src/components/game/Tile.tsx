import { memo } from "react";
import { isMilestoneValue } from "@/lib/game/milestone";
import type { Tile as TileType, TileValue } from "@/types/game";

interface TileProps {
  tile: TileType;
  isSelected?: boolean;
  isMergeTarget?: boolean;
  isGhost?: boolean;
  size?: "normal" | "small";
  celebrate?: boolean;
}

interface TileColorStyle {
  bg: string;
  text: string;
  ring: string;
}

const TILE_COLORS: Partial<Record<TileValue, TileColorStyle>> = {
  2: { bg: "bg-slate-300", text: "text-slate-900", ring: "ring-slate-500/60" },
  4: { bg: "bg-sky-300", text: "text-sky-950", ring: "ring-sky-500/70" },
  8: { bg: "bg-emerald-400", text: "text-emerald-950", ring: "ring-emerald-600/70" },
  16: { bg: "bg-lime-400", text: "text-lime-950", ring: "ring-lime-600/70" },
  32: { bg: "bg-amber-400", text: "text-amber-950", ring: "ring-amber-600/70" },
  64: { bg: "bg-orange-500", text: "text-orange-950", ring: "ring-orange-700/70" },
  128: { bg: "bg-rose-400", text: "text-rose-950", ring: "ring-rose-600/70" },
  256: { bg: "bg-fuchsia-500", text: "text-white", ring: "ring-fuchsia-700/70" },
  512: { bg: "bg-violet-600", text: "text-white", ring: "ring-violet-800/70" },
  1024: { bg: "bg-cyan-500", text: "text-cyan-950", ring: "ring-cyan-700/70" },
  2048: { bg: "bg-yellow-400", text: "text-yellow-950", ring: "ring-yellow-600/80" },
};

const HIGH_VALUE_COLORS: TileColorStyle[] = [
  { bg: "bg-red-500", text: "text-white", ring: "ring-red-700/70" },
  { bg: "bg-pink-600", text: "text-white", ring: "ring-pink-800/70" },
  { bg: "bg-indigo-600", text: "text-white", ring: "ring-indigo-800/70" },
  { bg: "bg-teal-500", text: "text-teal-950", ring: "ring-teal-700/70" },
];

const FALLBACK_COLORS: TileColorStyle = {
  bg: "bg-gray-500",
  text: "text-white",
  ring: "ring-gray-600/70",
};

function getTileColors(value: number): TileColorStyle {
  const known = TILE_COLORS[value as TileValue];
  if (known) return known;

  if (value > 2048 && value % 2 === 0) {
    const exponent = Math.log2(value);
    if (Number.isFinite(exponent)) {
      return HIGH_VALUE_COLORS[Math.floor(exponent) % HIGH_VALUE_COLORS.length];
    }
  }

  return FALLBACK_COLORS;
}

function getFontSize(value: number, size: "normal" | "small"): string {
  if (size === "small") return value >= 1000 ? "text-xs" : "text-sm";
  if (value >= 10000) return "text-xs";
  if (value >= 1024) return "text-base";
  if (value >= 128) return "text-lg";
  return "text-xl";
}

export const Tile = memo(function Tile({
  tile,
  isSelected = false,
  isMergeTarget = false,
  isGhost = false,
  size = "normal",
  celebrate = false,
}: TileProps) {
  const colors = getTileColors(tile.value);
  const isMilestone = !isGhost && isMilestoneValue(tile.value);

  return (
    <div
      className={[
        "relative flex h-full w-full items-center justify-center rounded-lg font-bold shadow-sm ring-1",
        celebrate && isMilestone ? "animate-milestone-pop" : "",
        colors.bg,
        colors.text,
        colors.ring,
        getFontSize(tile.value, size),
        isGhost ? "opacity-40 ring-white/50" : "",
        isSelected ? "scale-105 ring-2 ring-white" : "",
        isMergeTarget ? "ring-2 ring-yellow-300" : "",
        isMilestone ? "animate-milestone-glow ring-yellow-300/70" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {isMilestone && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-br from-yellow-200/25 via-transparent to-amber-300/20"
        />
      )}
      <span className={isMilestone ? "relative z-10" : undefined}>{tile.value}</span>
    </div>
  );
});
