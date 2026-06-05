import { getTileAt, isAdjacent, posToKey } from "@/lib/game/board";
import { canAddToPath, isValidMergePath } from "@/lib/game/pathValidator";
import { DIRECTIONS, GRID_COLS, GRID_ROWS, type Board, type Tile } from "@/types/game";

function findValidPathFrom(path: Tile[], board: Board, visited: Set<string>): boolean {
  if (path.length >= 2 && isValidMergePath(path)) {
    return true;
  }

  const lastTile = path[path.length - 1];

  for (const dir of DIRECTIONS) {
    const nextPos = {
      row: lastTile.position.row + dir.row,
      col: lastTile.position.col + dir.col,
    };
    const key = posToKey(nextPos);

    if (visited.has(key)) continue;

    const nextTile = getTileAt(board, nextPos);
    if (!nextTile) continue;
    if (!isAdjacent(lastTile.position, nextPos)) continue;
    if (!canAddToPath(path, nextTile)) continue;

    visited.add(key);
    if (findValidPathFrom([...path, nextTile], board, visited)) {
      return true;
    }
    visited.delete(key);
  }

  return false;
}

export function hasValidMove(board: Board): boolean {
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      const tile = board[row][col];
      if (!tile) continue;

      const visited = new Set<string>([posToKey(tile.position)]);
      if (findValidPathFrom([tile], board, visited)) {
        return true;
      }
    }
  }

  return false;
}

export function checkGameOver(board: Board): boolean {
  return !hasValidMove(board);
}
