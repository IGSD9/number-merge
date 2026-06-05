import { posToKey } from "@/lib/game/board";
import { GRID_COLS, GRID_ROWS, type MergePath } from "@/types/game";

interface MergePathOverlayProps {
  path: MergePath;
  cellSize: number;
  boardPadding: number;
}

export function MergePathOverlay({
  path,
  cellSize,
  boardPadding,
}: MergePathOverlayProps) {
  if (path.positions.length < 2) return null;

  const points = path.positions
    .map((pos) => {
      const cx = boardPadding + pos.col * cellSize + cellSize / 2;
      const cy = boardPadding + pos.row * cellSize + cellSize / 2;
      return `${cx},${cy}`;
    })
    .join(" ");

  const width = boardPadding * 2 + cellSize * GRID_COLS;
  const height = boardPadding * 2 + cellSize * GRID_ROWS;

  return (
    <svg
      className="pointer-events-none absolute inset-0"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      <polyline
        points={points}
        fill="none"
        stroke="white"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.8}
      />
      {path.positions.map((pos) => {
        const cx = boardPadding + pos.col * cellSize + cellSize / 2;
        const cy = boardPadding + pos.row * cellSize + cellSize / 2;
        const isLast = posToKey(pos) === posToKey(path.positions[path.positions.length - 1]);

        return (
          <circle
            key={posToKey(pos)}
            cx={cx}
            cy={cy}
            r={isLast ? 6 : 4}
            fill={isLast ? "#facc15" : "white"}
            opacity={0.9}
          />
        );
      })}
    </svg>
  );
}
