"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import { MergeAnimationOverlay } from "@/components/game/MergeAnimationOverlay";
import { Tile } from "@/components/game/Tile";
import {
  canPlaceInColumn,
  DEFAULT_DROP_COL,
  getStackLandingRow,
} from "@/lib/game/spawn";
import {
  GRID_COLS,
  GRID_ROWS,
  type Board,
  type CellPosition,
  type FallingAnimation,
  type FallingPiece,
  type MergeAnimation,
  type Tile as TileType,
} from "@/types/game";

interface GameBoardProps {
  board: Board;
  currentPiece: FallingPiece | null;
  nextPiece: TileType | null;
  fallingAnimation: FallingAnimation | null;
  mergeAnimation: MergeAnimation | null;
  onColumnTap: (col: number) => void;
  onFallComplete: () => void;
  onMergeAnimationComplete: () => void;
  isAnimating: boolean;
  isGameOver: boolean;
}

const BOARD_PADDING = 8;
const GAP = 4;
const PREVIEW_ROWS = 1;
const FALL_BASE_MS = 140;
const FALL_PER_ROW_MS = 40;
const SCREEN_PADDING = 32;
const NEXT_GAP = 8;
const NEXT_MIN_WIDTH = 44;

function calcCellSize(viewportWidth: number, hasNext: boolean): number {
  const nextReserve = hasNext ? NEXT_MIN_WIDTH + NEXT_GAP : 0;
  const available =
    viewportWidth -
    SCREEN_PADDING -
    nextReserve -
    BOARD_PADDING * 2 -
    (GRID_COLS - 1) * GAP;
  const fromWidth = Math.floor(available / GRID_COLS);
  return Math.min(Math.max(fromWidth, 44), 64);
}

interface BoardCellProps {
  pos: CellPosition;
  tile: TileType | null;
  isMerging: boolean;
  isGhost: boolean;
  ghostTile: TileType | null;
  canInteract: boolean;
  canDrop: boolean;
  onTap: (col: number) => void;
}

const BoardCell = memo(function BoardCell({
  pos,
  tile,
  isMerging,
  isGhost,
  ghostTile,
  canInteract,
  canDrop,
  onTap,
}: BoardCellProps) {
  return (
    <div
      className={[
        "relative rounded-lg bg-gray-800/60",
        canInteract && canDrop ? "cursor-pointer" : "cursor-default",
      ]
        .filter(Boolean)
        .join(" ")}
      onPointerDown={(e) => {
        e.preventDefault();
        if (!canInteract || !canDrop) return;
        onTap(pos.col);
      }}
    >
      {isGhost && ghostTile ? (
        <Tile tile={ghostTile} isGhost />
      ) : tile && !isMerging ? (
        <Tile tile={tile} />
      ) : null}
    </div>
  );
});

