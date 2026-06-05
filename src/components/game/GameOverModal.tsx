import { RotateCcw, Save, Trophy } from "lucide-react";

interface GameOverModalProps {
  score: number;
  bestScore: number;
  isNewRecord: boolean;
  onRegister: () => void;
  onRestart: () => void;
}

export function GameOverModal({
  score,
  bestScore,
  isNewRecord,
  onRegister,
  onRestart,
}: GameOverModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-gray-900 p-6 text-center text-white shadow-xl">
        <h2 className="text-2xl font-bold">Game Over</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-400">
          マスがすべて埋まり、
          <br />
          落とす数字と組み合わせられるものがなくなりました
        </p>

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

        <p className="mt-5 text-sm text-gray-400">次はどうしますか？</p>

        <div className="mt-4 flex flex-col gap-3">
          <button
            type="button"
            onClick={onRegister}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 font-semibold transition-colors hover:bg-indigo-400"
          >
            <Save className="h-5 w-5" />
            記録を登録する
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-600 px-4 py-3 font-semibold text-gray-200 transition-colors hover:border-gray-400 hover:text-white"
          >
            <RotateCcw className="h-5 w-5" />
            もう一度挑戦する
          </button>
        </div>
      </div>
    </div>
  );
}
