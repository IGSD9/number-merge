"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getHighScore, saveHighScore } from "@/app/actions/score";
import { ensureAnonymousSession } from "@/lib/auth/ensureAnonymousSession";
import { applyGravityAndRefill } from "@/lib/game/gravity";
import { checkGameOver } from "@/lib/game/gameOver";
import { createEmptyBoard, initializeBoard } from "@/lib/game/board";
import {
  clearGameSession,
  loadGameSession,
  saveGameSession,
} from "@/lib/game/gameSession";
import { executeMerge } from "@/lib/game/merge";
import { buildRegisterMessage } from "@/lib/score/registerMessage";
import {
  consumeRegistrationResult,
  savePendingScore,
  syncPendingScore,
} from "@/lib/offline/syncScore";
import { useTouchPath } from "@/hooks/useTouchPath";
import type { GameState, MergePath } from "@/types/game";

const BEST_SCORE_KEY = "number-merge:best-score";

function loadBestScore(): number {
  if (typeof window === "undefined") return 0;
  const stored = localStorage.getItem(BEST_SCORE_KEY);
  return stored ? Number.parseInt(stored, 10) : 0;
}

function saveBestScore(score: number): void {
  localStorage.setItem(BEST_SCORE_KEY, String(score));
}

export function useGame() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [registrationNotice, setRegistrationNotice] = useState<string | null>(
    null,
  );
  const initialBestScore = useRef(0);

  useEffect(() => {
    const init = async () => {
      const saved = loadGameSession();

      if (saved) {
        setGameState({
          ...saved,
          isAnimating: false,
          currentPath: null,
        });
        initialBestScore.current = saved.bestScore;
      } else {
        setGameState({
          board: initializeBoard(),
          score: 0,
          bestScore: 0,
          isGameOver: false,
          isAnimating: false,
          currentPath: null,
        });
      }

      await ensureAnonymousSession();

      const local = loadBestScore();
      initialBestScore.current = Math.max(initialBestScore.current, local);

      try {
        const { highScore } = await getHighScore();
        const best = Math.max(initialBestScore.current, local, highScore);
        saveBestScore(best);
        setGameState((prev) => (prev ? { ...prev, bestScore: best } : prev));
        initialBestScore.current = best;
      } catch {
        const best = Math.max(initialBestScore.current, local);
        setGameState((prev) => (prev ? { ...prev, bestScore: best } : prev));
        initialBestScore.current = best;
      }

      await syncPendingScore();

      const pendingMessage = consumeRegistrationResult();
      if (pendingMessage) {
        setRegistrationNotice(pendingMessage);
      }
    };

    void init();

    const handleOnline = () => {
      void syncPendingScore();
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  useEffect(() => {
    if (!gameState) return;
    saveGameSession(gameState);
  }, [gameState]);

  useEffect(() => {
    if (!gameState?.isGameOver || gameState.score <= 0) return;
    if (gameState.score < initialBestScore.current) return;

    const persistScore = async () => {
      try {
        await ensureAnonymousSession();
        const result = await saveHighScore(gameState.score);
        if (!result.success) {
          savePendingScore(gameState.score);
          return;
        }

        if (result.highScore > gameState.bestScore) {
          saveBestScore(result.highScore);
          setGameState((prev) =>
            prev ? { ...prev, bestScore: result.highScore } : prev,
          );
        }
      } catch {
        savePendingScore(gameState.score);
      }
    };

    void persistScore();
  }, [gameState?.isGameOver, gameState?.score, gameState?.bestScore]);

  const handleMergeComplete = useCallback((path: MergePath) => {
    setGameState((prev) => {
      if (!prev || prev.isGameOver || prev.isAnimating) return prev;

      try {
        const { newBoard, scoreGain } = executeMerge(prev.board, path);
        const nextScore = prev.score + scoreGain;
        const finalBoard = applyGravityAndRefill(newBoard);
        const isGameOver = checkGameOver(finalBoard);
        const nextBestScore = Math.max(prev.bestScore, nextScore);

        if (nextBestScore > prev.bestScore) {
          saveBestScore(nextBestScore);
        }

        return {
          board: finalBoard,
          score: nextScore,
          bestScore: nextBestScore,
          isGameOver,
          isAnimating: false,
          currentPath: null,
        };
      } catch {
        return prev;
      }
    });
  }, []);

  const board = gameState?.board ?? createEmptyBoard();

  const { currentPath, handlers } = useTouchPath({
    board,
    onMergeComplete: handleMergeComplete,
    disabled: !gameState || gameState.isGameOver || gameState.isAnimating,
  });

  const restart = useCallback(() => {
    clearGameSession();
    setGameState((prev) => {
      if (!prev) return prev;
      return {
        board: initializeBoard(),
        score: 0,
        bestScore: prev.bestScore,
        isGameOver: false,
        isAnimating: false,
        currentPath: null,
      };
    });
  }, []);

  const abandonGame = useCallback(() => {
    clearGameSession();
  }, []);

  const registerScore = useCallback(
    async (displayName: string): Promise<{ success: boolean; message: string }> => {
      if (!gameState) {
        return { success: false, message: "ゲームの読み込み中です" };
      }

      const scoreToSave = Math.max(gameState.score, gameState.bestScore);

      if (scoreToSave <= 0) {
        return { success: false, message: "登録できるスコアがありません" };
      }

      try {
        await ensureAnonymousSession();
        const result = await saveHighScore(scoreToSave, displayName);

        if (!result.success) {
          savePendingScore(scoreToSave);
          return {
            success: false,
            message: result.error ?? "登録に失敗しました。後でもう一度お試しください",
          };
        }

        if (result.highScore > gameState.bestScore) {
          saveBestScore(result.highScore);
          setGameState((prev) =>
            prev ? { ...prev, bestScore: result.highScore } : prev,
          );
        }

        return {
          success: true,
          message: buildRegisterMessage(displayName, scoreToSave, result),
        };
      } catch {
        savePendingScore(scoreToSave);
        return { success: false, message: "登録に失敗しました。後でもう一度お試しください" };
      }
    },
    [gameState],
  );

  return {
    gameState: gameState ? { ...gameState, currentPath } : null,
    isLoading: gameState === null,
    registrationNotice,
    clearRegistrationNotice: () => setRegistrationNotice(null),
    handlers,
    currentPath,
    restart,
    abandonGame,
    registerScore,
  };
}
