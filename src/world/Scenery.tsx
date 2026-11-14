import { Fragment } from 'react';
import type { ReactNode } from 'react';
import { Box } from '../components/Box3D';
import { STAGES, STATUS, progressOf, stageOf } from '../data';
import { STYLE_KIND, normalizeDesign, tintedGlass } from '../design';
import type { Project } from '../types';

export const hash = (i: number, n = 0) => Math.abs(Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1;
export const strHash = (s: string) => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };

export const at = (x: number, y: number, k = 1): { transform: string } => ({
  transform: k === 1 ? `translate3d(${x}px,${y}px,0)` : `translate3d(${x}px,${y}px,0) scale3d(${k},${k},${k})`,
});
export const win = (trim: string, glass: string) =>
  `linear-gradient(115deg,#ffffff2e 0,transparent 42%),repeating-linear-gradient(0deg,${trim} 0 4px,transparent 4px 14px),repeating-linear-gradient(90deg,${trim} 0 3px,transparent 3px 13px),${glass}`;
export const tone = (hex: string, f: number) => {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v * f))).toString(16).padStart(2, '0');
  return `#${c((n >> 16) & 255)}${c((n >> 8) & 255)}${c(n & 255)}`;
};

/* ---- soft (non-boxy) primitives: flat planes stood up / laid down inside the 3D scene ---- */
export function VPlane({ w, h, z, a = 0, bg, r, x = 0, y = 0, clip }: { w: number; h: number; z: number; a?: number; bg: string; r?: string; x?: number; y?: number; clip?: string }) {
  return <i className="tp" style={{ width: w, height: h, marginLeft: -w / 2, marginTop: -h / 2, background: bg, borderRadius: r, clipPath: clip, transform: `translate3d(${x}px,${y}px,${z + h / 2}px) rotateZ(${a}deg) rotateX(90deg)` }} />;
}
export function HPlane({ w, d, z, bg, x = 0, y = 0, round = true }: { w: number; d: number; z: number; bg: string; x?: number; y?: number; round?: boolean }) {
  return <i className="tp" style={{ width: w, height: d, marginLeft: -w / 2, marginTop: -d / 2, background: bg, borderRadius: round ? '50%' : undefined, transform: `translate3d(${x}px,${y}px,${z}px)` }} />;
}
const Shadow = ({ r }: { r: number }) => <i className="tshadow" style={{ width: r * 2, height: r * 2, marginLeft: -r, marginTop: -r }} />;

/** Pitched roof (ridge along X) made of two sloped planes + two gable triangles. */
export function GableRoof({ w, d, h, rh, roof, wall, over = 5 }: { w: number; d: number; h: number; rh: number; roof: string; wall: string; over?: number }) {
  const half = d / 2 + over, L = Math.hypot(half, rh), th = (Math.atan2(rh, half) * 180) / Math.PI, W2 = w + over * 2;
  const tiles = `repeating-linear-gradient(0deg,#0000002b 0 1px,transparent 1px 6px),linear-gradient(#ffffff26,#0000 70%),${roof}`;
  const slope = (back: boolean) => (
    <i className={`tp rf ${back ? 'b' : ''}`} style={{ left: -W2 / 2, width: W2, height: L, transformOrigin: '50% 0', background: tiles, transform: `translate3d(0,0,${h + rh}px) ${back ? 'rotateZ(180deg) ' : ''}rotateX(${-th}deg)` }} />
  );
  const end = (sx: number) => (
    <i className="tp" style={{ width: d, height: rh, marginLeft: -d / 2, marginTop: -rh / 2, background: wall, clipPath: 'polygon(50% 100%,0 0,100% 0)', transform: `translate3d(${sx * (w / 2)}px,0,${h + rh / 2}px) rotateZ(90deg) rotateX(90deg)` }} />
  );
  return <>{slope(false)}{slope(true)}{end(1)}{end(-1)}</>;
}

