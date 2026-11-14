import { HAIRS, SKINS } from '../shopData';
import type { Look } from '../shop';

/* Pixel-art skin textures drawn as inline SVG so the Minecraft-style character has a real face and outfit. */
export const px = (w: number, h: number, rows: string[], pal: Record<string, string>) => {
  let r = '';
  rows.forEach((row, y) => [...row].forEach((c, x) => { const f = pal[c]; if (f) r += `<rect x='${x}' y='${y}' width='1.02' height='1.02' fill='${f}'/>`; }));
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} ${h}' shape-rendering='crispEdges'>${r}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") center/100% 100% no-repeat`;
};

interface OutfitStyle {
  top: string; sleeve: string; dot: string; belt: string; buckle: string; bottom: string; bottomDot: string; shoes: string;
  pattern: 'dots' | 'vest' | 'coat' | 'hoodie' | 'neon' | 'robe'; sleeves: 'short' | 'long'; legs: 'shorts' | 'pants';
}
const OUTFIT_STYLES: Record<string, OutfitStyle> = {
  default: { top: '#eaa56c', sleeve: '#eaa56c', dot: '#c96f38', belt: '#6b3f1d', buckle: '#f2d27a', bottom: '#2fa36b', bottomDot: '#eaa56c', shoes: '#241a14', pattern: 'dots', sleeves: 'short', legs: 'shorts' },
  hivis: { top: '#f5c518', sleeve: '#5a6678', dot: '#e8eaee', belt: '#3a3a3a', buckle: '#c9ccd2', bottom: '#2b3a55', bottomDot: '#2b3a55', shoes: '#4a3220', pattern: 'vest', sleeves: 'short', legs: 'pants' },
  lab: { top: '#f4f6fa', sleeve: '#f4f6fa', dot: '#c3cddd', belt: '#cfd6e2', buckle: '#aab4c6', bottom: '#3d4a63', bottomDot: '#3d4a63', shoes: '#1d1d22', pattern: 'coat', sleeves: 'long', legs: 'pants' },
  hoodie: { top: '#2d3a66', sleeve: '#2d3a66', dot: '#4a5a9a', belt: '#2d3a66', buckle: '#2d3a66', bottom: '#22232b', bottomDot: '#22232b', shoes: '#f2f2f2', pattern: 'hoodie', sleeves: 'long', legs: 'pants' },
  neon: { top: '#151a2e', sleeve: '#151a2e', dot: '#19e3ff', belt: '#ff3df0', buckle: '#19e3ff', bottom: '#151a2e', bottomDot: '#19e3ff', shoes: '#19e3ff', pattern: 'neon', sleeves: 'long', legs: 'pants' },
  royal: { top: '#7a2fb5', sleeve: '#7a2fb5', dot: '#f2c94c', belt: '#f2c94c', buckle: '#fff2b0', bottom: '#4d1d78', bottomDot: '#f2c94c', shoes: '#f2c94c', pattern: 'robe', sleeves: 'long', legs: 'pants' },
};

const TORSO: Record<OutfitStyle['pattern'], string[]> = {
  dots: ['TTTSSTTT', 'TdTTTTdT', 'TTTdTTTT', 'TTTTTdTT', 'TdTTTTTT', 'TTTTdTTT', 'TTdTTTdT', 'BBBYYBBB', 'NNNNNNNN'],
  vest: ['LTTSSTTL', 'LTTTTTTL', 'LddddddL', 'LTTTTTTL', 'LTTTTTTL', 'LddddddL', 'LTTTTTTL', 'BBBYYBBB', 'NNNNNNNN'],
  coat: ['TTSSSSTT', 'TTdSSdTT', 'TTTdddTT', 'TTTTTTTT', 'TdddTTTT', 'TdTdTTTT', 'TdddTTTT', 'BBBBBBBB', 'NNNNNNNN'],
  hoodie: ['TTddddTT', 'TdTTTTdT', 'TTTTTTTT', 'TTdTTdTT', 'TTdTTdTT', 'TddddddT', 'TdTTTTdT', 'BBBBBBBB', 'NNNNNNNN'],
  neon: ['TTTSSTTT', 'TdTTTTdT', 'TdTTTTdT', 'TTTTTTTT', 'TTBBBBTT', 'TTTTTTTT', 'TdTTTTdT', 'BBBYYBBB', 'NNNNNNNN'],
  robe: ['TTdSSdTT', 'TTdTTdTT', 'TTdTTdTT', 'TTdTTdTT', 'TTdTTdTT', 'TTdTTdTT', 'TTdTTdTT', 'BBBYYBBB', 'TTTTTTTT'],
};

