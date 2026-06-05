/** グリッド定数 */
export const GRID_COLS = 5 as const;
export const GRID_ROWS = 6 as const;
export const INITIAL_VALUES = [2, 4, 8, 16] as const;

/** タイルの数値（2の階乗） */
export type TileValue =
  | 2
  | 4
  | 8
  | 16
  | 32
  | 64
  | 128
  | 256
  | 512
  | 1024
  | 2048;

/** グリッド座標 */
export interface CellPosition {
  row: number;
  col: number;
}

/** ボード上の1タイル */
export interface Tile {
  id: string;
  value: TileValue;
  position: CellPosition;
}

/** ボード状態（row-major 2次元配列、null = 空マス） */
export type Board = (Tile | null)[][];

/** 一筆書きパス */
export interface MergePath {
  tiles: Tile[];
  positions: CellPosition[];
}

/** 落下待ちのピース */
export interface FallingPiece {
  tile: Tile;
  col: number;
}

/** ゲーム状態 */
export interface GameState {
  board: Board;
  score: number;
  bestScore: number;
  isGameOver: boolean;
  isAnimating: boolean;
  currentPath: MergePath | null;
  /** 今落とすピース（グリッド上に未配置） */
  currentPiece: FallingPiece | null;
  /** 次に降ってくるピース */
  nextPiece: Tile | null;
}

/** 縦横4方向オフセット */
export const ORTHOGONAL_DIRECTIONS: CellPosition[] = [
  { row: -1, col: 0 },
  { row: 1, col: 0 },
  { row: 0, col: -1 },
  { row: 0, col: 1 },
];

/** @deprecated ORTHOGONAL_DIRECTIONS を使用 */
export const DIRECTIONS = ORTHOGONAL_DIRECTIONS;

/** 落下アニメーション中のピース */
export interface FallingAnimation {
  tile: Tile;
  col: number;
  targetRow: number;
}

/** マージ集約アニメーション */
export interface MergeAnimation {
  sources: { row: number; col: number; value: TileValue }[];
  centerRow: number;
  centerCol: number;
  mergedValue: TileValue;
  targetRow: number;
  targetCol: number;
}

export interface SaveScoreResult {
  success: boolean;
  highScore: number;
  isNewRecord: boolean;
  previousHighScore?: number;
  isLoggedIn?: boolean;
  error?: string;
}

export interface RegistrationInfo {
  isLoggedIn: boolean;
  isOAuthUser: boolean;
  previousHighScore: number;
  displayName: string | null;
}

export interface RankingEntry {
  rank: number;
  userId: string;
  displayName: string;
  highScore: number;
  updatedAt: string;
}
