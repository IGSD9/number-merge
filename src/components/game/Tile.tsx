import type { Tile as TileType, TileValue } from "@/types/game";

interface TileProps {
  tile: TileType;
  isSelected?: boolean;
  isMergeTarget?: boolean;
  isGhost?: boolean;
  size?: "normal" | "small";
}

const TILE_COLORS: Record<number, { bg: string; text: string }> = {
  2: { bg: "bg-slate-200", text: "text-slate-800" },
  4: { bg: "bg-blue-200", text: "text-blue-900" },
  8: { bg: "bg-green-300", text: "text-green-900" },
  16: { bg: "bg-yellow-300", text: "text-yellow-900" },
  32: { bg: "bg-orange-300", text: "text-orange-900" },
  64: { bg: "bg-red-300", text: "text-red-900" },
  128: { bg: "bg-purple-300", text: "text-purple-900" },
  256: { bg: "bg-pink-300", text: "text-pink-900" },
};

function getTileColors(value: TileValue) {
  if (value >= 512) {
    return { bg: "bg-indigo-400", text: "text-white" };
  }
  return TILE_COLORS[value] ?? { bg: "bg-indigo-400", text: "text-white" };
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
        "flex h-full w-full items-center justify-center rounded-lg font-bold transition-transform",
        colors.bg,
        colors.text,
        size === "small" ? "text-sm" : "",
        isGhost ? "opacity-40 ring-1 ring-white/50" : "",
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
