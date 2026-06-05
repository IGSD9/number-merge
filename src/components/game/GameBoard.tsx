"use client";

import { useEffect, useRef, useState } from "react";
import { MergePathOverlay } from "@/components/game/MergePathOverlay";
import { Tile } from "@/components/game/Tile";
import { posToKey } from "@/lib/game/board";
import { GRID_COLS, GRID_ROWS, type Board, type CellPosition, type MergePath } from "@/types/game";

interface GameBoardProps {
  board: Board;
  currentPath: MergePath | null;
  onPointerDown: (e: React.PointerEvent, pos: CellPosition) => void;
  onPointerMove: (e: React.PointerEvent, pos: CellPosition) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  onPointerCancel: (e: React.PointerEvent) => void;
  isAnimating: boolean;
}

const BOARD_PADDING = 8;
const GAP = 4;

export function GameBoard({
  board,
  currentPath,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  isAnimating,
}: GameBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(56);

  useEffect(() => {
    const updateSize = () => {
      const width = Math.min((window.innerWidth - 32) / GRID_COLS, 64);
      setCellSize(width);
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const selectedKeys = new Set(
    currentPath?.positions.map((pos) => posToKey(pos)) ?? [],
  );
  const mergeTargetKey = currentPath?.positions.length
    ? posToKey(currentPath.positions[currentPath.positions.length - 1])
    : null;

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!boardRef.current) return;

    const rect = boardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - BOARD_PADDING;
    const y = e.clientY - rect.top - BOARD_PADDING;
    const col = Math.floor(x / (cellSize + GAP));
    const row = Math.floor(y / (cellSize + GAP));

    if (row < 0 || row >= GRID_ROWS || col < 0 || col >= GRID_COLS) return;
    onPointerMove(e, { row, col });
  };

  return (
    <div className="relative mx-auto w-fit">
      <div
        ref={boardRef}
        className="relative touch-none rounded-xl bg-gray-900 p-2 select-none"
        style={{
          width: BOARD_PADDING * 2 + GRID_COLS * cellSize + (GRID_COLS - 1) * GAP,
          height: BOARD_PADDING * 2 + GRID_ROWS * cellSize + (GRID_ROWS - 1) * GAP,
          opacity: isAnimating ? 0.9 : 1,
        }}
        onPointerMove={handlePointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
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
              const key = posToKey(pos);

              return (
                <div
                  key={key}
                  className="rounded-lg bg-gray-800/60"
                  onPointerDown={(e) => onPointerDown(e, pos)}
                >
                  {tile ? (
                    <Tile
                      tile={tile}
                      isSelected={selectedKeys.has(key)}
                      isMergeTarget={mergeTargetKey === key}
                    />
                  ) : null}
                </div>
              );
            }),
          )}
        </div>

        {currentPath && (
          <MergePathOverlay
            path={currentPath}
            cellSize={cellSize + GAP}
            boardPadding={BOARD_PADDING}
          />
        )}
      </div>
    </div>
  );
}