export function GameBoard({
  board,
  currentPiece,
  nextPiece,
  fallingAnimation,
  mergeAnimation,
  onColumnTap,
  onFallComplete,
  onMergeAnimationComplete,
  isAnimating,
  isGameOver,
}: GameBoardProps) {
  const [cellSize, setCellSize] = useState(56);
  const [fallOffset, setFallOffset] = useState(0);
  const onFallCompleteRef = useRef(onFallComplete);
  const onTapRef = useRef(onColumnTap);
  onFallCompleteRef.current = onFallComplete;
  onTapRef.current = onColumnTap;

  useEffect(() => {
    let frame = 0;
    const updateSize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setCellSize(calcCellSize(window.innerWidth, !!nextPiece));
      });
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", updateSize);
    };
  }, [nextPiece]);

  useEffect(() => {
    if (!fallingAnimation) {
      setFallOffset(0);
      return;
    }

    const targetOffset = fallingAnimation.targetRow * (cellSize + GAP);
    setFallOffset(0);

    const raf = requestAnimationFrame(() => {
      setFallOffset(targetOffset);
    });

    const duration = FALL_BASE_MS + fallingAnimation.targetRow * FALL_PER_ROW_MS;
    const timer = setTimeout(() => {
      onFallCompleteRef.current();
    }, duration + 50);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [
    fallingAnimation?.col,
    fallingAnimation?.targetRow,
    fallingAnimation?.tile.id,
    cellSize,
  ]);

  const previewLandingRow =
    currentPiece && canPlaceInColumn(board, DEFAULT_DROP_COL)
      ? getStackLandingRow(board, DEFAULT_DROP_COL)
      : null;

  const boardWidth =
    BOARD_PADDING * 2 + GRID_COLS * cellSize + (GRID_COLS - 1) * GAP;
  const boardHeight =
    BOARD_PADDING * 2 + GRID_ROWS * cellSize + (GRID_ROWS - 1) * GAP;
  const previewHeight = PREVIEW_ROWS * cellSize + (PREVIEW_ROWS - 1) * GAP;

  const fallDurationMs = fallingAnimation
    ? FALL_BASE_MS + fallingAnimation.targetRow * FALL_PER_ROW_MS
    : 0;

  const canInteract = !isGameOver && !isAnimating && !!currentPiece;

  const mergingCells = useMemo(
    () => new Set(mergeAnimation?.sources.map((s) => `${s.row},${s.col}`) ?? []),
    [mergeAnimation],
  );

  const nextPieceSize = Math.max(cellSize * 0.75, NEXT_MIN_WIDTH);

  return (
    <div className="mx-auto flex w-full max-w-full touch-manipulation items-start justify-center gap-2">
      <div className="shrink-0" style={{ width: boardWidth }}>
        <div
          className="relative mb-2"
          style={{ width: boardWidth, height: previewHeight }}
        >
          {currentPiece && (
            <div
              className="absolute rounded-lg bg-gray-800/40 ring-1 ring-indigo-400/50"
              style={{
                width: cellSize,
                height: cellSize,
                left: BOARD_PADDING + DEFAULT_DROP_COL * (cellSize + GAP),
                top: 0,
              }}
            >
              <Tile tile={currentPiece.tile} />
            </div>
          )}
        </div>

        <div
          className="relative touch-none rounded-xl bg-gray-900 p-2 select-none"
          style={{
            width: boardWidth,
            height: boardHeight,
            opacity: isAnimating ? 0.95 : 1,
          }}
        >
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${GRID_COLS}, ${cellSize}px)`,
              gridTemplateRows: `repeat(${GRID_ROWS}, ${cellSize}px)`,
              gap: GAP,
            }}
          >
            {board.map((row, rowIndex) =>
              row.map((tile, colIndex) => {
                const pos = { row: rowIndex, col: colIndex };
                const cellKey = `${rowIndex},${colIndex}`;

                return (
                  <BoardCell
                    key={cellKey}
                    pos={pos}
                    tile={tile}
                    isMerging={mergingCells.has(cellKey)}
                    isGhost={
                      previewLandingRow === rowIndex &&
                      colIndex === DEFAULT_DROP_COL &&
                      !!currentPiece &&
                      canInteract
                    }
                    ghostTile={currentPiece?.tile ?? null}
                    canInteract={canInteract}
                    canDrop={canPlaceInColumn(board, colIndex)}
                    onTap={(col) => onTapRef.current(col)}
                  />
                );
              }),
            )}
          </div>

          {fallingAnimation && (
            <div
              className="pointer-events-none absolute z-20"
              style={{
                width: cellSize,
                height: cellSize,
                left: BOARD_PADDING + fallingAnimation.col * (cellSize + GAP),
                top: BOARD_PADDING,
                transform: `translate3d(0, ${fallOffset}px, 0)`,
                transition:
                  fallDurationMs > 0
                    ? `transform ${fallDurationMs}ms cubic-bezier(0.33, 1, 0.68, 1)`
                    : "none",
              }}
            >
              <Tile tile={fallingAnimation.tile} />
            </div>
          )}

          {mergeAnimation && (
            <MergeAnimationOverlay
              animation={mergeAnimation}
              cellSize={cellSize}
              gap={GAP}
              boardPadding={BOARD_PADDING}
              onComplete={onMergeAnimationComplete}
            />
          )}
        </div>
      </div>

      {nextPiece && (
        <div
          className="flex shrink-0 flex-col items-center pt-0.5"
          style={{ width: nextPieceSize }}
        >
          <span className="mb-1 text-[10px] font-medium tracking-wide text-gray-500">
            NEXT
          </span>
          <div
            className="rounded-lg bg-gray-800/60"
            style={{ width: nextPieceSize, height: nextPieceSize }}
          >
            <Tile tile={nextPiece} size="small" />
          </div>
        </div>
      )}
    </div>
  );
}
