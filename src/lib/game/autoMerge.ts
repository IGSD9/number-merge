import { cloneBoard, getTileAt, isValidPosition, posToKey } from "@/lib/game/board";
import { applyDownwardGravity } from "@/lib/game/gravity";
import { calculateMergedValue } from "@/lib/game/merge";
import {
  GRID_COLS,
  GRID_ROWS,
  ORTHOGONAL_DIRECTIONS,
  type Board,
  type CellPosition,
  type Tile,
  type TileValue,
} from "@/types/game";

export interface MergeStep {
  group: CellPosition[];
  target: CellPosition;
  center: { row: number; col: number };
  mergedValue: TileValue;
  sourceValue: TileValue;
}

function pickMergeTarget(
  group: CellPosition[],
  preferred?: CellPosition,
): CellPosition {
  if (
    preferred &&
    group.some((p) => p.row === preferred.row && p.col === preferred.col)
  ) {
    return preferred;
  }

  return group.reduce((best, pos) => {
    if (pos.row !== best.row) return pos.row > best.row ? pos : best;
    return pos.col < best.col ? pos : best;
  });
}

export function getGroupCenter(group: CellPosition[]): { row: number; col: number } {
  return {
    row: group.reduce((sum, p) => sum + p.row, 0) / group.length,
    col: group.reduce((sum, p) => sum + p.col, 0) / group.length,
  };
}

/** 縦横のみでつながった同値タイルのグループを取得 */
export function findConnectedSameValueGroup(
  board: Board,
  start: CellPosition,
): CellPosition[] {
  const startTile = getTileAt(board, start);
  if (!startTile) return [];

  const visited = new Set<string>();
  const group: CellPosition[] = [];
  const queue: CellPosition[] = [start];

  while (queue.length > 0) {
    const pos = queue.shift()!;
    const key = posToKey(pos);
    if (visited.has(key)) continue;

    const tile = getTileAt(board, pos);
    if (!tile || tile.value !== startTile.value) continue;

    visited.add(key);
    group.push(pos);

    for (const dir of ORTHOGONAL_DIRECTIONS) {
      const next = { row: pos.row + dir.row, col: pos.col + dir.col };
      if (!isValidPosition(next) || visited.has(posToKey(next))) continue;
      queue.push(next);
    }
  }

  return group;
}

function findFirstMergeableGroup(
  board: Board,
  preferredPos?: CellPosition,
): { group: CellPosition[]; target: CellPosition } | null {
  if (preferredPos && getTileAt(board, preferredPos)) {
    const group = findConnectedSameValueGroup(board, preferredPos);
    if (group.length >= 2) {
      return { group, target: pickMergeTarget(group, preferredPos) };
    }
  }

  const visited = new Set<string>();

  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      const pos = { row, col };
      const key = posToKey(pos);
      if (visited.has(key) || !getTileAt(board, pos)) continue;

      const group = findConnectedSameValueGroup(board, pos);
      for (const member of group) {
        visited.add(posToKey(member));
      }

      if (group.length >= 2) {
        return { group, target: pickMergeTarget(group) };
      }
    }
  }

  return null;
}

export function getNextMergeStep(
  board: Board,
  preferredPos?: CellPosition,
): MergeStep | null {
  const mergeable = findFirstMergeableGroup(board, preferredPos);
  if (!mergeable) return null;

  const tiles: Tile[] = mergeable.group
    .map((pos) => getTileAt(board, pos))
    .filter((tile): tile is Tile => tile !== null);

  if (tiles.length < 2) return null;

  return {
    group: mergeable.group,
    target: mergeable.target,
    center: getGroupCenter(mergeable.group),
    mergedValue: calculateMergedValue(tiles),
    sourceValue: tiles[0].value,
  };
}

export function applyMergeStep(
  board: Board,
  step: MergeStep,
): { board: Board; scoreGain: number } {
  const newBoard = cloneBoard(board);

  for (const pos of step.group) {
    if (pos.row !== step.target.row || pos.col !== step.target.col) {
      newBoard[pos.row][pos.col] = null;
    }
  }

  newBoard[step.target.row][step.target.col] = {
    id: crypto.randomUUID(),
    value: step.mergedValue,
    position: step.target,
  };

  return { board: newBoard, scoreGain: step.mergedValue };
}

/** 即時マージ（テスト・フォールバック用） */
export function resolveAllAutoMerges(
  board: Board,
  droppedPos?: CellPosition,
): { board: Board; scoreGain: number } {
  let currentBoard = board;
  let totalScore = 0;
  let priorityPos = droppedPos;
  let changed = true;

  while (changed) {
    changed = false;
    const step = getNextMergeStep(currentBoard, priorityPos);
    priorityPos = undefined;

    if (step) {
      const result = applyMergeStep(currentBoard, step);
      currentBoard = result.board;
      totalScore += result.scoreGain;
      changed = true;
      currentBoard = applyDownwardGravity(currentBoard);
    }
  }

  return { board: currentBoard, scoreGain: totalScore };
}
