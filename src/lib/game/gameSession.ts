import type { GameState } from "@/types/game";

const GAME_SESSION_KEY = "number-merge:game-session";

type SavedGameSession = Pick<
  GameState,
  "board" | "score" | "bestScore" | "isGameOver"
>;

export function saveGameSession(state: GameState): void {
  if (typeof window === "undefined") return;

  const session: SavedGameSession = {
    board: state.board,
    score: state.score,
    bestScore: state.bestScore,
    isGameOver: state.isGameOver,
  };

  sessionStorage.setItem(GAME_SESSION_KEY, JSON.stringify(session));
}

export function loadGameSession(): SavedGameSession | null {
  if (typeof window === "undefined") return null;

  const stored = sessionStorage.getItem(GAME_SESSION_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as SavedGameSession;
  } catch {
    return null;
  }
}

export function clearGameSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(GAME_SESSION_KEY);
}
