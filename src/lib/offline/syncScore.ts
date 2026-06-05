import { saveHighScore } from "@/app/actions/score";
import { buildRegisterMessage } from "@/lib/score/registerMessage";
import type { SaveScoreResult } from "@/types/game";

const PENDING_SYNC_KEY = "number-merge:pending-sync";
const PENDING_NAME_KEY = "number-merge:pending-display-name";
const REGISTRATION_RESULT_KEY = "number-merge:registration-result";

export function savePendingScore(score: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PENDING_SYNC_KEY, String(score));
}

export function getPendingScore(): number | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(PENDING_SYNC_KEY);
  return stored ? Number.parseInt(stored, 10) : null;
}

export function clearPendingScore(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PENDING_SYNC_KEY);
}

export function savePendingDisplayName(name: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PENDING_NAME_KEY, name);
}

export function getPendingDisplayName(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(PENDING_NAME_KEY);
}

export function clearPendingDisplayName(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PENDING_NAME_KEY);
}

export function saveRegistrationResult(message: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(REGISTRATION_RESULT_KEY, message);
}

export function consumeRegistrationResult(): string | null {
  if (typeof window === "undefined") return null;
  const message = localStorage.getItem(REGISTRATION_RESULT_KEY);
  if (message) {
    localStorage.removeItem(REGISTRATION_RESULT_KEY);
  }
  return message;
}

export async function syncPendingScore(): Promise<SaveScoreResult | null> {
  const pending = getPendingScore();
  if (pending === null) return null;

  const pendingName = getPendingDisplayName();

  try {
    const result = await saveHighScore(pending, pendingName ?? undefined);
    if (result.success) {
      clearPendingScore();
      clearPendingDisplayName();

      if (pendingName) {
        saveRegistrationResult(
          buildRegisterMessage(pendingName, pending, result),
        );
      }
    }
    return result;
  } catch {
    return null;
  }
}
