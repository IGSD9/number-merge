"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Play, Trophy } from "lucide-react";
import { ensureAnonymousSession } from "@/lib/auth/ensureAnonymousSession";
import { clearGameSession } from "@/lib/game/gameSession";

export function HomeScreen() {
  const router = useRouter();

  useEffect(() => {
    void ensureAnonymousSession();
  }, []);

  const handleStart = async () => {
    clearGameSession();
    await ensureAnonymousSession();
    router.push("/game");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 px-4 py-12 text-white">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Number Merge</h1>
        <p className="mt-3 text-sm text-gray-400">
          同じ数字を一筆書きで繋いでマージ
        </p>
      </header>

      <div className="flex w-full max-w-sm flex-col gap-4">
        <button
          type="button"
          onClick={handleStart}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-6 py-4 text-lg font-semibold transition-colors hover:bg-indigo-400"
        >
          <Play className="h-6 w-6" />
          ゲームスタート
        </button>

        <Link
          href="/leaderboard"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-700 bg-gray-900 px-6 py-4 text-lg font-semibold transition-colors hover:bg-gray-800"
        >
          <Trophy className="h-6 w-6 text-yellow-400" />
          ランキング
        </Link>
      </div>
    </div>
  );
}
