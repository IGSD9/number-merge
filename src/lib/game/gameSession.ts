import type { GameState } from "@/types/game";

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

export function saveGameSession(state: GameState): void {
  if (typeof window === "undefined") return;

  const session: SavedGameSession = {
    version: SESSION_VERSION,
    board: state.board,
    score: state.score,
    bestScore: state.bestScore,
    isGameOver: state.isGameOver,
    currentPiece: state.currentPiece,
    nextPiece: state.nextPiece,
  };

  sessionStorage.setItem(GAME_SESSION_KEY, JSON.stringify(session));
}

export function loadGameSession(): SavedGameSession | null {
  if (typeof window === "undefined") return null;

  const stored = sessionStorage.getItem(GAME_SESSION_KEY);
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored) as Partial<SavedGameSession>;
    if (parsed.version !== SESSION_VERSION) return null;
    if (!parsed.currentPiece || !parsed.nextPiece) return null;
    return parsed as SavedGameSession;
  } catch {
    return null;
  }
}

export function clearGameSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(GAME_SESSION_KEY);
}