/** Half-sphere dome built from crossed semicircles. */
export function Dome({ r, z, bg, cap }: { r: number; z: number; bg: string; cap: string }) {
  return (
    <>
      {[0, 90].map((a) => <VPlane key={a} w={r * 2} h={r} z={z} a={a} bg={bg} r="0 0 50% 50% / 0 0 100% 100%" />)}
      <HPlane w={r * 2} d={r * 2} z={z} bg={`radial-gradient(${cap},${tone(cap, 0.7)})`} />
      <HPlane w={r * 0.9} d={r * 0.9} z={z + r * 0.88} bg={cap} />
    </>
  );
}

export const PALETTES = [
  { wall: '#cfd8e6', trim: '#8c9db8', roof: '#5a6a85' },
  { wall: '#e8d8bd', trim: '#b49b72', roof: '#7d6444' },
  { wall: '#bccab5', trim: '#869982', roof: '#55694f' },
  { wall: '#e0bfb7', trim: '#a47d74', roof: '#7a4f48' },
  { wall: '#b6c4d6', trim: '#6f84a3', roof: '#3f4f6b' },
  { wall: '#d9cfe6', trim: '#9a8bb8', roof: '#5d4f7a' },
  { wall: '#f0e2c2', trim: '#c9a867', roof: '#8c5a2e' },
  { wall: '#c4dcd8', trim: '#6aa59c', roof: '#3d6f68' },
];

/** Window glass colour: lit at night when the project is well tended, murky when neglected. */
export function glassColor(illum: number, night: boolean) {
  if (night) return illum > 70 ? '#ffdc8f' : illum > 40 ? '#b89c60' : illum > 15 ? '#37435c' : '#1d2638';
  return illum > 70 ? '#6fb8ec' : illum > 40 ? '#6b9cc0' : illum > 15 ? '#58718a' : '#465566';
}

export function Tower({ x, y, w, d, h, wall, trim, glass, glow }: { x: number; y: number; w: number; d: number; h: number; wall: string; trim: string; glass: string; glow?: boolean }) {
  const g = win(trim, glass);
  return (
    <div className={`box bld ${glow ? 'glowy' : ''}`} style={at(x, y, 1.3)}>
      <Box w={w} d={d} h={h} c={wall} bg={{ e: g, w: g, s: g, n: g }} />
      <Box w={w + 6} d={d + 6} h={4} z={h} c={trim} />
      <Box w={w * 0.4} d={d * 0.4} h={12} z={h + 4} c={trim} />
      <Box w={3} d={3} h={20} z={h + 16} c="#98a0ae" />
    </div>
  );
}

/** Cottage with a real pitched roof, chimney, door and a front hedge. */
export function House({ x, y, pal, glass, glow, night }: { x: number; y: number; pal: typeof PALETTES[number]; glass: string; glow?: boolean; night: boolean }) {
  const g = win(pal.trim, glass);
  return (
    <div className={`box bld ${glow ? 'glowy' : ''}`} style={at(x, y, 1.35)}>
      <Box w={64} d={48} h={28} c={pal.wall} bg={{ s: g, e: g, w: g }} />
      <GableRoof w={64} d={48} h={28} rh={22} roof={pal.roof} wall={pal.wall} />
      <Box w={7} d={7} h={22} x={18} y={-8} z={28} c="#7a625a" />
      <Box w={12} d={2} h={18} y={24} c="#4a3426" />
      <Box w={60} d={4} h={5} y={34} c={night ? '#24432f' : '#5d9a4a'} />
      <Bush x={-34} y={32} night={night} /><Bush x={34} y={32} night={night} />
    </div>
  );
}

/** Slim high-rise with set-backs and a spire. */
export function Skyscraper({ x, y, h, pal, glass, glow }: { x: number; y: number; h: number; pal: typeof PALETTES[number]; glass: string; glow?: boolean }) {
  const g = win(pal.trim, glass);
  return (
    <div className={`box bld ${glow ? 'glowy' : ''}`} style={at(x, y, 1.3)}>
      <Box w={66} d={52} h={h * 0.62} c={pal.wall} bg={{ e: g, w: g, s: g, n: g }} />
      <Box w={70} d={56} h={4} z={h * 0.62} c={pal.trim} />
      <Box w={50} d={40} h={h * 0.26} z={h * 0.62 + 4} c={pal.wall} bg={{ e: g, w: g, s: g, n: g }} />
      <Box w={54} d={44} h={4} z={h * 0.88 + 4} c={pal.trim} />
      <Box w={32} d={26} h={h * 0.12} z={h * 0.88 + 8} c={pal.wall} bg={{ e: g, w: g, s: g, n: g }} />
      <Box w={3} d={3} h={26} z={h + 8} c="#98a0ae" />
      <Box w={24} d={2} h={14} y={26} c="#2b3040" />
    </div>
  );
}

