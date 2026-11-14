import type { ReactNode } from 'react';
import { Box } from '../components/Box3D';
import { Bush, Dome, GableRoof, VPlane, at, tone, win } from './Scenery';

/* Premium landmark buildings: one distinct, hand-built landmark for every navigation button.
   They stand on marble plinths with gold trim, so they never look like the plain project buildings. */

export type LandmarkSpec = { id: string; label: string; hint: string; icon: string; color: string; x: number; y: number };

const MARBLE = '#ece6d8', MARBLE_D = '#cdc5b1', GOLD = '#e2b84a', GOLD_L = '#f6dc86', NAVY = '#0e1a33';
const clockFace = 'linear-gradient(#222,#222) 50% 24%/2px 28% no-repeat,linear-gradient(#222,#222) 64% 50%/22% 2px no-repeat,radial-gradient(circle,#fffbe8 0 55%,#2b2b2b 56% 62%,#d9c9a0 63%)';

/** Raised marble base with a gold rim. Everything standing on it is lifted by BASE_Z. */
const BASE_Z = 9;
const Plinth = ({ w, d }: { w: number; d: number }) => (
  <>
    <Box w={w + 16} d={d + 16} h={3} c={MARBLE_D} bg={{ t: '#d2cab6' }} />
    <Box w={w + 11} d={d + 11} h={2} z={3} c={GOLD} />
    <Box w={w + 5} d={d + 5} h={4} z={5} c={MARBLE} bg={{ t: '#f3eee1' }} />
  </>
);
const Lift = ({ children }: { children: ReactNode }) => <div className="box" style={{ transform: `translate3d(0,0,${BASE_Z}px)` }}>{children}</div>;

/** Gold-framed name board standing in front of the building. Reads the same name as the nav button. */
function Banner({ s, y, night, w = 118 }: { s: LandmarkSpec; y: number; night: boolean; w?: number }) {
  return (
    <div className="box" style={{ transform: `translate3d(0,${y}px,${BASE_Z}px)` }}>
      <Box w={4} d={4} h={18} x={-w / 2 + 8} c={GOLD} /><Box w={4} d={4} h={18} x={w / 2 - 8} c={GOLD} />
      <Box w={w + 6} d={2} h={27} y={-2.6} z={9} c={GOLD} />
      <Box w={w} d={4} h={23} z={11} c={NAVY} front={<div className="bsign"><b>{s.icon}</b><span>{s.label}</span></div>} />
      <div className={night ? 'emit' : ''}><Box w={w - 8} d={1} h={1.6} y={2.6} z={11} c={s.color} /></div>
    </div>
  );
}

/** Round gold finial / glowing orb. */
const Orb = ({ z, c = GOLD_L, r = 8, x = 0, y = 0 }: { z: number; c?: string; r?: number; x?: number; y?: number }) => (
  <div className="emit"><Box w={r} d={r} h={r} x={x} y={y} z={z} c={c} /></div>
);

/** Columns in a row, each with a small capital. */
const Colonnade = ({ xs, y, h, w = 8, c = MARBLE }: { xs: number[]; y: number; h: number; w?: number; c?: string }) => (
  <>{xs.map((x) => <div key={x} className="box" style={{ transform: `translate3d(${x}px,${y}px,0)` }}><Box w={w} d={w} h={h} c={c} /><Box w={w + 3} d={w + 3} h={3} z={h} c={MARBLE_D} /></div>)}</>
);

/* ------------------------------------------------------------------ MY CITY: stepped glass skyline tower */
function CityTower({ night }: { night: boolean }) {
  const g = win('#1d2d4d', night ? '#ffd98a' : '#9fd0f5');
  const all = { e: g, w: g, s: g, n: g };
  return (
    <>
      <Box w={150} d={78} h={22} c="#dfe6f2" bg={all} />
      <Box w={158} d={86} h={3} z={22} c={GOLD} />
      <Box w={104} d={60} h={70} z={25} c="#5d7fb0" bg={all} />
      {[-50, 50].map((x) => <Box key={x} w={4} d={4} h={70} x={x} y={30} z={25} c={GOLD} />)}
      <Box w={110} d={66} h={3} z={95} c={GOLD} />
      <Box w={72} d={44} h={52} z={98} c="#4c6c9c" bg={all} />
      <Box w={78} d={50} h={3} z={150} c={GOLD} />
      <Box w={40} d={28} h={22} z={153} c="#3a5584" bg={all} />
      <Box w={46} d={34} h={3} z={175} c={GOLD} />
      <Box w={4} d={4} h={34} z={178} c={GOLD} />
      <Orb z={212} r={9} />
      <Box w={34} d={14} h={3} y={44} z={13} c={GOLD} /><Box w={22} d={2} h={13} y={39.5} c="#1b2742" />
    </>
  );
}

