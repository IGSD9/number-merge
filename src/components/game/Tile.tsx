import type { Tile as TileType, TileValue } from "@/types/game";

interface TileProps {
  tile: TileType;
  isSelected?: boolean;
  isMergeTarget?: boolean;
  isGhost?: boolean;
  size?: "normal" | "small";
}

interface TileColorStyle {
  bg: string;
  text: string;
  ring: string;
}

const TILE_COLORS: Record<TileValue, TileColorStyle> = {
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

function getTileColors(value: TileValue): TileColorStyle {
  return TILE_COLORS[value];
}

function getFontSize(value: TileValue, size: "normal" | "small"): string {
  if (size === "small") return "text-sm";
  if (value >= 1024) return "text-base";
  if (value >= 128) return "text-lg";
  return "text-xl";
}

export function Tile({
  tile,
  isSelected = false,
  isMergeTarget = false,
  isGhost = false,
  size = "normal",
}: TileProps) {
  const colors = getTileColors(tile.value);

  return (
    <div
      className={[
        "flex h-full w-full items-center justify-center rounded-lg font-bold shadow-sm ring-1 transition-transform",
        colors.bg,
        colors.text,
        colors.ring,
        getFontSize(tile.value, size),
        isGhost ? "opacity-40 ring-white/50" : "",
        isSelected ? "scale-105 ring-2 ring-white" : "",
        isMergeTarget ? "ring-2 ring-yellow-300" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {tile.value}
    </div>
  );
}
