"use client";

import { useEffect, useState } from "react";
import { Tile } from "@/components/game/Tile";
import type { MergeAnimation } from "@/types/game";

interface MergeAnimationOverlayProps {
  animation: MergeAnimation;
  cellSize: number;
  gap: number;
  boardPadding: number;
  onComplete: () => void;
}

const MERGE_BASE_MS = 220;

export function MergeAnimationOverlay({
  animation,
  cellSize,
  gap,
  boardPadding,
  onComplete,
}: MergeAnimationOverlayProps) {
  const [converged, setConverged] = useState(false);
  const stride = cellSize + gap;
  const centerX = boardPadding + animation.centerCol * stride + cellSize / 2;
  const centerY = boardPadding + animation.centerRow * stride + cellSize / 2;
  const durationMs = MERGE_BASE_MS + animation.sources.length * 40;

  useEffect(() => {
    setConverged(false);
    const frame = requestAnimationFrame(() => setConverged(true));
    const fallback = setTimeout(onComplete, durationMs + 60);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(fallback);
    };
  }, [animation, durationMs, onComplete]);

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
            className="pointer-events-none absolute z-30 will-change-transform"
            style={{
              width: cellSize,
              height: cellSize,
              left: startX,
              top: startY,
              transform: `translate(${dx}px, ${dy}px) scale(${converged ? 0.75 : 1})`,
              opacity: converged ? 0.85 : 1,
              transition: `transform ${durationMs}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${durationMs}ms ease`,
            }}
            onTransitionEnd={(e) => {
              if (
                e.propertyName === "transform" &&
                index === animation.sources.length - 1
              ) {
                onComplete();
              }
            }}
          >
            <Tile
              tile={{
                id: `merge-${index}`,
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