/* ------------------------------------------------------------------ NEW PROJECT: architect's atelier with a swinging crane */
function Atelier({ night }: { night: boolean }) {
  const glass = `linear-gradient(#ffffff55,transparent 45%),repeating-linear-gradient(90deg,#fff 0 2px,transparent 2px 22px),${night ? '#ffd98a' : '#7ec0ee'}`;
  const side = win('#c9c2b0', night ? '#ffd98a' : '#8cc8f2');
  return (
    <>
      <Box w={118} d={64} h={36} x={10} y={-6} c="#f3efe6" bg={{ s: glass, e: side, w: side, n: side }} />
      <Box w={150} d={84} h={5} x={14} y={4} z={36} c="#e0902a" bg={{ t: '#f0a443' }} />
      <Box w={64} d={38} h={3} x={14} y={-4} z={41} c="#5d9a4a" />
      <Bush x={-4} y={-4} night={night} s={0.9} /><Bush x={30} y={0} night={night} s={0.8} />
      {[-52, 80].map((x) => <Box key={x} w={5} d={5} h={36} x={x} y={42} c="#fffaf0" />)}
      {/* tower crane */}
      <Box w={16} d={16} h={5} x={-62} y={-30} c="#c9a21a" />
      <Box w={7} d={7} h={118} x={-62} y={-30} z={5} c="#f2c230" />
      <div className="box" style={{ transform: 'translate3d(-62px,-30px,123px)' }}>
        <Box w={5} d={5} h={18} c="#f2c230" />
        <div className="box swingz">
          <Box w={96} d={5} h={6} x={36} c="#f2c230" /><Box w={28} d={5} h={6} x={-18} c="#f2c230" />
          <Box w={10} d={9} h={9} x={-26} z={-9} c="#6a7080" />
          <Box w={1.4} d={1.4} h={28} x={66} z={-28} c="#222" />
          <Box w={7} d={7} h={5} x={66} z={-33} c="#e0902a" /><Box w={24} d={4} h={4} x={66} z={-38} c="#8a919d" />
        </div>
      </div>
      {/* floating plus: found something new */}
      <div className="box" style={{ transform: 'translate3d(14px,-4px,68px)' }}>
        <div className="box spinz emit"><Box w={30} d={7} h={9} z={0} c="#ffd36a" /><Box w={9} d={7} h={30} z={-10.5} c="#ffd36a" /></div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ TIME MACHINE: clock spire and a spinning portal ring */
function TimeSpire({ night }: { night: boolean }) {
  const slit = 'repeating-linear-gradient(0deg,#5fd4ff 0 10px,transparent 10px 24px) 50%/6px 100% no-repeat,#39445e';
  const stone = { e: slit, w: slit };
  return (
    <>
      <Box w={46} d={36} h={96} y={-18} c="#39445e" bg={stone} />
      <Box w={52} d={40} h={44} y={-18} z={96} c="#2c3550" bg={{ s: clockFace, n: clockFace, e: clockFace, w: clockFace }} />
      <Box w={58} d={46} h={5} y={-18} z={140} c={GOLD} />
      <Box w={40} d={30} h={12} y={-18} z={145} c="#2c3550" />
      <Box w={24} d={18} h={10} y={-18} z={157} c={GOLD} />
      <Box w={3} d={3} h={26} y={-18} z={167} c={GOLD} />
      <Orb z={193} y={-18} c="#8cecff" r={8} />
      {/* portal frame + ring */}
      {[-46, 46].map((x) => <div key={x} className="box" style={{ transform: `translate3d(${x}px,24px,0)` }}><Box w={10} d={10} h={78} c="#4a5675" /><Box w={13} d={13} h={4} z={78} c={GOLD} /><Box w={13} d={13} h={4} z={0} c={GOLD} /></div>)}
      <Box w={100} d={8} h={6} y={24} z={0} c={GOLD} />
      <i className="tp portal" style={{ width: 84, height: 84, marginLeft: -42, marginTop: -42, transform: 'translate3d(0,24px,54px) rotateX(90deg)' }}>
        <u className="portal-spin" /><u className="portal-core" />
      </i>
      {night && <i className="tp" style={{ width: 120, height: 120, marginLeft: -60, marginTop: -60, borderRadius: '50%', background: 'radial-gradient(#5fd4ff66,transparent 70%)', transform: 'translate3d(0,24px,2px)' }} />}
    </>
  );
}

/* ------------------------------------------------------------------ ACTIVITY: pulse tower with a live bar chart */
function PulseTower({ night }: { night: boolean }) {
  const g = win('#7f68c9', night ? '#ffdc8f' : '#9fb4f2');
  const all = { e: g, w: g, s: g, n: g };
  const bars = [30, 52, 40, 74, 58, 90, 66];
  const cols = ['#a98cff', '#c27cff', '#e46bf0', '#ff6bd6', '#ff6b9e', '#ff8a6b', '#ffc36b'];
  return (
    <>
      <Box w={140} d={70} h={32} c="#3a2f66" bg={all} />
      <Box w={148} d={78} h={3} z={32} c="#8e75e0" />
      <Box w={70} d={52} h={118} y={-6} z={35} c="#463a80" bg={all} />
      <Box w={78} d={58} h={4} y={-6} z={153} c="#8e75e0" />
      <Box w={30} d={24} h={12} y={-6} z={157} c="#2c2358" />
      <Box w={3} d={3} h={28} y={-6} z={169} c="#98a0ae" />
      <div className="box" style={{ transform: 'translate3d(0,-6px,197px)' }}><div className="box pulsez emit"><Box w={9} d={9} h={9} c="#ff6bd6" /></div></div>
      <Box w={62} d={2} h={98} y={20.6} z={39} c="#161233" />
      {bars.map((h, i) => (
        <div key={i} className="box" style={{ transform: `translate3d(${-24 + i * 8}px,22px,41px)` }}>
          <div className="box pulsez emit" style={{ animationDelay: `${i * 0.22}s` }}><Box w={5.4} d={3} h={h} c={cols[i]} /></div>
        </div>
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ RANKINGS: golden podium with a trophy */
function TrophyPodium() {
  const gold = 'linear-gradient(90deg,#c99a2e,#f6dc86 50%,#c99a2e)';
  const silver = 'linear-gradient(90deg,#9ea7b6,#e1e6ee 50%,#9ea7b6)';
  const bronze = 'linear-gradient(90deg,#a8672f,#e3a265 50%,#a8672f)';
  const num = (n: number) => <div className="numeral">{n}</div>;
  const blk = (x: number, w: number, d: number, h: number, c: string, grad: string, n: number) => (
    <>
      <Box w={w} d={d} h={h} x={x} c={c} bg={{ e: grad, w: grad, n: grad }} front={num(n)} />
      <Box w={w + 4} d={d + 4} h={3} x={x} z={h} c={GOLD} />
    </>
  );
  return (
    <>
      <Box w={124} d={14} h={3} y={40} c={MARBLE_D} />
      {blk(-54, 44, 40, 68, '#c3cad6', silver, 2)}
      {blk(54, 44, 40, 50, '#cd8a4e', bronze, 3)}
      {blk(0, 48, 46, 94, GOLD, gold, 1)}
      {/* trophy cup */}
      <div className="emit">
        <Box w={16} d={16} h={4} z={97} c={GOLD} /><Box w={5} d={5} h={14} z={101} c={GOLD_L} />
        <Box w={16} d={14} h={8} z={115} c={GOLD_L} /><Box w={28} d={22} h={12} z={123} c={GOLD_L} />
        <Box w={5} d={4} h={11} x={-17} z={122} c={GOLD} /><Box w={5} d={4} h={11} x={17} z={122} c={GOLD} />
      </div>
      <div className="box" style={{ transform: 'translate3d(0,0,143px)' }}><div className="box spinz emit"><Box w={8} d={8} h={10} c="#fff1b0" /></div></div>
    </>
  );
}

/* ------------------------------------------------------------------ BUILDERS' SQUARE: open colonnade pavilion with a green dome */
function Pavilion({ s, night }: { s: LandmarkSpec; night: boolean }) {
  const teal = s.color;
  const people = [[-14, 6, '#e5483b'], [14, 6, '#f5c518'], [-8, -12, '#3e7fd8'], [8, -12, '#ff7ab8']] as const;
  return (
    <>
      <Box w={150} d={84} h={3} c="#d6cdb6" bg={{ t: '#e3dbc6' }} />
      <Colonnade xs={[-62, -21, 21, 62]} y={34} h={56} w={9} />
      <Colonnade xs={[-62, -21, 21, 62]} y={-34} h={56} w={9} />
      <Box w={152} d={86} h={7} z={59} c={MARBLE} />
      <Box w={166} d={98} h={6} z={66} c={tone(teal, 0.8)} bg={{ t: tone(teal, 1.15) }} />
      <Dome r={34} z={72} bg={`linear-gradient(90deg,${tone(teal, 0.8)},${tone(teal, 1.35)} 50%,${tone(teal, 0.8)})`} cap={tone(teal, 1.3)} />
      <Box w={3} d={3} h={16} z={104} c={GOLD} /><Orb z={118} r={7} />
      {/* people holding the city together */}
      <Box w={16} d={16} h={12} z={3} c={MARBLE_D} /><Orb z={15} r={9} c="#a6f2cc" />
      {people.map(([x, y, c], i) => (
        <div key={i} className="box" style={{ transform: `translate3d(${x * 1.5}px,${y * 1.5}px,3px)` }}>
          <Box w={7} d={6} h={13} c={c} /><Box w={6} d={6} h={6} z={13} c="#e3aa7c" /><Box w={6.4} d={6.4} h={2.4} z={17} c="#3b2616" />
        </div>
      ))}
      {[-78, 78].map((x) => (
        <div key={x} className="box" style={{ transform: `translate3d(${x}px,46px,0)` }}>
          <Box w={2} d={2} h={50} c={GOLD} /><Box w={18} d={1.2} h={11} x={10} z={38} c={night ? '#ffb347' : '#e5483b'} />
        </div>
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ CITY DEED: neoclassical hall of records */
function RecordsHall({ night }: { night: boolean }) {
  const g = win('#b3a98f', night ? '#ffd98a' : '#a9c6d8');
  return (
    <>
      <Box w={120} d={14} h={3} y={44} c={MARBLE_D} /><Box w={108} d={10} h={3} y={42} z={3} c={MARBLE} />
      <Box w={132} d={64} h={54} y={-4} z={6} c="#e9e2d0" bg={{ e: g, w: g, n: g }} />
      <Box w={22} d={2} h={26} y={28.2} z={6} c="#3a2a20" />
      <Colonnade xs={[-55, -33, -11, 11, 33, 55]} y={34} h={54} w={8} />
      <Box w={142} d={78} h={7} y={-2} z={60} c={MARBLE} />
      <Box w={146} d={82} h={2.4} y={-2} z={67} c={GOLD} />
      {/* pediment: the gable is turned so the triangle faces the street */}
      <div className="box" style={{ transform: 'translate3d(0,-2px,69px) rotateZ(90deg)' }}>
        <GableRoof w={78} d={142} h={0} rh={28} roof="#6f9a8a" wall={MARBLE} />
      </div>
      <VPlane w={17} h={17} z={74} y={37.4} bg={`radial-gradient(${GOLD_L},${GOLD} 60%,#a37f22)`} r="50%" />
      {[-78, 78].map((x) => (
        <div key={x} className="box" style={{ transform: `translate3d(${x}px,48px,0)` }}>
          <Box w={3} d={3} h={16} c="#4a4f5c" /><div className="emit"><Box w={6} d={6} h={7} z={16} c="#ff9a3c" /></div>
        </div>
      ))}
    </>
  );
}

export function Landmark({ s, night }: { s: LandmarkSpec; night: boolean }) {
  const wide = s.id === 'rank' ? 176 : s.id === 'time' ? 166 : s.id === 'square' ? 178 : 168;
  const deep = s.id === 'square' ? 108 : s.id === 'time' ? 100 : 94;
  let body: ReactNode;
  switch (s.id) {
    case 'archive': body = <CityTower night={night} />; break;
    case 'new': body = <Atelier night={night} />; break;
    case 'time': body = <TimeSpire night={night} />; break;
    case 'activity': body = <PulseTower night={night} />; break;
    case 'rank': body = <TrophyPodium />; break;
    case 'square': body = <Pavilion s={s} night={night} />; break;
    default: body = <RecordsHall night={night} />;
  }
  return (
    <div className={`box bld ${night ? 'glowy' : ''}`} style={at(s.x, s.y, 1.5)}>
      {night && <div className="glow" style={{ transform: 'translate3d(0,24px,3px)', background: `radial-gradient(${s.color}66,${s.color}1f 48%,transparent 72%)` }} />}
      <Plinth w={wide} d={deep} />
      <Lift>{body}</Lift>
      <Banner s={s} y={deep / 2 + 24} night={night} />
    </div>
  );
}
