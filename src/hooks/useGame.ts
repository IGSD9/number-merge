"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getHighScore, saveHighScore } from "@/app/actions/score";
import { ensureAnonymousSession } from "@/lib/auth/ensureAnonymousSession";
import {
  getNextMergeStep,
  resolveAllAutoMerges,
  type MergeStep,
} from "@/lib/game/autoMerge";
import { createNewGameState } from "@/lib/game/initGame";
import {
  clearGameSession,
  loadGameSession,
  saveGameSession,
} from "@/lib/game/gameSession";
import {
  applyMergeStepWithGravity,
  canPlaceAnywhere,
  canPlaceInColumn,
  createMergeOnTopStep,
  DEFAULT_DROP_COL,
  generateSmartTile,
  getStackLandingRow,
  placeDroppedPiece,
  resetSpawnGuarantee,
} from "@/lib/game/spawn";
import { buildRegisterMessage } from "@/lib/score/registerMessage";
import {
  consumeRegistrationResult,
  savePendingScore,
  syncPendingScore,
} from "@/lib/offline/syncScore";
import type {
  CellPosition,
  FallingAnimation,
  GameState,
  MergeAnimation,
} from "@/types/game";

const BEST_SCORE_KEY = "number-merge:best-score";

function loadBestScore(): number {
  if (typeof window === "undefined") return 0;
  const stored = localStorage.getItem(BEST_SCORE_KEY);
  return stored ? Number.parseInt(stored, 10) : 0;
}

function saveBestScore(score: number): void {
  localStorage.setItem(BEST_SCORE_KEY, String(score));
}

function resolveGameOver(
  board: GameState["board"],
  nextTileValue: number,
): boolean {
  return !canPlaceAnywhere(board, nextTileValue);
}

function toMergeAnimation(step: MergeStep): MergeAnimation {
  return {
    sources: step.group.map((pos) => ({
      row: pos.row,
      col: pos.col,
      value: step.sourceValue,
    })),
    centerRow: step.center.row,
    centerCol: step.center.col,
    mergedValue: step.mergedValue,
    targetRow: step.target.row,
    targetCol: step.target.col,
  };
}

function toMergeOnTopAnimation(step: MergeStep, col: number): MergeAnimation {
  return {
    sources: [
      { row: -1, col, value: step.sourceValue },
      { row: 0, col, value: step.sourceValue },
    ],
    centerRow: step.center.row,
    centerCol: step.center.col,
    mergedValue: step.mergedValue,
    targetRow: step.target.row,
    targetCol: step.target.col,
  };
}

