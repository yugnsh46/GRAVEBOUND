import { useSyncExternalStore } from 'react';
import { getShop, placeStruct, removeStruct } from './shop';

/**
 * "Placement mode": a bought structure follows the mouse (or sits in front of the player) until the player drops it.
 * Lives outside React so moving the ghost around never re-renders the whole city.
 */
export interface Placing { key: string; x: number; y: number; ok: boolean; follow: boolean; prev: { x: number; y: number } | null }

/** Updated by the world every frame so a new ghost can start right in front of the player. */
export const playerPos = { x: 0, y: 0, face: 90 };

let cur: Placing | null = null;
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());
const subscribe = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };

export const getPlacing = () => cur;
export const usePlacing = () => useSyncExternalStore(subscribe, getPlacing);
export const useIsPlacing = () => useSyncExternalStore(subscribe, () => cur !== null);

export function startPlacing(key: string) {
  if (cur) cancelPlacing();
  const was = getShop().placed.find((p) => p.key === key);
  if (was) removeStruct(key);                       // lift it off the map while it is being moved
  const fa = (playerPos.face * Math.PI) / 180;
  cur = { key, x: playerPos.x + Math.cos(fa) * 90, y: playerPos.y + Math.sin(fa) * 90, ok: true, follow: true, prev: was ? { x: was.x, y: was.y } : null };
  emit();
}

export function updateGhost(x: number, y: number, ok: boolean, follow: boolean) {
  if (!cur) return;
  if (cur.x === x && cur.y === y && cur.ok === ok && cur.follow === follow) return;
  cur = { ...cur, x, y, ok, follow };
  emit();
}

/** Drop the structure where the ghost is. Returns false when the spot is blocked. */
export function commitPlacing(): boolean {
  if (!cur || !cur.ok) return false;
  placeStruct(cur.key, cur.x, cur.y);
  cur = null; emit();
  return true;
}

/** Leave placement mode. A structure that was being moved goes back to where it was. */
export function cancelPlacing() {
  if (!cur) return;
  if (cur.prev) placeStruct(cur.key, cur.prev.x, cur.prev.y);
  cur = null; emit();
}
