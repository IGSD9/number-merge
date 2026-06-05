import { RotateCcw, Trophy } from "lucide-react";

interface GameOverModalProps {
  score: number;
  bestScore: number;
  isNewRecord: boolean;
  onRestart: () => void;
}

export function GameOverModal({
  score,
  bestScore,
  isNewRecord,
  onRestart,
}: GameOverModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-gray-900 p-6 text-center text-white shadow-xl">
        <h2 className="text-2xl font-bold">Game Over</h2>
        <p className="mt-2 text-gray-400">これ以上マージできるタイルがありません</p>

        <div className="mt-6 space-y-2">
          <p className="text-sm text-gray-400">スコア</p>
          <p className="text-4xl font-bold tabular-nums">{score.toLocaleString()}</p>
          {isNewRecord && (
            <p className="flex items-center justify-center gap-1 text-sm text-yellow-400">
              <Trophy className="h-4 w-4" />
              新記録！ Best: {bestScore.toLocaleString()}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onRestart}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 font-semibold transition-colors hover:bg-indigo-400"
        >
          <RotateCcw className="h-5 w-5" />
          もう一度プレイ
        </button>
      </div>
    </div>
  );
}
