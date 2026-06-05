import { createEmptyBoard } from "@/lib/game/board";
import { DEFAULT_DROP_COL, generateSmartTile } from "@/lib/game/spawn";
import type { GameState } from "@/types/game";

export function createNewGameState(bestScore: number): GameState {
  const board = createEmptyBoard();
  const current = generateSmartTile(board);
  const next = generateSmartTile(board);

  return {
    board,
    score: 0,
    bestScore,
    isGameOver: false,
    isAnimating: false,
    currentPath: null,
    currentPiece: { tile: current, col: DEFAULT_DROP_COL },
    nextPiece: next,
  };
}
