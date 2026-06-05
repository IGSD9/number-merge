"use client";

import { useEffect, useState } from "react";
import { Save, Trophy } from "lucide-react";
import { getRegistrationInfo } from "@/app/actions/score";
import { createClient } from "@/lib/supabase/client";
import {
  savePendingDisplayName,
  savePendingScore,
} from "@/lib/offline/syncScore";
import { validateDisplayName } from "@/lib/validation/displayName";
import type { RegistrationInfo } from "@/types/game";

interface ScoreRegisterModalProps {
  score: number;
  onRegister: (displayName: string) => Promise<{ success: boolean; message: string }>;
  onClose: () => void;
}

export function ScoreRegisterModal({
  score,
  onRegister,
  onClose,
}: ScoreRegisterModalProps) {
  const [displayName, setDisplayName] = useState("");
  const [registrationInfo, setRegistrationInfo] = useState<RegistrationInfo | null>(
    null,
  );
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  useEffect(() => {
    void getRegistrationInfo().then(setRegistrationInfo);
  }, []);

  const validateName = (): string | null => {
    const validation = validateDisplayName(displayName);
    if (!validation.valid) return validation.error ?? "名前が無効です";
    return null;
  };

  const handleGoogleLogin = async () => {
    const nameError = validateName();
    if (nameError) {
      setError(nameError);
      return;
    }

    const validation = validateDisplayName(displayName);
    if (!validation.normalized) return;

    setLoading("google");
    setError(null);

    if (score > 0) {
      savePendingScore(score);
      savePendingDisplayName(validation.normalized);
    }

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/game`,
      },
    });

    if (authError) {
      setError("ログインに失敗しました");
      setLoading(null);
    }
  };

  const handleRegister = async () => {
    const nameError = validateName();
    if (nameError) {
      setError(nameError);
      return;
    }

    const validation = validateDisplayName(displayName);
    if (!validation.normalized) return;

    setLoading("register");
    setError(null);

    const result = await onRegister(validation.normalized);
    setLoading(null);

    if (result.success) {
      setResultMessage(result.message);
    } else {
      setError(result.message);
    }
  };

  const previousHighScore = registrationInfo?.previousHighScore ?? 0;
  const isOAuthUser = registrationInfo?.isOAuthUser ?? false;
  const canUpdateRecord = score > previousHighScore;

  if (resultMessage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
        <div className="w-full max-w-sm rounded-2xl bg-gray-900 p-6 text-center text-white shadow-xl">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
            <Trophy className="h-6 w-6 text-yellow-400" />
          </div>
          <p className="text-sm leading-relaxed text-gray-300">{resultMessage}</p>
          <button
            type="button"
            onClick={onClose}
            className="mt-6 w-full rounded-xl bg-indigo-500 px-4 py-3 font-semibold transition-colors hover:bg-indigo-400"
          >
            OK
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-gray-900 p-6 text-white shadow-xl">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-800">
            <Save className="h-6 w-6 text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold">ランキングに登録</h2>
          <p className="mt-2 text-sm text-gray-400">
            現在のスコア: <span className="font-bold text-white">{score.toLocaleString()}</span>
          </p>
        </div>

        {isOAuthUser && (
          <div className="mt-4 rounded-xl bg-gray-800 px-4 py-3 text-sm">
            <p className="text-gray-400">ログイン中のベストスコア</p>
            <p className="mt-1 text-lg font-bold tabular-nums">
              {previousHighScore.toLocaleString()}
            </p>
            <p className="mt-2 text-xs text-indigo-300">
              {canUpdateRecord
                ? "このスコアで記録を更新できます！"
                : `${(previousHighScore + 1).toLocaleString()} 点以上で記録更新`}
            </p>
          </div>
        )}

        <div className="mt-5">
          <label htmlFor="display-name" className="mb-1 block text-left text-xs text-gray-400">
            表示名
          </label>
          <input
            id="display-name"
            type="text"
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value);
              setError(null);
            }}
            maxLength={20}
            placeholder="ランキングに表示する名前"
            className="w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none"
          />
          <p className="mt-1 text-left text-xs text-gray-500">1文字以上・20文字以内</p>
        </div>

        <p className="mt-4 text-center text-sm leading-relaxed text-gray-400">
          Googleでログインするとスコアがアカウントに保存され、
          前回の記録を超えたときだけランキングが更新されます。
        </p>

        <div className="mt-5 space-y-3">
          <button
            type="button"
            onClick={handleRegister}
            disabled={loading !== null}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 font-semibold transition-colors hover:bg-indigo-400 disabled:opacity-50"
          >
            {loading === "register" ? "登録中..." : "登録する"}
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading !== null}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 font-semibold transition-colors hover:bg-gray-700 disabled:opacity-50"
          >
            {loading === "google" ? "リダイレクト中..." : "Google でログインして登録"}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={loading !== null}
            className="w-full rounded-xl px-4 py-3 text-sm text-gray-400 transition-colors hover:text-white"
          >
            キャンセル
          </button>
        </div>

        {error && <p className="mt-3 text-center text-sm text-red-400">{error}</p>}
      </div>
    </div>
  );
}
