"use server";

import { prisma } from "@/lib/prisma";
import type { RankingEntry } from "@/types/game";

function getDisplayName(
  displayName: string | null,
  email: string | null,
  userId: string,
): string {
  if (displayName) return displayName;
  if (email) return email.split("@")[0] ?? "Anonymous";
  return `ゲスト ${userId.slice(0, 4)}`;
}

export async function getLeaderboard(
  limit = 50,
): Promise<{ rankings: RankingEntry[] }> {
  const scores = await prisma.score.findMany({
    take: limit,
    orderBy: { highScore: "desc" },
    include: { user: true },
  });

  const rankings: RankingEntry[] = scores.map((entry, index) => ({
    rank: index + 1,
    userId: entry.userId,
    displayName: getDisplayName(
      entry.user.displayName,
      entry.user.email,
      entry.userId,
    ),
    highScore: entry.highScore,
    updatedAt: entry.updatedAt.toISOString(),
  }));

  return { rankings };
}
