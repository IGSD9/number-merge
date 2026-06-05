import {
  GRID_COLS,
  GRID_ROWS,
  type Board,
  type CellPosition,
  type Tile,
  type TileValue,
} from "@/types/game";
import { cloneBoard } from "@/lib/game/board";
import { getNextMergeStep, applyMergeStep } from "@/lib/game/autoMerge";
import { applyDownwardGravity } from "@/lib/game/gravity";

export function getBoardMaxValue(board: Board): TileValue {
  let max = 2;
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      const tile = board[row][col];
      if (tile && tile.value > max) max = tile.value;
    }
  }
  return max as TileValue;
}

/** ボード上の最大値までの2の累乗のみ出現可能 */
export function getAllowedSpawnValues(board: Board): TileValue[] {
  const maxOnBoard = getBoardMaxValue(board);
  const values: TileValue[] = [];
  let v = 2;
  while (v <= maxOnBoard && v <= 2048) {
    values.push(v as TileValue);
    v *= 2;
  }
  return values;
}

function countBoardValues(board: Board): Map<TileValue, number> {
  const counts = new Map<TileValue, number>();
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      const tile = board[row][col];
      if (!tile) continue;
      counts.set(tile.value, (counts.get(tile.value) ?? 0) + 1);
    }
  }
  return counts;
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

/**
 * 出現数字:
 * - 最初は2のみ
 * - ボード最大値が上がるたびにその数字まで解禁
 * - 大きい数字ほど出やすく、小さい数字は出にくい
 */
export function generateSmartTile(
  board: Board,
  position: CellPosition = { row: 0, col: 0 },
): Tile {
  const allowed = getAllowedSpawnValues(board);
  const maxOnBoard = getBoardMaxValue(board);
  const boardCounts = countBoardValues(board);
  const maxLog = Math.log2(maxOnBoard);

  const weights = allowed.map((value) => {
    const ratio = Math.log2(value) / maxLog;
    let weight = ratio * ratio * 6 + 0.2;
    if (boardCounts.has(value)) {
      weight *= 1.6;
    }
    return { value, weight };
  });

  const selected = pickWeightedValue(weights);

  return {
    id: crypto.randomUUID(),
    value: selected,
    position,
  };
}

/** 列の最上段タイルの直上に着地。空列なら最下段 */
export function getStackLandingRow(board: Board, col: number): number | null {
  for (let row = 0; row < GRID_ROWS; row++) {
    if (board[row][col]) {
      const landRow = row - 1;
      return landRow >= 0 ? landRow : null;
    }
  }
  return GRID_ROWS - 1;
}

export function canPlaceInColumn(board: Board, col: number): boolean {
  return getStackLandingRow(board, col) !== null;
}

export function canPlaceAnywhere(board: Board): boolean {
  for (let col = 0; col < GRID_COLS; col++) {
    if (canPlaceInColumn(board, col)) return true;
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

/** 配置のみ（マージはアニメーション後に段階実行） */
export function placeDroppedPiece(
  board: Board,
  tile: Tile,
  col: number,
): { board: Board; row: number } | null {
  const row = getStackLandingRow(board, col);
  if (row === null) return null;
  return { board: placePieceAt(board, tile, col, row), row };
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
