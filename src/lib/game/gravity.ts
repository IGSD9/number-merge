import { cloneBoard } from "@/lib/game/board";
import { GRID_COLS, GRID_ROWS, type Board } from "@/types/game";

/** マージ後: 各列でタイルを下（row大）へ落とす。ランダム補充なし */
export function applyDownwardGravity(board: Board): Board {
  const newBoard = cloneBoard(board);

  for (let col = 0; col < GRID_COLS; col++) {
    const tiles = [];

    for (let row = GRID_ROWS - 1; row >= 0; row--) {
      const tile = newBoard[row][col];
      if (tile) tiles.push(tile);
    }

    for (let row = 0; row < GRID_ROWS; row++) {
      newBoard[row][col] = null;
    }

    for (let i = 0; i < tiles.length; i++) {
      const row = GRID_ROWS - 1 - i;
      newBoard[row][col] = {
        ...tiles[i],
        position: { row, col },
      };
    }
  }

  return newBoard;
}

/** @deprecated 旧ルール用。テトリスモードでは applyDownwardGravity を使用 */
export function applyGravity(board: Board): Board {
  return applyDownwardGravity(board);
}

export function applyGravityAndRefill(board: Board): Board {
  return applyDownwardGravity(board);
}
