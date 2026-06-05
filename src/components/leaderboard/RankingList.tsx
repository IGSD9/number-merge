import { Trophy } from "lucide-react";
import type { RankingEntry } from "@/types/game";

interface RankingListProps {
  rankings: RankingEntry[];
}

export function RankingList({ rankings }: RankingListProps) {
  if (rankings.length === 0) {
    return (
      <p className="rounded-xl bg-gray-900 px-4 py-8 text-center text-gray-400">
        まだスコアがありません
      </p>
    );
  }

  return (
    <ul className="w-full max-w-md space-y-2">
      {rankings.map((entry) => (
        <li
          key={entry.userId}
          className="flex items-center gap-3 rounded-xl bg-gray-900 px-4 py-3"
        >
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
              entry.rank <= 3
                ? "bg-yellow-500/20 text-yellow-400"
                : "bg-gray-800 text-gray-400"
            }`}
          >
            {entry.rank <= 3 ? <Trophy className="h-4 w-4" /> : entry.rank}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{entry.displayName}</p>
            <p className="text-xs text-gray-500">
              {new Date(entry.updatedAt).toLocaleDateString("ja-JP")}
            </p>
          </div>
          <p className="text-lg font-bold tabular-nums text-white">
            {entry.highScore.toLocaleString()}
          </p>
        </li>
      ))}
    </ul>
  );
}
