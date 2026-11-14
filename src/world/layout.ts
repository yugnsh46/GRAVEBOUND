import type { Project } from '../types';

/* ---------------- shared city layout (used by the 3D world, the store and the plot picker) ---------------- */
export const GAP = 760;                                // distance between roads
export const W = 3920;
export const VX = (j: number) => 440 + GAP * j;        // vertical roads (5)
export const HY = (k: number) => 700 + GAP * k;        // horizontal roads
export const ROAD = 100, WALK = 144;
export const LM_Y = 340;
export const LM_X = (i: number) => 400 + 520 * i;      // navigation landmarks (top row)

export type Pt = { x: number; y: number };
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/* default plots: every block holds 4 */
export const plot = (i: number): Pt => {
  const b = Math.floor(i / 4), s = i % 4, bi = b % 4, bj = Math.floor(b / 4);
  return { x: VX(bi) + GAP / 2 + (s % 2 ? 170 : -170), y: HY(bj) + GAP / 2 + (s < 2 ? -160 : 130) };
};

/* a building pad is 230 wide and runs from y-82 to y+122. Two pads must not overlap. */
const MARGIN_X = WALK / 2 + 115;        // keeps the pad off the vertical roads
const MARGIN_TOP = WALK / 2 + 82;       // keeps the pad off the road above
const MARGIN_BOT = WALK / 2 + 122;      // keeps the pad (and its sign) off the road below
export const OVERLAP_X = 240, OVERLAP_Y = 215;

export const posOf = (p: Project, i: number): Pt => p.pos ?? plot(i);

export const rowsFor = (pts: Pt[]) => {
  const k = pts.reduce((m, q) => Math.max(m, Math.floor((q.y - HY(0)) / GAP)), 1);
  return Math.max(2, k + 1);
};

/** Pull any point to the nearest buildable ground (inside a city block, clear of roads and pavements). */
export function snap(x: number, y: number, rows: number): Pt {
  const j = clamp(Math.floor((x - VX(0)) / GAP), 0, 3);
  const k = clamp(Math.floor((y - HY(0)) / GAP), 0, rows - 1);
  return {
    x: Math.round(clamp(x, VX(j) + MARGIN_X, VX(j + 1) - MARGIN_X)),
    y: Math.round(clamp(y, HY(k) + MARGIN_TOP, HY(k + 1) - MARGIN_BOT)),
  };
}

export const collides = (c: Pt, others: Pt[]) => others.some((o) => Math.abs(o.x - c.x) < OVERLAP_X && Math.abs(o.y - c.y) < OVERLAP_Y);

/** First free default plot, scanning block by block. */
export function freeSpot(taken: Pt[]): Pt {
  for (let i = 0; i < 400; i++) { const c = plot(i); if (!collides(c, taken)) return c; }
  return plot(taken.length);
}

/** Give every project a position (older saves and demo data have none). Existing positions are never changed. */
export function withPos(list: Project[]): Project[] {
  const taken: Pt[] = list.filter((p) => p.pos).map((p) => p.pos as Pt);
  return list.map((p, i) => {
    if (p.pos) return p;
    const c = plot(i);
    const pos = collides(c, taken) ? freeSpot(taken) : c;
    taken.push(pos);
    return { ...p, pos };
  });
}

/* One-shot request to move the player (set by the plot picker, consumed by the world loop). */
export const warp: { to: Pt | null } = { to: null };