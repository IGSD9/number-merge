import { Trophy } from "lucide-react";

interface ScorePanelProps {
  score: number;
  bestScore: number;
}

export function ScorePanel({ score, bestScore }: ScorePanelProps) {
  return (
    <div className="flex w-full max-w-sm items-center justify-between gap-4 rounded-xl bg-gray-800 px-4 py-3 text-white">
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-400">Score</p>
        <p className="text-2xl font-bold tabular-nums">{score.toLocaleString()}</p>
      </div>
      <div className="flex items-center gap-2">
        <Trophy className="h-5 w-5 text-yellow-400" />
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-gray-400">Best</p>
          <p className="text-2xl font-bold tabular-nums">{bestScore.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
