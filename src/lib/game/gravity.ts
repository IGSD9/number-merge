import { cloneBoard, generateRandomTile } from "@/lib/game/board";
import { GRID_COLS, GRID_ROWS, type Board } from "@/types/game";

export function applyGravity(board: Board): Board {
  const newBoard = cloneBoard(board);

  for (let col = 0; col < GRID_COLS; col++) {
    const tiles = [];

    for (let row = 0; row < GRID_ROWS; row++) {
      const tile = newBoard[row][col];
      if (tile) tiles.push(tile);
    }

    for (let row = 0; row < GRID_ROWS; row++) {
      newBoard[row][col] = null;
    }

    for (let i = 0; i < tiles.length; i++) {
      const row = i;
      newBoard[row][col] = {
        ...tiles[i],
        position: { row, col },
      };
    }

    for (let row = tiles.length; row < GRID_ROWS; row++) {
      newBoard[row][col] = generateRandomTile({ row, col });
    }
  }

  return newBoard;
}

export function applyGravityAndRefill(board: Board): Board {
  return applyGravity(board);
}
