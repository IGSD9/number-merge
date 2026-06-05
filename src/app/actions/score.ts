"use server";

import { upsertUser } from "@/lib/auth/upsertUser";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { validateDisplayName } from "@/lib/validation/displayName";
import type { RegistrationInfo, SaveScoreResult } from "@/types/game";

export async function getRegistrationInfo(): Promise<RegistrationInfo> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      isLoggedIn: false,
      isOAuthUser: false,
      previousHighScore: 0,
      displayName: null,
    };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { score: true },
  });

  return {
    isLoggedIn: true,
    isOAuthUser: !!user.email,
    previousHighScore: dbUser?.score?.highScore ?? 0,
    displayName: dbUser?.displayName ?? null,
  };
}

export async function saveHighScore(
  score: number,
  displayName?: string,
): Promise<SaveScoreResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        highScore: 0,
        isNewRecord: false,
        error: "セッションが無効です。ページを再読み込みしてください",
      };
    }

    const isLoggedIn = !!user.email;

    let normalizedName: string | undefined;

    if (displayName !== undefined) {
      const validation = validateDisplayName(displayName);
      if (!validation.valid || !validation.normalized) {
        return {
          success: false,
          highScore: 0,
          isNewRecord: false,
          error: validation.error ?? "名前が無効です",
        };
      }
      normalizedName = validation.normalized;
    }

    await upsertUser(user.id, user.email, normalizedName);

    const existing = await prisma.score.findUnique({
      where: { userId: user.id },
    });

    const previousHighScore = existing?.highScore ?? 0;

    if (!existing) {
      await prisma.score.create({
        data: { userId: user.id, highScore: score },
      });
      return {
        success: true,
        highScore: score,
        isNewRecord: true,
        previousHighScore: 0,
        isLoggedIn,
      };
    }

    if (score > existing.highScore) {
      await prisma.score.update({
        where: { userId: user.id },
        data: { highScore: score },
      });
      return {
        success: true,
        highScore: score,
        isNewRecord: true,
        previousHighScore,
        isLoggedIn,
      };
    }

    return {
      success: true,
      highScore: existing.highScore,
      isNewRecord: false,
      previousHighScore,
      isLoggedIn,
    };
  } catch (error) {
    console.error("saveHighScore failed:", error);
    return {
      success: false,
      highScore: 0,
      isNewRecord: false,
      error: "登録に失敗しました。開発サーバーを再起動してお試しください",
    };
  }
}

export async function getHighScore(): Promise<{ highScore: number }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { highScore: 0 };
  }

  const existing = await prisma.score.findUnique({
    where: { userId: user.id },
  });

  return { highScore: existing?.highScore ?? 0 };
}