const shade = (hex: string, f: number) => {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v * f))).toString(16).padStart(2, '0');
  return `#${c((n >> 16) & 255)}${c((n >> 8) & 255)}${c(n & 255)}`;
};

export interface Skin {
  headFront: string; headBlink: string; headSide: string; headBack: string; hair: string;
  torsoFront: string; torsoBack: string; torsoSide: string; top: string;
  legFront: string; legSide: string; bottom: string;
  armFront: string; armSide: string; sleeve: string;
  longHair: boolean;
}

const cache = new Map<string, Skin>();

export function buildSkin(look: Look): Skin {
  const key = JSON.stringify(look);
  const hit = cache.get(key);
  if (hit) return hit;
  const o = OUTFIT_STYLES[look.outfit] ?? OUTFIT_STYLES.default;
  const sk = SKINS.find((s) => s.id === look.skin) ?? SKINS[0];
  const hr = HAIRS.find((h) => h.id === look.hair) ?? HAIRS[0];
  const long = look.hairStyle === 'long';

  const pal = { T: o.top, L: o.sleeve, d: o.dot, B: o.belt, Y: o.buckle, N: o.bottom, S: sk.c, s: sk.shade, K: o.shoes, o: o.bottomDot,
    H: hr.main, h: hr.hl, R: hr.brow, G: hr.beard, W: '#f6f1e4', E: '#2a3552', X: '#241a14' };
  const K = '#241a14';
  const palK = { ...pal, K: o.shoes, Z: K };

  const eyes = long ? 'HWESSEWH' : 'SWESSEWS';
  const blink = long ? 'HZZSSZZH' : 'SZZSSZZS';
  const headRows = (e: string) => long
    ? ['HHHHHHHH', 'HhHHHhHH', 'HSSSSSSH', 'HRRSSRRH', e, 'HSSssSSH', look.beard ? 'HGGSSGGH' : 'HSSSSSSH', look.beard ? 'HGGGGGGH' : 'HSsssSSH']
    : ['HHHHHHHH', 'HhHHHhHH', 'HSSSSSSH', 'SRRSSRRS', e, 'SSSssSSS', look.beard ? 'GGGSSGGG' : 'SSSSSSSS', look.beard ? 'GGGGGGGG' : 'SSsssSSS'];

  const front = TORSO[o.pattern];
  const back = front.map((r) => r.replace(/S/g, 'T').replace(/Y/g, o.pattern === 'robe' ? 'Y' : 'B'));
  const legs = o.legs === 'shorts'
    ? ['NNNN', 'NoNN', 'NNNo', 'NNNN', 'SSSS', 'SSSS', 'SSSS', 'KKKK', 'KKKK']
    : ['NNNN', 'NoNN', 'NNNN', 'NNNN', 'NNNN', 'NNNN', 'NNNN', 'KKKK', 'KKKK'];
  const arms = o.sleeves === 'short'
    ? ['LLLL', 'LdLL', 'LLLd', 'LLLL', 'SSSS', 'SSSS', 'SSSS', 'SSSS', 'ssss']
    : ['LLLL', 'LdLL', 'LLLL', 'LLLL', 'LLLL', 'LLLL', 'LLLL', 'SSSS', 'SSSS'];

  const skin: Skin = {
    headFront: px(8, 8, headRows(eyes), pal), headBlink: px(8, 8, headRows(blink), palK),
    headSide: long ? hr.main : look.beard ? `linear-gradient(${hr.main} 0 38%,${sk.c} 38% 66%,${hr.beard} 66%)` : `linear-gradient(${hr.main} 0 38%,${sk.c} 38%)`,
    headBack: hr.main, hair: hr.main,
    torsoFront: px(8, 9, front, pal), torsoBack: px(8, 9, back, pal),
    torsoSide: `linear-gradient(${o.sleeve} 0 78%,${o.belt} 78% 86%,${o.bottom} 86%)`, top: o.top,
    legFront: px(4, 9, legs, palK),
    legSide: o.legs === 'shorts' ? `linear-gradient(${o.bottom} 0 45%,${sk.c} 45% 85%,${o.shoes} 85%)` : `linear-gradient(${o.bottom} 0 85%,${o.shoes} 85%)`,
    bottom: o.bottom,
    armFront: px(4, 9, arms, pal),
    armSide: o.sleeves === 'short' ? `linear-gradient(${o.sleeve} 0 42%,${sk.c} 42%)` : `linear-gradient(${o.sleeve} 0 78%,${sk.c} 78%)`,
    sleeve: o.sleeve,
    longHair: long,
  };
  void shade;
  cache.set(key, skin);
  return skin;
}
