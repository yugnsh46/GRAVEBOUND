import { todayStr } from './data';
import { createStore } from './persist';

/* Real actions the user performs (tick a task, add a note, choose a path, ...) are logged per day. */
const s = createStore<{ days: Record<string, number> }>('gravebound-activity-v1', { days: {} });
export const useActivity = s.useValue;
export const logAction = (n = 1) => s.set((st) => { const d = todayStr(); return { days: { ...st.days, [d]: (st.days[d] ?? 0) + n } }; });

const h = (str: string) => { let x = 0; for (const c of str) x = (x * 31 + c.charCodeAt(0)) >>> 0; return (Math.sin(x) * 10000) % 1; };
export const levelOf = (n: number) => (n <= 0 ? 0 : n <= 2 ? 1 : n <= 4 ? 2 : n <= 6 ? 3 : 4);

export interface Cell { date: string; count: number; level: number; future: boolean }

/** 26 weeks (columns) x 7 days (rows, Sunday first). Seeded demo activity + the user's real logged actions. */
export function buildHeatmap(real: Record<string, number>) {
  const today = todayStr();
  const t = new Date(today + 'T00:00:00Z');
  const start = new Date(t); start.setUTCDate(t.getUTCDate() - t.getUTCDay() - 25 * 7);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const count = (date: string) => {
    const ago = Math.round((t.getTime() - new Date(date + 'T00:00:00Z').getTime()) / 86400000);
    const v = Math.abs(h(date));
    let c = v < 0.32 ? 0 : v < 0.58 ? 1 : v < 0.78 ? 2 : v < 0.92 ? 4 : 7;
    if (ago < 19) c = Math.max(c, 1 + Math.floor(v * 3));   // a visible active streak
    if (ago === 19) c = 0;
    return c + (real[date] ?? 0);
  };
  const weeks: Cell[][] = [];
  let total = 0;
  for (let w = 0; w < 26; w++) {
    const col: Cell[] = [];
    for (let d = 0; d < 7; d++) {
      const dt = new Date(start); dt.setUTCDate(start.getUTCDate() + w * 7 + d);
      const date = fmt(dt);
      const future = date > today;
      const c = future ? 0 : count(date);
      total += c;
      col.push({ date, count: c, level: levelOf(c), future });
    }
    weeks.push(col);
  }
  let streak = 0;
  for (let i = 0; i < 182; i++) {
    const dt = new Date(t); dt.setUTCDate(t.getUTCDate() - i);
    if (count(fmt(dt)) > 0) streak++; else break;
  }
  return { weeks, total, streak };
}

/** Consecutive days (ending today, or yesterday if nothing yet today) with at least one real action by the user. */
export function realStreak(days: Record<string, number>): number {
  const d = new Date(todayStr() + 'T00:00:00Z');
  const key = () => d.toISOString().slice(0, 10);
  if (!(days[key()] > 0)) d.setUTCDate(d.getUTCDate() - 1);
  let n = 0;
  while ((days[key()] ?? 0) > 0) { n++; d.setUTCDate(d.getUTCDate() - 1); }
  return n;
}
