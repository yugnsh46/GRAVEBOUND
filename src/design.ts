import type { BuildingDesign, BuildingStyle, GlassTint } from './types';

export const STYLES: { id: BuildingStyle; name: string; icon: string; hint: string }[] = [
  { id: 'auto', name: 'Auto', icon: '✨', hint: 'Let the city pick for you' },
  { id: 'tower', name: 'Tower', icon: '🏢', hint: 'Classic flat-roof tower' },
  { id: 'stepped', name: 'Stepped', icon: '🏬', hint: 'Two tiers with an antenna' },
  { id: 'cottage', name: 'Cottage', icon: '🏠', hint: 'Pitched roof and chimney' },
  { id: 'podium', name: 'Podium', icon: '🏙️', hint: 'Slim tower on a wide base' },
  { id: 'dome', name: 'Domed hall', icon: '🕌', hint: 'Round dome and side wing' },
];

/** Which of the five finished-building shapes (see Scenery.tsx) every named style uses. */
export const STYLE_KIND: Record<Exclude<BuildingStyle, 'auto'>, number> = { tower: 0, stepped: 1, cottage: 2, podium: 3, dome: 4 };

/** Ready-made colour sets: wall / trim / roof. */
export const PRESETS: { name: string; wall: string; trim: string; roof: string }[] = [
  { name: 'Slate', wall: '#cfd8e6', trim: '#8c9db8', roof: '#5a6a85' },
  { name: 'Sand', wall: '#e8d8bd', trim: '#b49b72', roof: '#7d6444' },
  { name: 'Sage', wall: '#bccab5', trim: '#869982', roof: '#55694f' },
  { name: 'Rose', wall: '#e0bfb7', trim: '#a47d74', roof: '#7a4f48' },
  { name: 'Ocean', wall: '#b6c4d6', trim: '#6f84a3', roof: '#3f4f6b' },
  { name: 'Lilac', wall: '#d9cfe6', trim: '#9a8bb8', roof: '#5d4f7a' },
  { name: 'Sun', wall: '#f0e2c2', trim: '#c9a867', roof: '#8c5a2e' },
  { name: 'Mint', wall: '#c4dcd8', trim: '#6aa59c', roof: '#3d6f68' },
  { name: 'Neon', wall: '#2a2f45', trim: '#19d3da', roof: '#ff4fa3' },
  { name: 'Coral', wall: '#ff9b85', trim: '#ffe0a3', roof: '#c4483a' },
  { name: 'Forest', wall: '#3f6b4f', trim: '#d9c27a', roof: '#25402f' },
  { name: 'Graphite', wall: '#5a6070', trim: '#e0b341', roof: '#2a2e3a' },
];

export const TINTS: { id: GlassTint; name: string; c: string }[] = [
  { id: 'auto', name: 'Auto', c: '#8fb7d6' },
  { id: 'blue', name: 'Blue', c: '#6fb8ec' },
  { id: 'gold', name: 'Gold', c: '#ffd27a' },
  { id: 'teal', name: 'Teal', c: '#4fd1c5' },
  { id: 'rose', name: 'Rose', c: '#f08fb0' },
];

export const SIZE_RANGE = { min: 0.8, max: 1.3, step: 0.05 };
export const HEIGHT_RANGE = { min: 0.7, max: 1.6, step: 0.05 };

export const defaultDesign = (): BuildingDesign => ({
  style: 'auto', glass: 'auto', size: 1, height: 1, garden: false, lamps: false, beacon: false,
});

/** Fills in anything missing so old saved projects (which have no design) keep working. */
export const normalizeDesign = (d?: Partial<BuildingDesign>): BuildingDesign => ({ ...defaultDesign(), ...(d ?? {}) });

const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
export function randomDesign(): BuildingDesign {
  const pr = pick(PRESETS);
  return {
    style: pick(STYLES.filter((s) => s.id !== 'auto')).id,
    wall: pr.wall, trim: pr.trim, roof: pr.roof,
    glass: pick(TINTS).id,
    size: Math.round((0.9 + Math.random() * 0.3) * 20) / 20,
    height: Math.round((0.8 + Math.random() * 0.6) * 20) / 20,
    garden: Math.random() > 0.4, lamps: Math.random() > 0.5, beacon: Math.random() > 0.5,
  };
}

/** True when the design differs from the automatic look. */
export const isCustom = (d?: BuildingDesign) => {
  if (!d) return false;
  const b = defaultDesign();
  return d.style !== b.style || !!d.wall || !!d.trim || !!d.roof || d.glass !== b.glass || d.size !== b.size || d.height !== b.height || d.garden || d.lamps || d.beacon;
};

const toneHex = (hex: string, f: number) => {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v * f))).toString(16).padStart(2, '0');
  return `#${c((n >> 16) & 255)}${c((n >> 8) & 255)}${c(n & 255)}`;
};

/** Window colour for a chosen glass tint. Neglect (low illumination) still dims it; `fallback` is the automatic colour. */
export function tintedGlass(tint: GlassTint, illum: number, night: boolean, fallback: string): string {
  if (tint === 'auto' || illum <= 15 || (night && illum <= 40)) return fallback;
  const c = TINTS.find((t) => t.id === tint)?.c ?? fallback;
  if (night) return illum > 70 ? toneHex(c, 1.15) : toneHex(c, 0.62);
  return illum > 70 ? c : illum > 40 ? toneHex(c, 0.84) : toneHex(c, 0.62);
}
