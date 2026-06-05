import { GRID_COLS } from "@/types/game";

const BOARD_PADDING = 8;
const GAP = 4;
const SCREEN_PADDING = 32;
const NEXT_GAP = 8;
const NEXT_MIN_WIDTH = 44;

export interface GameLayout {
  cellSize: number;
  boardWidth: number;
  nextPieceSize: number;
  totalWidth: number;
}

function buildLayout(cellSize: number, hasNext: boolean): GameLayout {
  const boardWidth =
    BOARD_PADDING * 2 + GRID_COLS * cellSize + (GRID_COLS - 1) * GAP;
  const nextPieceSize = hasNext ? Math.max(cellSize * 0.75, NEXT_MIN_WIDTH) : 0;
  const totalWidth = boardWidth + (hasNext ? NEXT_GAP + nextPieceSize : 0);

  return { cellSize, boardWidth, nextPieceSize, totalWidth };
}

export function getGameLayout(
  viewportWidth: number,
  hasNext: boolean,
): GameLayout {
  const maxAvailable = viewportWidth - SCREEN_PADDING;

  for (let cellSize = 64; cellSize >= 40; cellSize -= 1) {
    const layout = buildLayout(cellSize, hasNext);
    if (layout.totalWidth <= maxAvailable) {
      return layout;
    }
  }

  return buildLayout(40, hasNext);
}

export const GAME_LAYOUT = {
  BOARD_PADDING,
  GAP,
  NEXT_GAP,
} as const;
