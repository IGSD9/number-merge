import {
  GRID_COLS,
  GRID_ROWS,
  INITIAL_VALUES,
  type Board,
  type CellPosition,
  type Tile,
  type TileValue,
} from "@/types/game";

export function createEmptyBoard(): Board {
  return Array.from({ length: GRID_ROWS }, () =>
    Array.from({ length: GRID_COLS }, () => null),
  );
}

export function generateRandomTile(position: CellPosition = { row: 0, col: 0 }): Tile {
  const value = INITIAL_VALUES[
    Math.floor(Math.random() * INITIAL_VALUES.length)
  ] as TileValue;

  return {
    id: crypto.randomUUID(),
    value,
    position,
  };
}

export function initializeBoard(): Board {
  const board = createEmptyBoard();

  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      board[row][col] = generateRandomTile({ row, col });
    }
  }

  return board;
}

export function getTileAt(board: Board, pos: CellPosition): Tile | null {
  if (!isValidPosition(pos)) return null;
  return board[pos.row][pos.col];
}

export function posToKey(pos: CellPosition): string {
  return `${pos.row},${pos.col}`;
}

/** 縦横のみ隣接（斜めは不可） */
export function isAdjacent(a: CellPosition, b: CellPosition): boolean {
  const rowDiff = Math.abs(a.row - b.row);
  const colDiff = Math.abs(a.col - b.col);
  return rowDiff + colDiff === 1;
}

export function isValidPosition(pos: CellPosition): boolean {
  return (
    pos.row >= 0 &&
    pos.row < GRID_ROWS &&
    pos.col >= 0 &&
    pos.col < GRID_COLS
  );
}

export function cloneBoard(board: Board): Board {
  return board.map((row) =>
    row.map((tile) => (tile ? { ...tile, position: { ...tile.position } } : null)),
  );
}
