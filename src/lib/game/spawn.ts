import {
  GRID_COLS,
  GRID_ROWS,
  type Board,
  type CellPosition,
  type Tile,
  type TileValue,
} from "@/types/game";
import { cloneBoard } from "@/lib/game/board";
import type { MergeStep } from "@/lib/game/autoMerge";
import { getNextMergeStep, applyMergeStep } from "@/lib/game/autoMerge";
import { applyDownwardGravity } from "@/lib/game/gravity";
import { calculateMergedValue } from "@/lib/game/merge";

export function getBoardMaxValue(board: Board): number {
  let max = 2;
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      const tile = board[row][col];
      if (tile && tile.value > max) max = tile.value;
    }
  }
  return max;
}

/** ボード上の最大値までの2の累乗のみ出現可能 */
export function getAllowedSpawnValues(board: Board): TileValue[] {
  const maxOnBoard = getBoardMaxValue(board);
  const values: TileValue[] = [];
  let v = 2;
  while (v <= maxOnBoard) {
    values.push(v as TileValue);
    v *= 2;
  }
  return values;
}

function countBoardValues(board: Board): Map<number, number> {
  const counts = new Map<number, number>();
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      const tile = board[row][col];
      if (!tile) continue;
      counts.set(tile.value, (counts.get(tile.value) ?? 0) + 1);
    }
  }
  return counts;
}

/** ボード最大より小さい孤立タイル（1個だけ残っている数字） */
export function getStrandedSmallValues(board: Board): number[] {
  const max = getBoardMaxValue(board);
  const counts = countBoardValues(board);

  return [...counts.entries()]
    .filter(([value, count]) => count === 1 && value < max)
    .map(([value]) => value)
    .sort((a, b) => a - b);
}

let spawnGuarantee: { value: number; remaining: number } | null = null;

function syncSpawnGuarantee(board: Board): void {
  const stranded = getStrandedSmallValues(board);

  if (stranded.length === 0) {
    spawnGuarantee = null;
    return;
  }

  const target = stranded[0];
  if (!spawnGuarantee || spawnGuarantee.value !== target) {
    spawnGuarantee = { value: target, remaining: 2 };
  }
}

export function resetSpawnGuarantee(): void {
  spawnGuarantee = null;
}

function pickWeightedValue(weights: { value: TileValue; weight: number }[]): TileValue {
  const total = weights.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * total;

  for (const item of weights) {
    roll -= item.weight;
    if (roll <= 0) return item.value;
  }

  return weights[weights.length - 1].value;
}

function createTile(value: number, position: CellPosition): Tile {
  return {
    id: crypto.randomUUID(),
    value: value as TileValue,
    position,
  };
}

/**
 * 出現数字:
 * - 最初は2のみ
 * - ボード最大値が上がるたびにその数字まで解禁
 * - 大きい数字ほど出やすく（上位帯はさらに出現率アップ）、小さい数字は出にくい
 * - 孤立した小さい数字がある場合、同じ数字を最低2個出す
 */
export function generateSmartTile(
  board: Board,
  position: CellPosition = { row: 0, col: 0 },
): Tile {
  syncSpawnGuarantee(board);

  if (spawnGuarantee && spawnGuarantee.remaining > 0) {
    spawnGuarantee.remaining--;
    return createTile(spawnGuarantee.value, position);
  }

  const allowed = getAllowedSpawnValues(board);
  const maxOnBoard = getBoardMaxValue(board);
  const boardCounts = countBoardValues(board);
  const stranded = new Set(getStrandedSmallValues(board));
  const maxLog = Math.log2(maxOnBoard);

  const weights = allowed.map((value) => {
    const ratio = Math.log2(value) / maxLog;
    // 大きい数字ほど強く出現（指数・倍率を上げ、小数字の底上げを下げる）
    let weight = Math.pow(ratio, 2.6) * 12 + 0.08;
    if (ratio >= 0.55) {
      weight *= 1 + ratio * 0.7;
    }
    if (boardCounts.has(value)) {
      weight *= ratio >= 0.5 ? 1.7 : 1.3;
    }
    if (stranded.has(value)) {
      weight *= 4;
    }
    return { value, weight };
  });

  const selected = pickWeightedValue(weights);
  return createTile(selected, position);
}

/** 列の最上段タイルの直上に着地。空列なら最下段。満列でも上端が同値ならマージ可能 */
export function getStackLandingRow(
  board: Board,
  col: number,
  dropValue?: number,
): number | null {
  for (let row = 0; row < GRID_ROWS; row++) {
    if (board[row][col]) {
      if (row === 0 && dropValue !== undefined && board[row][col]!.value === dropValue) {
        return 0;
      }
      const landRow = row - 1;
      return landRow >= 0 ? landRow : null;
    }
  }
  return GRID_ROWS - 1;
}

export function canPlaceInColumn(
  board: Board,
  col: number,
  dropValue?: number,
): boolean {
  return getStackLandingRow(board, col, dropValue) !== null;
}

export function canPlaceAnywhere(board: Board, dropValue?: number): boolean {
  for (let col = 0; col < GRID_COLS; col++) {
    if (canPlaceInColumn(board, col, dropValue)) return true;
  }
  return false;
}

export function placePieceAt(
  board: Board,
  tile: Tile,
  col: number,
  row: number,
): Board {
  const newBoard = cloneBoard(board);
  newBoard[row][col] = {
    ...tile,
    position: { row, col },
  };
  return newBoard;
}

export type PlaceDroppedResult =
  | { board: Board; row: number; kind: "place" }
  | { board: Board; row: number; kind: "mergeOnTop"; incomingTile: Tile };

/** 満列の上端と同値のときは配置せずマージ待ちにする */
export function placeDroppedPiece(
  board: Board,
  tile: Tile,
  col: number,
): PlaceDroppedResult | null {
  const row = getStackLandingRow(board, col, tile.value);
  if (row === null) return null;

  const existing = board[row][col];
  if (existing && existing.value === tile.value) {
    return { board, row, kind: "mergeOnTop", incomingTile: tile };
  }

  return { board: placePieceAt(board, tile, col, row), row, kind: "place" };
}

/** 満列上端への同値ドロップ用マージステップ */
export function createMergeOnTopStep(
  board: Board,
  col: number,
  incomingTile: Tile,
): MergeStep | null {
  const topTile = board[0][col];
  if (!topTile || topTile.value !== incomingTile.value) return null;

  return {
    group: [{ row: 0, col }],
    target: { row: 0, col },
    center: { row: 0, col },
    mergedValue: calculateMergedValue([topTile, incomingTile]) as TileValue,
    sourceValue: topTile.value as TileValue,
  };
}

/** 1ステップマージ＋重力（アニメーション完了後用） */
export function applyMergeStepWithGravity(
  board: Board,
  step: ReturnType<typeof getNextMergeStep>,
): { board: Board; scoreGain: number } {
  if (!step) return { board, scoreGain: 0 };
  const { board: merged, scoreGain } = applyMergeStep(board, step);
  return { board: applyDownwardGravity(merged), scoreGain };
}

export const DEFAULT_DROP_COL = Math.floor(GRID_COLS / 2);