export function useGame() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [fallingAnimation, setFallingAnimation] = useState<FallingAnimation | null>(
    null,
  );
  const [mergeAnimation, setMergeAnimation] = useState<MergeAnimation | null>(null);
  const [registrationNotice, setRegistrationNotice] = useState<string | null>(
    null,
  );
  const initialBestScore = useRef(0);
  const pendingDropRef = useRef<{
    tile: { tile: NonNullable<GameState["currentPiece"]>["tile"]; col: number };
    board: GameState["board"];
    score: number;
    bestScore: number;
    queuedNext: GameState["nextPiece"];
  } | null>(null);
  const mergeChainRef = useRef<{
    board: GameState["board"];
    score: number;
    bestScore: number;
    priorityPos?: CellPosition;
    queuedNext: GameState["nextPiece"];
  } | null>(null);
  const currentMergeStepRef = useRef<MergeStep | null>(null);
  const fallHandledRef = useRef(false);
  const mergeHandledRef = useRef(false);

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
        setGameState(createNewGameState(0));
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

  const finishDropCycle = useCallback(
    (
      board: GameState["board"],
      score: number,
      bestScore: number,
      queuedNext: GameState["nextPiece"],
    ) => {
      mergeChainRef.current = null;
      const promoted = queuedNext ?? generateSmartTile(board);
      const isGameOver = resolveGameOver(board, promoted.value);
      const nextBestScore = Math.max(bestScore, score);

      if (nextBestScore > bestScore) {
        saveBestScore(nextBestScore);
      }

      setGameState((prev) => {
        if (!prev) return prev;

        const newNext = isGameOver ? null : generateSmartTile(board);

        return {
          ...prev,
          board,
          score,
          bestScore: nextBestScore,
          isGameOver,
          isAnimating: false,
          currentPath: null,
          currentPiece: isGameOver
            ? null
            : { tile: promoted, col: DEFAULT_DROP_COL },
          nextPiece: newNext,
        };
      });
    },
    [],
  );

  useEffect(() => {
    if (!gameState || gameState.isAnimating) return;

    const timer = setTimeout(() => {
      saveGameSession(gameState);
    }, 300);

    return () => clearTimeout(timer);
  }, [gameState]);

  useEffect(() => {
    if (!gameState?.isAnimating) return;

    const safetyTimer = setTimeout(() => {
      fallHandledRef.current = true;
      mergeHandledRef.current = true;
      setFallingAnimation(null);
      setMergeAnimation(null);

      const pending = pendingDropRef.current;
      const chain = mergeChainRef.current;

      pendingDropRef.current = null;
      mergeChainRef.current = null;
      currentMergeStepRef.current = null;

      if (chain) {
        const { board, scoreGain } = resolveAllAutoMerges(chain.board);
        finishDropCycle(
          board,
          chain.score + scoreGain,
          Math.max(chain.bestScore, chain.score + scoreGain),
          chain.queuedNext,
        );
        return;
      }

      if (pending) {
        const placed = placeDroppedPiece(
          pending.board,
          pending.tile.tile,
          pending.tile.col,
        );
        if (placed) {
          let board = placed.board;
          let extraScore = 0;

          if (placed.kind === "mergeOnTop") {
            const step = createMergeOnTopStep(
              placed.board,
              pending.tile.col,
              placed.incomingTile,
            );
            if (step) {
              const merged = applyMergeStepWithGravity(board, step);
              board = merged.board;
              extraScore = merged.scoreGain;
            }
          }

          const { board: resolvedBoard, scoreGain } = resolveAllAutoMerges(board);
          finishDropCycle(
            resolvedBoard,
            pending.score + extraScore + scoreGain,
            Math.max(
              pending.bestScore,
              pending.score + extraScore + scoreGain,
            ),
            pending.queuedNext,
          );
          return;
        }
      }

      setGameState((prev) =>
        prev
          ? {
              ...prev,
              isAnimating: false,
              currentPiece:
                prev.currentPiece ??
                (prev.isGameOver
                  ? null
                  : {
                      tile: prev.nextPiece ?? generateSmartTile(prev.board),
                      col: DEFAULT_DROP_COL,
                    }),
            }
          : prev,
      );
    }, 5000);

    return () => clearTimeout(safetyTimer);
  }, [gameState?.isAnimating, finishDropCycle]);

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

  const startNextMergeOrFinish = useCallback(() => {
    const chain = mergeChainRef.current;
    if (!chain) return;

    const step = getNextMergeStep(chain.board, chain.priorityPos);
    chain.priorityPos = undefined;

    if (!step) {
      finishDropCycle(
        chain.board,
        chain.score,
        chain.bestScore,
        chain.queuedNext,
      );
      return;
    }

    mergeHandledRef.current = false;
    currentMergeStepRef.current = step;
    setMergeAnimation(toMergeAnimation(step));
  }, [finishDropCycle]);

  const dropAtColumn = useCallback(
    (col: number) => {
      if (
        !gameState ||
        gameState.isGameOver ||
        gameState.isAnimating ||
        !gameState.currentPiece
      ) {
        return;
      }
      const dropValue = gameState.currentPiece.tile.value;
      if (!canPlaceInColumn(gameState.board, col, dropValue)) return;

      const targetRow = getStackLandingRow(gameState.board, col, dropValue);
      if (targetRow === null) return;

      fallHandledRef.current = false;
      pendingDropRef.current = {
        tile: { tile: gameState.currentPiece.tile, col },
        board: gameState.board,
        score: gameState.score,
        bestScore: gameState.bestScore,
        queuedNext: gameState.nextPiece,
      };

      setFallingAnimation({
        tile: gameState.currentPiece.tile,
        col,
        targetRow,
      });

      setGameState((prev) =>
        prev ? { ...prev, isAnimating: true, currentPiece: null } : prev,
      );
    },
    [gameState],
  );

  const completeFall = useCallback(() => {
    if (fallHandledRef.current) return;

    const pending = pendingDropRef.current;
    if (!pending?.tile) {
      setFallingAnimation(null);
      return;
    }

    fallHandledRef.current = true;
    pendingDropRef.current = null;
    setFallingAnimation(null);

    const placed = placeDroppedPiece(
      pending.board,
      pending.tile.tile,
      pending.tile.col,
    );

    if (!placed) {
      setGameState((prev) =>
        prev ? { ...prev, isAnimating: false } : prev,
      );
      return;
    }

    if (placed.kind === "mergeOnTop") {
      const step = createMergeOnTopStep(
        placed.board,
        pending.tile.col,
        placed.incomingTile,
      );
      if (!step) {
        setGameState((prev) =>
          prev ? { ...prev, isAnimating: false } : prev,
        );
        return;
      }

      mergeChainRef.current = {
        board: placed.board,
        score: pending.score,
        bestScore: pending.bestScore,
        queuedNext: pending.queuedNext,
      };
      mergeHandledRef.current = false;
      currentMergeStepRef.current = step;
      setMergeAnimation(toMergeOnTopAnimation(step, pending.tile.col));
      return;
    }

    mergeChainRef.current = {
      board: placed.board,
      score: pending.score,
      bestScore: pending.bestScore,
      priorityPos: { row: placed.row, col: pending.tile.col },
      queuedNext: pending.queuedNext,
    };

    setGameState((prev) =>
      prev ? { ...prev, board: placed.board } : prev,
    );

    startNextMergeOrFinish();
  }, [startNextMergeOrFinish]);

  const completeMergeAnimation = useCallback(() => {
    if (mergeHandledRef.current) return;

    const chain = mergeChainRef.current;
    const step = currentMergeStepRef.current;
    if (!chain || !step) {
      setMergeAnimation(null);
      return;
    }

    mergeHandledRef.current = true;

    const { board, scoreGain } = applyMergeStepWithGravity(chain.board, step);
    const nextScore = chain.score + scoreGain;
    const nextBestScore = Math.max(chain.bestScore, nextScore);

    mergeChainRef.current = {
      board,
      score: nextScore,
      bestScore: nextBestScore,
      queuedNext: chain.queuedNext,
    };

    currentMergeStepRef.current = null;
    setMergeAnimation(null);

    setGameState((prev) =>
      prev
        ? { ...prev, board, score: nextScore, bestScore: nextBestScore }
        : prev,
    );

    startNextMergeOrFinish();
  }, [startNextMergeOrFinish]);

  const restart = useCallback(() => {
    clearGameSession();
    resetSpawnGuarantee();
    setFallingAnimation(null);
    setMergeAnimation(null);
    pendingDropRef.current = null;
    mergeChainRef.current = null;
    currentMergeStepRef.current = null;
    setGameState((prev) => {
      if (!prev) return prev;
      return createNewGameState(prev.bestScore);
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
    gameState,
    fallingAnimation,
    mergeAnimation,
    isLoading: gameState === null,
    registrationNotice,
    clearRegistrationNotice: () => setRegistrationNotice(null),
    dropAtColumn,
    completeFall,
    completeMergeAnimation,
    restart,
    abandonGame,
    registerScore,
  };
}