/** Wide flat-roofed apartment block with balconies and a rooftop tank. */
export function Apartment({ x, y, pal, glass, glow }: { x: number; y: number; pal: typeof PALETTES[number]; glass: string; glow?: boolean }) {
  const g = win(pal.trim, glass);
  return (
    <div className={`box bld ${glow ? 'glowy' : ''}`} style={at(x, y, 1.3)}>
      <Box w={92} d={54} h={64} c={pal.wall} bg={{ e: g, w: g, s: g, n: g }} />
      <Box w={96} d={58} h={4} z={64} c={pal.trim} />
      {[-28, 0, 28].map((bx) => [18, 40].map((bz) => <Box key={`${bx}-${bz}`} w={20} d={8} h={3} x={bx} y={31} z={bz} c={pal.trim} />))}
      <Box w={14} d={14} h={12} x={-26} y={-8} z={68} c="#8b93a0" /><Box w={10} d={10} h={7} x={26} y={6} z={68} c="#a2aab6" />
      <Box w={22} d={2} h={14} y={28} c="#2b3040" />
    </div>
  );
}

/** Street-front shop with a striped awning. */
export function Shop({ x, y, pal, glass, glow, night }: { x: number; y: number; pal: typeof PALETTES[number]; glass: string; glow?: boolean; night: boolean }) {
  const g = win(pal.trim, glass);
  return (
    <div className={`box bld ${glow ? 'glowy' : ''}`} style={at(x, y, 1.35)}>
      <Box w={84} d={50} h={32} c={pal.wall} bg={{ e: g, w: g, n: g, s: `linear-gradient(#ffffff40,transparent 40%),${glass}` }} />
      <Box w={88} d={54} h={4} z={32} c={pal.roof} />
      <Box w={44} d={4} h={12} y={20} z={36} c="#1a2236" />
      <i className="tp rf" style={{ left: -42, width: 84, height: 20, transformOrigin: '50% 0', background: 'repeating-linear-gradient(90deg,#d8483b 0 10px,#f4efe2 10px 20px)', transform: 'translate3d(0,26px,26px) rotateX(-38deg)' }} />
      <Box w={4} d={4} h={26} x={-40} y={40} c="#4a4f5c" /><Box w={4} d={4} h={26} x={40} y={40} c="#4a4f5c" />
      <Box w={60} d={4} h={4} y={44} c={night ? '#24432f' : '#5d9a4a'} />
    </div>
  );
}

/** L-shaped villa: pitched wing + flat wing. */
export function Villa({ x, y, pal, glass, glow }: { x: number; y: number; pal: typeof PALETTES[number]; glass: string; glow?: boolean }) {
  const g = win(pal.trim, glass);
  return (
    <div className={`box bld ${glow ? 'glowy' : ''}`} style={at(x, y, 1.3)}>
      <Box w={70} d={44} h={30} x={8} y={6} c={pal.wall} bg={{ s: g, e: g, w: g }} />
      <div className="box" style={{ transform: 'translate3d(8px,6px,0)' }}><GableRoof w={70} d={44} h={30} rh={20} roof={pal.roof} wall={pal.wall} /></div>
      <Box w={38} d={38} h={40} x={-40} y={-4} c={pal.wall} bg={{ s: g, w: g, n: g }} />
      <Box w={44} d={44} h={5} x={-40} y={-4} z={40} c={pal.trim} />
      <Box w={10} d={2} h={16} x={8} y={28} c="#4a3426" />
    </div>
  );
}

