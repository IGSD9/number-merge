"use client";

import { useEffect, useRef, useState } from "react";
import { Tile } from "@/components/game/Tile";
import type { MergeAnimation } from "@/types/game";

interface MergeAnimationOverlayProps {
  animation: MergeAnimation;
  cellSize: number;
  gap: number;
  boardPadding: number;
  onComplete: () => void;
}

const MERGE_BASE_MS = 160;

export function MergeAnimationOverlay({
  animation,
  cellSize,
  gap,
  boardPadding,
  onComplete,
}: MergeAnimationOverlayProps) {
  const [converged, setConverged] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const stride = cellSize + gap;
  const centerX = boardPadding + animation.centerCol * stride + cellSize / 2;
  const centerY = boardPadding + animation.centerRow * stride + cellSize / 2;
  const durationMs = MERGE_BASE_MS + animation.sources.length * 30;
  const animationKey = `${animation.targetRow}-${animation.targetCol}-${animation.mergedValue}-${animation.sources.length}`;

  useEffect(() => {
    setConverged(false);
    const frame = requestAnimationFrame(() => setConverged(true));
    const timer = setTimeout(() => {
      onCompleteRef.current();
    }, durationMs + 40);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [animationKey, durationMs]);

  return (
    <>
      {animation.sources.map((source, index) => {
        const startX = boardPadding + source.col * stride;
        const startY = boardPadding + source.row * stride;
        const dx = converged ? centerX - startX - cellSize / 2 : 0;
        const dy = converged ? centerY - startY - cellSize / 2 : 0;

        return (
          <div
            key={`${source.row},${source.col},${index}`}
            className="pointer-events-none absolute z-30"
            style={{
              width: cellSize,
              height: cellSize,
              left: startX,
              top: startY,
              transform: `translate3d(${dx}px, ${dy}px, 0) scale(${converged ? 0.8 : 1})`,
              opacity: converged ? 0.85 : 1,
              transition: converged
                ? `transform ${durationMs}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${durationMs}ms ease`
                : "none",
            }}
          >
            <Tile
              tile={{
                id: `merge-${animationKey}-${index}`,
                value: source.value,
                position: { row: source.row, col: source.col },
              }}
            />
          </div>
        );
      })}
    </>
  );
}
