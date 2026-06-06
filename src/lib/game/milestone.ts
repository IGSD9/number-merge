export const MILESTONE_VALUE = 10_000;

export function isMilestoneValue(value: number): boolean {
  return value >= MILESTONE_VALUE;
}
