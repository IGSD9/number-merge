import { isAdjacent, posToKey } from "@/lib/game/board";
import type { Tile } from "@/types/game";

export function canAddToPath(currentPath: Tile[], candidateTile: Tile): boolean {
  if (currentPath.length === 0) return true;

  if (currentPath.length === 1) {
    return candidateTile.value === currentPath[0].value;
  }

  const lastTile = currentPath[currentPath.length - 1];
  return (
    candidateTile.value === lastTile.value ||
    candidateTile.value === lastTile.value * 2
  );
}

export function isValidMergePath(path: Tile[]): boolean {
  if (path.length < 2) return false;

  if (path[0].value !== path[1].value) return false;

  const seen = new Set<string>();
  for (const tile of path) {
    const key = posToKey(tile.position);
    if (seen.has(key)) return false;
    seen.add(key);
  }

  for (let i = 1; i < path.length; i++) {
    if (!isAdjacent(path[i - 1].position, path[i].position)) return false;
    if (!canAddToPath(path.slice(0, i), path[i])) return false;
  }

  return true;
}
