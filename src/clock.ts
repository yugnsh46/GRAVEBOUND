import { useSyncExternalStore } from 'react';

/* Tiny external store for the in-world clock so only the HUD clock and the world's
   day/night flag re-render, not the whole app. */
const s = { minutes: 10 * 60, paused: false };
const subs = new Set<() => void>();
let timer: number | undefined;
const emit = () => subs.forEach((f) => f());
const ensure = () => {
  if (timer !== undefined) return;
  timer = window.setInterval(() => { if (!s.paused) { s.minutes = (s.minutes + 2) % 1440; emit(); } }, 1000);
};
const subscribe = (f: () => void) => { subs.add(f); ensure(); return () => { subs.delete(f); }; };

export type Phase = 'morning' | 'noon' | 'evening' | 'night';
/* morning 6-11 (soft golden light), noon 11-16 (harsh bright overhead sun), evening 16-19 (orange sunset), night 19-6 */
export const phaseOf = (m: number): Phase => (m >= 19 * 60 || m < 6 * 60 ? 'night' : m < 11 * 60 ? 'morning' : m < 16 * 60 ? 'noon' : 'evening');
export const isNight = (m: number) => phaseOf(m) === 'night';
export const useMinutes = () => useSyncExternalStore(subscribe, () => s.minutes);
export const usePhase = () => useSyncExternalStore(subscribe, () => phaseOf(s.minutes));
export const useNight = () => useSyncExternalStore(subscribe, () => isNight(s.minutes));
export const usePaused = () => useSyncExternalStore(subscribe, () => s.paused);
export const togglePause = () => { s.paused = !s.paused; emit(); };
/** Jump to the middle of the next phase so every look can be seen quickly. */
export const nextPhase = () => {
  const starts: [Phase, number][] = [['morning', 8 * 60], ['noon', 13 * 60], ['evening', 17 * 60 + 30], ['night', 22 * 60]];
  const i = starts.findIndex(([p]) => p === phaseOf(s.minutes));
  s.minutes = starts[(i + 1) % starts.length][1]; emit();
};
export const skipHours = (h: number) => { s.minutes = (s.minutes + h * 60) % 1440; emit(); };

export function clockText(m: number) {
  const h = Math.floor(m / 60), mm = m % 60;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const phase = phaseOf(m).toUpperCase();
  return { time: `${h12}:${String(mm).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`, phase };
}
