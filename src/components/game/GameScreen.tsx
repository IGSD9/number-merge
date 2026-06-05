"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, Save, Trophy } from "lucide-react";
import { GameBoard } from "@/components/game/GameBoard";
import { GameOverModal } from "@/components/game/GameOverModal";
import { HomeConfirmModal } from "@/components/game/HomeConfirmModal";
import { ScorePanel } from "@/components/game/ScorePanel";
import { ScoreRegisterModal } from "@/components/game/ScoreRegisterModal";
import { useGame } from "@/hooks/useGame";

export function GameScreen() {
  const router = useRouter();
  const {
    gameState,
    fallingAnimation,
    mergeAnimation,
    isLoading,
    registrationNotice,
    clearRegistrationNotice,
    dropAtColumn,
    completeFall,
    completeMergeAnimation,
    restart,
    abandonGame,
    registerScore,
  } = useGame();
  const [showHomeConfirm, setShowHomeConfirm] = useState(false);
  const [showScoreRegister, setShowScoreRegister] = useState(false);

  if (isLoading || !gameState) {
    return <div className="min-h-screen bg-gray-950" />;
  }

  const isNewRecord =
    gameState.isGameOver && gameState.score > 0 && gameState.score >= gameState.bestScore;

  const handleHomeConfirm = () => {
    setShowHomeConfirm(false);
    abandonGame();
    router.push("/");
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-950 px-4 py-6 text-white">
      <header className="mb-6 w-full max-w-sm">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowHomeConfirm(true)}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-gray-400 transition-colors hover:text-white"
              aria-label="ホームに戻る"
            >
              <Home className="h-4 w-4" />
              ホーム
            </button>
            <button
              type="button"
              onClick={() => setShowScoreRegister(true)}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-gray-400 transition-colors hover:text-indigo-400"
              aria-label="スコアを登録"
            >
              <Save className="h-4 w-4" />
              登録
            </button>
          </div>
          <Link
            href="/leaderboard?from=game"
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-gray-400 transition-colors hover:text-yellow-400"
          >
            <Trophy className="h-4 w-4" />
            ランキング
          </Link>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Number Merge</h1>
          <p className="mt-1 text-sm text-gray-400">マスをタップして数字を落とす</p>
        </div>
      </header>

      {registrationNotice && (
        <div className="mb-4 w-full max-w-sm rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-4 py-3 text-sm text-indigo-200">
          <p>{registrationNotice}</p>
          <button
            type="button"
            onClick={clearRegistrationNotice}
            className="mt-2 text-xs text-indigo-300 underline"
          >
            閉じる
          </button>
        </div>
      )}

      <div className="flex w-fit flex-col items-stretch gap-6">
        <ScorePanel score={gameState.score} bestScore={gameState.bestScore} />

        <GameBoard
          board={gameState.board}
          currentPiece={gameState.currentPiece}
          nextPiece={gameState.nextPiece}
          fallingAnimation={fallingAnimation}
          mergeAnimation={mergeAnimation}
          onColumnTap={dropAtColumn}
          onFallComplete={completeFall}
          onMergeAnimationComplete={completeMergeAnimation}
          isAnimating={gameState.isAnimating}
          isGameOver={gameState.isGameOver}
        />

        <p className="text-center text-xs text-gray-500">
          縦・横でつながった同じ数字はまとめてマージ（例: 4+4+4→16）
        </p>
      </div>

      {showHomeConfirm && (
        <HomeConfirmModal
          onConfirm={handleHomeConfirm}
          onCancel={() => setShowHomeConfirm(false)}
        />
      )}

      {showScoreRegister && (
        <ScoreRegisterModal
          score={Math.max(gameState.score, gameState.bestScore)}
          onRegister={registerScore}
          onClose={() => setShowScoreRegister(false)}
        />
      )}

      {gameState.isGameOver && (
        <GameOverModal
          score={gameState.score}
          bestScore={gameState.bestScore}
          isNewRecord={isNewRecord}
          onRestart={restart}
        />
      )}
    </div>
  );
}
