import { GRID_COLS, GRID_ROWS, type Board, type GameState } from "@/types/game";

const GAME_SESSION_KEY = "number-merge:game-session";
const SESSION_VERSION = 3;

type SavedGameSession = Pick<
  GameState,
  | "board"
  | "score"
  | "bestScore"
  | "isGameOver"
  | "currentPiece"
  | "nextPiece"
> & {
  version: number;
};

function isValidBoard(board: unknown): board is Board {
  if (!Array.isArray(board) || board.length !== GRID_ROWS) return false;

  return board.every(
    (row) =>
      Array.isArray(row) &&
      row.length === GRID_COLS &&
      row.every(
        (cell) =>
          cell === null ||
          (typeof cell === "object" &&
            cell !== null &&
            typeof cell.id === "string" &&
            typeof cell.value === "number" &&
            cell.value >= 2 &&
            Number.isFinite(cell.value)),
      ),
  );
}

function isValidSession(data: Partial<SavedGameSession>): data is SavedGameSession {
  return (
    data.version === SESSION_VERSION &&
    isValidBoard(data.board) &&
    typeof data.score === "number" &&
    typeof data.bestScore === "number" &&
    typeof data.isGameOver === "boolean" &&
    !!data.currentPiece &&
    typeof data.currentPiece.tile?.id === "string" &&
    typeof data.currentPiece.tile?.value === "number" &&
    !!data.nextPiece &&
    typeof data.nextPiece.id === "string" &&
    typeof data.nextPiece.value === "number"
  );
}

export function saveGameSession(state: GameState): void {
  if (typeof window === "undefined") return;
  if (state.isAnimating) return;

  const session: SavedGameSession = {
    version: SESSION_VERSION,
    board: state.board,
    score: state.score,
    bestScore: state.bestScore,
    isGameOver: state.isGameOver,
    currentPiece: state.currentPiece,
    nextPiece: state.nextPiece,
  };

  try {
    sessionStorage.setItem(GAME_SESSION_KEY, JSON.stringify(session));
  } catch {
    clearGameSession();
  }
}

export function loadGameSession(): SavedGameSession | null {
  if (typeof window === "undefined") return null;

  const stored = sessionStorage.getItem(GAME_SESSION_KEY);
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored) as Partial<SavedGameSession>;
    if (!isValidSession(parsed)) {
      clearGameSession();
      return null;
    }
    return parsed;
  } catch {
    clearGameSession();
    return null;
  }
}

export function clearGameSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(GAME_SESSION_KEY);
}
