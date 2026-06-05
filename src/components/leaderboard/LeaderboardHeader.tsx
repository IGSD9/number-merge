import Link from "next/link";
import { ArrowLeft, Gamepad2 } from "lucide-react";

interface LeaderboardHeaderProps {
  fromGame: boolean;
}

export function LeaderboardHeader({ fromGame }: LeaderboardHeaderProps) {
  return (
    <header className="mb-6 w-full max-w-md">
      <div className="mb-4 flex items-center justify-between">
        {!fromGame ? (
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-gray-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            ホームに戻る
          </Link>
        ) : (
          <div />
        )}

        {fromGame && (
          <Link
            href="/game"
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-gray-400 transition-colors hover:text-indigo-400"
          >
            <Gamepad2 className="h-4 w-4" />
            ゲームに戻る
          </Link>
        )}
      </div>

      <h1 className="text-2xl font-bold tracking-tight">リーダーボード</h1>
      <p className="mt-1 text-sm text-gray-400">ハイスコアランキング</p>
    </header>
  );
}
