"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserRound } from "lucide-react";
import { ensureUser } from "@/app/actions/user";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnonymousLogin = async () => {
    setLoading("anonymous");
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInAnonymously();

    if (authError) {
      setError("匿名ログインに失敗しました");
      setLoading(null);
      return;
    }

    const result = await ensureUser();
    if (!result.success) {
      setError("ユーザー登録に失敗しました");
      setLoading(null);
      return;
    }

    router.push("/");
    router.refresh();
  };

  const handleOAuthLogin = async () => {
    setLoading("google");
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError("ログインに失敗しました");
      setLoading(null);
    }
  };

  return (
    <div className="w-full max-w-sm space-y-4">
      <button
        type="button"
        onClick={handleAnonymousLogin}
        disabled={loading !== null}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-indigo-400 disabled:opacity-50"
      >
        <UserRound className="h-5 w-5" />
        {loading === "anonymous" ? "ログイン中..." : "ゲストとしてプレイ"}
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-700" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-gray-950 px-2 text-gray-500">または</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleOAuthLogin}
        disabled={loading !== null}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
      >
        {loading === "google" ? "リダイレクト中..." : "Google でログイン"}
      </button>

      {error && <p className="text-center text-sm text-red-400">{error}</p>}
    </div>
  );
}
