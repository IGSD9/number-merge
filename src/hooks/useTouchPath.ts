"use client";

import { useCallback, useRef, useState } from "react";
import { getTileAt, isAdjacent, posToKey } from "@/lib/game/board";
import { canAddToPath } from "@/lib/game/pathValidator";
import type { Board, CellPosition, MergePath } from "@/types/game";

interface UseTouchPathOptions {
  board: Board;
  onMergeComplete: (path: MergePath) => void;
  disabled?: boolean;
}

export function useTouchPath({
  board,
  onMergeComplete,
  disabled = false,
}: UseTouchPathOptions) {
  const [currentPath, setCurrentPath] = useState<MergePath | null>(null);
  const currentPathRef = useRef<MergePath | null>(null);
  const isDraggingRef = useRef(false);

  const updatePath = useCallback((path: MergePath | null) => {
    currentPathRef.current = path;
    setCurrentPath(path);
  }, []);

  const resetPath = useCallback(() => {
    updatePath(null);
    isDraggingRef.current = false;
  }, [updatePath]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent, pos: CellPosition) => {
      if (disabled) return;

      e.preventDefault();
      const tile = getTileAt(board, pos);
      if (!tile) return;

      e.currentTarget.setPointerCapture(e.pointerId);
      isDraggingRef.current = true;
      updatePath({ tiles: [tile], positions: [pos] });
    },
    [board, disabled, updatePath],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent, pos: CellPosition) => {
      if (disabled || !isDraggingRef.current) return;

      const prev = currentPathRef.current;
      if (!prev || prev.positions.length === 0) return;

      const lastPos = prev.positions[prev.positions.length - 1];
      if (lastPos.row === pos.row && lastPos.col === pos.col) return;

      const posKey = posToKey(pos);
      if (prev.positions.some((p) => posToKey(p) === posKey)) return;
      if (!isAdjacent(lastPos, pos)) return;

      const tile = getTileAt(board, pos);
      if (!tile || !canAddToPath(prev.tiles, tile)) return;

      updatePath({
        tiles: [...prev.tiles, tile],
        positions: [...prev.positions, pos],
      });
    },
    [board, disabled, updatePath],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isDraggingRef.current) return;

      isDraggingRef.current = false;

      const path = currentPathRef.current;
      if (path && path.tiles.length >= 2) {
        onMergeComplete(path);
      }

      updatePath(null);

      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // capture されていない場合は無視
      }
    },
    [onMergeComplete, updatePath],
  );

  const onPointerCancel = useCallback(
    (e: React.PointerEvent) => {
      isDraggingRef.current = false;
      updatePath(null);

      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // capture されていない場合は無視
      }
    },
    [updatePath],
  );

  return {
    currentPath,
    pathPositions: currentPath?.positions ?? [],
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
    },
    resetPath,
  };
}