/** Round-domed observatory. */
export function Observatory({ x, y, pal, glass, glow }: { x: number; y: number; pal: typeof PALETTES[number]; glass: string; glow?: boolean }) {
  const g = win(pal.trim, glass);
  return (
    <div className={`box bld ${glow ? 'glowy' : ''}`} style={at(x, y, 1.3)}>
      <Box w={64} d={56} h={34} c={pal.wall} bg={{ e: g, w: g, s: g, n: g }} />
      <Box w={68} d={60} h={4} z={34} c={pal.trim} />
      <Dome r={24} z={38} bg={`linear-gradient(90deg,${tone(pal.trim, 0.85)},${tone(pal.trim, 1.3)} 50%,${tone(pal.trim, 0.85)})`} cap={tone(pal.trim, 1.25)} />
      <Box w={16} d={2} h={14} y={28} c="#2b3040" />
    </div>
  );
}

export function Bush({ x, y, night, s = 1 }: { x: number; y: number; night: boolean; s?: number }) {
  const mid = night ? '#1f5236' : '#3f9a4a';
  const blob = `radial-gradient(ellipse at 40% 60%,${tone(mid, 1.35)} 0,${mid} 55%,${tone(mid, 0.7)} 100%)`;
  return (
    <div className="box" style={at(x, y)}>
      <Shadow r={12 * s} />
      {[0, 90].map((a) => <VPlane key={a} w={20 * s} h={13 * s} z={0} a={a} bg={blob} r="50%" />)}
      <HPlane w={16 * s} d={16 * s} z={11 * s} bg={blob} />
    </div>
  );
}

/** Round leafy tree: crossed canopy discs read as a soft sphere from any camera angle. */
function Oak({ x, y, night, s, v }: { x: number; y: number; night: boolean; s: number; v: number }) {
  const mid = night ? '#1f5236' : ['#3f9a4a', '#4aa356', '#368a44', '#58a84a'][v % 4];
  const blob = `radial-gradient(ellipse at 38% 62%,${tone(mid, 1.35)} 0,${mid} 52%,${tone(mid, 0.68)} 100%)`;
  const bark = `linear-gradient(90deg,#4a2f1a,#6b4526 50%,#4a2f1a)`;
  return (
    <div className="box" style={at(x, y)}>
      <Shadow r={24 * s} />
      <VPlane w={7 * s} h={20 * s} z={0} a={0} bg={bark} /><VPlane w={7 * s} h={20 * s} z={0} a={90} bg={bark} />
      {[0, 90].map((a) => <VPlane key={a} w={36 * s} h={32 * s} z={13 * s} a={a} bg={blob} r="50%" />)}
      <HPlane w={30 * s} d={30 * s} z={27 * s} bg={blob} /><HPlane w={34 * s} d={34 * s} z={40 * s} bg={blob} />
    </div>
  );
}

/** Soft conifer: layered crossed triangles with round tier discs. */
function Conifer({ x, y, night, s, v }: { x: number; y: number; night: boolean; s: number; v: number }) {
  const mid = night ? ['#17402c', '#1d5238'][v % 2] : ['#2c8240', '#2f8a56'][v % 2];
  const side = `linear-gradient(90deg,${tone(mid, 0.66)},${tone(mid, 1.25)} 50%,${tone(mid, 0.66)})`;
  const disc = `radial-gradient(${tone(mid, 1.3)},${mid} 60%,${tone(mid, 0.7)})`;
  const bark = `linear-gradient(90deg,#3f2916,#5b3d22 50%,#3f2916)`;
  const tiers = [{ z: 8, w: 32, h: 26 }, { z: 22, w: 25, h: 25 }, { z: 36, w: 18, h: 24 }];
  return (
    <div className="box" style={at(x, y)}>
      <Shadow r={22 * s} />
      <VPlane w={6 * s} h={14 * s} z={0} a={0} bg={bark} /><VPlane w={6 * s} h={14 * s} z={0} a={90} bg={bark} />
      {tiers.map((t, i) => (
        <Fragment key={i}>
          {[0, 90].map((a) => <VPlane key={a} w={t.w * s} h={t.h * s} z={t.z * s} a={a} bg={side} clip="polygon(50% 100%,0 0,100% 0)" />)}
          <HPlane w={t.w * 0.85 * s} d={t.w * 0.85 * s} z={t.z * s + 2} bg={disc} />
        </Fragment>
      ))}
    </div>
  );
}

