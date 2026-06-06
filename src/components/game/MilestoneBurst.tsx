"use client";

import { isMilestoneValue } from "@/lib/game/milestone";

interface MilestoneBurstProps {
  value: number;
  left: number;
  top: number;
  size: number;
}

const SPARKLE_OFFSETS = [
  { x: 0.1, y: 0.15 },
  { x: 0.85, y: 0.2 },
  { x: 0.15, y: 0.82 },
  { x: 0.8, y: 0.78 },
];

export function MilestoneBurst({ value, left, top, size }: MilestoneBurstProps) {
  if (!isMilestoneValue(value)) return null;

  return (
    <div
      className="pointer-events-none absolute z-40"
      style={{ left, top, width: size, height: size }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="animate-milestone-ring h-full w-full rounded-lg border-2 border-yellow-300/80" />
      </div>
      {SPARKLE_OFFSETS.map((offset, index) => (
        <div
          key={index}
          className="animate-milestone-sparkle absolute h-1.5 w-1.5 rounded-full bg-yellow-200"
          style={{
            left: size * offset.x,
            top: size * offset.y,
            animationDelay: `${index * 40}ms`,
          }}
        />
      ))}
    </div>
  );
}
