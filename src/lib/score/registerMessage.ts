import type { SaveScoreResult } from "@/types/game";

export function buildRegisterMessage(
  displayName: string,
  submittedScore: number,
  result: SaveScoreResult,
): string {
  if (!result.success) {
    return result.error ?? "登録に失敗しました";
  }

  if (result.isLoggedIn) {
    const previous = result.previousHighScore ?? 0;

    if (result.isNewRecord) {
      if (previous === 0) {
        return `「${displayName}」として初回スコア ${result.highScore.toLocaleString()} を登録しました！ログイン中の記録は次回も引き継がれます。`;
      }
      return `記録更新！ ${previous.toLocaleString()} → ${result.highScore.toLocaleString()}（「${displayName}」）`;
    }

    return `ログイン中のベストスコア ${result.highScore.toLocaleString()} は維持されました（今回 ${submittedScore.toLocaleString()} 点）。次は ${(result.highScore + 1).toLocaleString()} 点以上で更新できます。`;
  }

  if (result.isNewRecord) {
    return `「${displayName}」としてスコア ${result.highScore.toLocaleString()} を登録しました！`;
  }

  return `「${displayName}」を登録しました。ベストスコア ${result.highScore.toLocaleString()} は変わりませんでした。`;
}
