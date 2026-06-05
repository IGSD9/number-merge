import { cloneBoard } from "@/lib/game/board";
import { isValidMergePath } from "@/lib/game/pathValidator";
import type { Board, MergePath, Tile, TileValue } from "@/types/game";

export function calculateMergedValue(tiles: Tile[]): TileValue {
  const sum = tiles.reduce((total, tile) => total + tile.value, 0);
  let power = 2;

  while (power < sum) {
    power *= 2;
  }

  return power as TileValue;
}

export function executeMerge(
  board: Board,
  path: MergePath,
): { newBoard: Board; mergedValue: TileValue; scoreGain: number } {
  if (!isValidMergePath(path.tiles)) {
    throw new Error("Invalid merge path");
  }

  const newBoard = cloneBoard(board);
  const mergedValue = calculateMergedValue(path.tiles);
  const targetPos = path.positions[path.positions.length - 1];

  for (const pos of path.positions) {
    if (pos.row !== targetPos.row || pos.col !== targetPos.col) {
      newBoard[pos.row][pos.col] = null;
    }
  }

  newBoard[targetPos.row][targetPos.col] = {
    id: crypto.randomUUID(),
    value: mergedValue,
    position: { ...targetPos },
  };

  return {
    newBoard,
    mergedValue,
    scoreGain: mergedValue,
  };
}
