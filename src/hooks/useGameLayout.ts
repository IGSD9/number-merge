"use client";

import { useEffect, useState } from "react";
import { getGameLayout, type GameLayout } from "@/lib/game/layout";

export function useGameLayout(hasNext: boolean): GameLayout {
  const [layout, setLayout] = useState<GameLayout>(() => {
    if (typeof window === "undefined") {
      return getGameLayout(390, hasNext);
    }
    return getGameLayout(window.innerWidth, hasNext);
  });

  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setLayout(getGameLayout(window.innerWidth, hasNext));
      });
    };

    update();
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", update);
    };
  }, [hasNext]);

  return layout;
}