export function Pine({ x, y, night, s = 1 }: { x: number; y: number; night: boolean; s?: number }) {
  const v = Math.floor(hash(x * 0.013 + 1, y * 0.017 + 2) * 10);
  return v < 4 ? <Oak x={x} y={y} night={night} s={s} v={v} /> : <Conifer x={x} y={y} night={night} s={s} v={v} />;
}

export function Lamp({ x, y, night }: { x: number; y: number; night: boolean }) {
  return (
    <div className="box" style={at(x, y)}>
      <Box w={4} d={4} h={52} c="#1c2029" />
      <div className={night ? 'emit' : ''}><Box w={13} d={13} h={10} z={50} c={night ? '#ffe3a1' : '#d4d6cc'} /></div>
      <Box w={17} d={17} h={4} z={60} c="#1c2029" />
    </div>
  );
}

export function Rock({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  const g = 'radial-gradient(ellipse at 40% 60%,#b4bbc6 0,#8b93a0 60%,#656d7a 100%)';
  return (
    <div className="box rockp" style={at(x, y)}>
      <Shadow r={22 * s} />
      {[0, 90].map((a) => <VPlane key={a} w={34 * s} h={16 * s} z={0} a={a} bg={g} r="50% 50% 38% 38%" />)}
      <HPlane w={26 * s} d={20 * s} z={13 * s} bg={g} />
    </div>
  );
}

/** Small pond for park plots. */
export function Pond({ x, y }: { x: number; y: number }) {
  return (
    <div className="box pondp" style={at(x, y)}>
      <HPlane w={86} d={64} z={1.2} bg="radial-gradient(#8fd8f2,#4aa8d6 70%,#c9bd96 72%)" />
      <div className="emit"><HPlane w={34} d={22} z={1.8} x={-8} y={-4} bg="radial-gradient(#ffffff55,#0000 70%)" /></div>
    </div>
  );
}

export function Cone({ x, y }: { x: number; y: number }) {
  return <div className="box" style={at(x, y)}><Box w={8} d={8} h={4} c="#2b2b2b" /><Box w={6} d={6} h={11} z={4} c="#f0902a" /></div>;
}

/** Street sign / info board showing the project name and build progress. */
export function Sign({ x, y, p, night }: { x: number; y: number; p: Project; night: boolean }) {
  const pr = progressOf(p);
  const st = STAGES[stageOf(pr)];
  return (
    <div className="box bld" style={at(x, y, 1.2)}>
      <Box w={3} d={3} h={22} x={-24} c="#1c2029" />
      <Box w={3} d={3} h={22} x={24} c="#1c2029" />
      <Box w={64} d={3} h={26} z={20} c="#0e1526"
        front={<div className="plate"><b>{p.name}</b><i><u style={{ width: `${pr}%`, background: st.color }} /></i><span>{pr}% · {st.short}</span></div>} />
      <div className={night ? 'emit' : ''}><Box w={7} d={7} h={5} z={46} c={STATUS[p.status].color} /></div>
    </div>
  );
}

const Pad = ({ w, d, x, y, c }: { w: number; d: number; x: number; y: number; c?: string }) => (
  <div className="pad" style={{ left: x - w / 2, top: y - d / 2, width: w, height: d, ...(c ? { background: c } : {}) }} />
);

/** A project's building. Its construction stage follows progress; neglect dims windows and grows moss/vines.
 *  The owner's design (style, colours, glass, size, height, garden, lamps, beacon) is applied on top. */
export function ProjectBuilding({ p, x, y, illum, night }: { p: Project; x: number; y: number; illum: number; night: boolean }) {
  const d = normalizeDesign(p.design);
  const pr = progressOf(p);
  const stage = stageOf(pr);
  const base = PALETTES[strHash(p.id) % PALETTES.length];
  const pal = { wall: d.wall ?? base.wall, trim: d.trim ?? base.trim, roof: d.roof ?? base.roof };
  const cap = d.roof ?? base.trim;   // dome / stepped-top colour: trim when automatic (as before), roof when customised
  const archived = p.status === 'archived';
  const wall = archived ? '#aeb4bf' : pal.wall;
  const glass = tintedGlass(d.glass, illum, night, glassColor(illum, night));
  const g = win(pal.trim, glass);
  const glow = night && illum > 40;
  const moss = night ? '#245a3a' : '#4a8f4f';
  const hm = d.height;
  const H = (stage === 3 ? 66 + Math.round((pr - 80) * 3) + (strHash(p.id) % 26) : 20 + pr * 0.7) * (stage >= 2 ? hm : 1);
  const kind = d.style === 'auto' ? strHash(p.id) % 5 : STYLE_KIND[d.style];
  let top = 40;   // height of the highest point, so the beacon can sit on it

  let body: ReactNode;
  if (stage === 0) {
    top = 24;
    body = (<>
      <Box w={70} d={46} h={8} c="#6a4a2e" bg={{ t: '#7e5a36' }} />
      <Box w={40} d={30} h={5} x={-6} y={-2} z={8} c="#59402a" />
      <Box w={24} d={20} h={16} x={-26} y={-4} c="#5d6672" />
      <Box w={18} d={18} h={10} x={24} y={8} c="#8a5a36" />
      <Box w={44} d={3} h={9} x={-30} y={46} c="#8b5a2b" /><Box w={44} d={3} h={9} x={30} y={46} c="#8b5a2b" />
      <Cone x={-58} y={46} /><Cone x={58} y={40} />
    </>);
  } else if (stage === 1) {
    top = 36 + pr * 0.4 + 12;
    body = (<>
      <Box w={96} d={74} h={6} c="#9aa1ab" bg={{ t: '#aab1bb' }} />
      {[[-36, -26], [36, -26], [-36, 26], [36, 26]].map(([cx, cy], i) => <Box key={i} w={7} d={7} h={30 + pr * 0.4} x={cx} y={cy} z={6} c={d.trim ?? '#c3c8d0'} />)}
      <Box w={76} d={5} h={5} y={26} z={36 + pr * 0.4} c="#d08a3a" />
      <Box w={30} d={20} h={12} x={-20} y={0} z={6} c="#7a828f" />
      <Cone x={-56} y={48} />
    </>);
  } else if (stage === 2) {
    top = H + 24;
    body = (<>
      <Box w={84} d={64} h={H} c={wall} bg={{ e: g, w: g, s: g, n: g }} />
      <Box w={84} d={64} h={4} z={H} c={d.trim ?? '#8a919d'} />
      {[[-42, 32], [42, 32]].map(([cx, cy], i) => <Box key={i} w={4} d={4} h={H + 22} x={cx} y={cy} c="#e0902a" />)}
      <Box w={88} d={3} h={4} y={34} z={H + 12} c="#e0902a" />
      <Box w={22} d={2} h={14} y={33} c="#3a2a20" />
      <Cone x={-58} y={46} />
    </>);
  } else {
    const flagAt = (z: number) => p.status === 'resurrected' && <div className="emit"><Box w={9} d={9} h={9} z={z} c="#58e08a" /></div>;
    const door = <Box w={22} d={2} h={16} y={32} c="#2b3040" />;
    if (kind === 1) {
      top = H * 1.12 + 30;
      body = (<>
        <Box w={84} d={64} h={H * 0.62} c={wall} bg={{ e: g, w: g, s: g, n: g }} />
        <Box w={88} d={68} h={4} z={H * 0.62} c={pal.trim} />
        <Box w={58} d={44} h={H * 0.5} z={H * 0.62 + 4} c={wall} bg={{ e: g, w: g, s: g, n: g }} />
        <Box w={62} d={48} h={4} z={H * 1.12 + 4} c={cap} />
        <Box w={3} d={3} h={22} z={H * 1.12 + 8} c="#98a0ae" />
        {door}
        {flagAt(H * 1.12 + 30)}
      </>);
    } else if (kind === 2) {
      const hh = Math.max(40, H * 0.55);
      top = hh + 36;
      body = (<>
        <Box w={86} d={60} h={hh} c={wall} bg={{ e: g, w: g, s: g, n: g }} />
        <GableRoof w={86} d={60} h={hh} rh={30} roof={pal.roof} wall={wall} />
        <Box w={9} d={9} h={26} x={26} y={-12} z={hh} c="#7a625a" />
        {door}
        {flagAt(hh + 36)}
      </>);
    } else if (kind === 3) {
      top = H * 1.3 + 50;
      body = (<>
        <Box w={92} d={66} h={14} c={pal.trim} />
        <Box w={58} d={52} h={H * 1.3} z={14} c={wall} bg={{ e: g, w: g, s: g, n: g }} />
        <Box w={64} d={58} h={5} z={H * 1.3 + 14} c={pal.roof} />
        <Box w={3} d={3} h={30} z={H * 1.3 + 19} c="#98a0ae" />
        {door}
        {flagAt(H * 1.3 + 50)}
      </>);
    } else if (kind === 4) {
      top = H * 0.5 + 36;
      body = (<>
        <Box w={72} d={62} h={H * 0.5} c={wall} bg={{ e: g, w: g, s: g, n: g }} />
        <Box w={78} d={68} h={4} z={H * 0.5} c={pal.trim} />
        <Dome r={26} z={H * 0.5 + 4} bg={`linear-gradient(90deg,${tone(cap, 0.85)},${tone(cap, 1.3)} 50%,${tone(cap, 0.85)})`} cap={tone(cap, 1.25)} />
        <Box w={26} d={26} h={H * 0.34} x={-52} y={8} c={wall} bg={{ e: g, w: g, s: g, n: g }} />
        {door}
        {flagAt(H * 0.5 + 34)}
      </>);
    } else {
      top = H + 44;
      body = (<>
        <Box w={80} d={62} h={H} c={wall} bg={{ e: g, w: g, s: g, n: g }} />
        <Box w={88} d={70} h={5} z={H} c={pal.trim} />
        <Box w={32} d={26} h={14} z={H + 5} c={pal.roof} />
        <Box w={3} d={3} h={22} z={H + 19} c="#98a0ae" />
        {door}
        <Box w={90} d={4} h={4} y={34} c={pal.trim} />
        {flagAt(H + 28)}
      </>);
    }
  }

  const hedge = night ? '#24432f' : '#4f9a47';
  return (
    <div className={`box bld ${glow ? 'glowy' : ''}`} style={at(x, y, 1.3 * d.size)}>
      {body}
      {illum < 45 && <Box w={stage === 0 ? 76 : 92} d={stage === 0 ? 52 : 74} h={4} c={moss} />}
      {illum < 15 && <>
        <Box w={7} d={7} h={26} x={-40} y={32} c="#2b6a3a" /><Box w={7} d={7} h={38} x={38} y={30} c="#2b6a3a" /><Box w={6} d={6} h={20} x={-6} y={34} c="#347a44" />
      </>}
      {d.garden && <>
        <Box w={26} d={6} h={7} x={-30} y={46} c={hedge} /><Box w={26} d={6} h={7} x={30} y={46} c={hedge} />
        <Box w={6} d={34} h={6} x={-50} y={26} c={hedge} /><Box w={6} d={34} h={6} x={50} y={26} c={hedge} />
        <Bush x={-56} y={50} night={night} s={0.9} /><Bush x={56} y={50} night={night} s={0.9} />
        {['#e5483b', '#f5c518', '#ff7ab8', '#ffffff', '#b57bff'].map((c, i) => <Box key={i} w={3.5} d={3.5} h={4} x={-16 + i * 8} y={53} z={0} c={c} />)}
      </>}
      {d.lamps && <><Lamp x={-70} y={44} night={night} /><Lamp x={70} y={44} night={night} /></>}
      {d.beacon && stage >= 1 && <div className="emit">
        <Box w={7} d={7} h={7} z={top} c="#8cecff" />
        <Box w={3} d={3} h={44} z={top + 7} c="#8cecff99" />
      </div>}
    </div>
  );
}

export { Pad };
