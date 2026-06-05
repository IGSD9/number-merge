"use client";

import { useEffect, useState } from "react";
import { getGameLayout, type GameLayout } from "@/lib/game/layout";

const SSR_DEFAULT_WIDTH = 390;

export function useGameLayout(hasNext: boolean): GameLayout {
  const [layout, setLayout] = useState<GameLayout>(() =>
    getGameLayout(SSR_DEFAULT_WIDTH, hasNext),
  );

  useEffect(() => {
    let frame = 0;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const update = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          setLayout(getGameLayout(window.innerWidth, hasNext));
        });
      }, 150);
    };

    setLayout(getGameLayout(window.innerWidth, hasNext));
    window.addEventListener("resize", update);
    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", update);
    };
  }, [hasNext]);

  return layout;
}
