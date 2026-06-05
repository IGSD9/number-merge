import { prisma } from "@/lib/prisma";

export async function upsertUser(
  userId: string,
  email: string | null | undefined,
  displayName?: string | null,
) {
  await prisma.user.upsert({
    where: { id: userId },
    create: {
      id: userId,
      email: email ?? null,
      displayName: displayName ?? null,
    },
    update: {
      email: email ?? null,
      ...(displayName !== undefined ? { displayName } : {}),
    },
  });
}
