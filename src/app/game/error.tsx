"use client";

import { useEffect } from "react";
import Link from "next/link";
import { clearGameSession } from "@/lib/game/gameSession";

export default function GameError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Game error:", error);
    clearGameSession();
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 px-6 text-center text-white">
      <h1 className="text-xl font-bold">ゲームの読み込みに失敗しました</h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-gray-400">
        一時的なエラーが発生しました。再読み込みすると新しいゲームから始まります。
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold transition-colors hover:bg-indigo-500"
        >
          再読み込み
        </button>
        <Link
          href="/"
          className="rounded-xl border border-gray-600 px-6 py-3 text-sm font-semibold text-gray-300 transition-colors hover:border-gray-400 hover:text-white"
        >
          ホームに戻る
        </Link>
      </div>
    </div>
  );
}
