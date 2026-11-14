import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { Box } from '../components/Box3D';
import { useNight, usePhase } from '../clock';
import { dormantDays, dormantLabel, illumination } from '../data';
import { revisitCandidates } from '../components/Nudge';
import { useStore } from '../store';
import { useUI } from '../ui';
import type { PanelKind } from '../ui';
import { Avatar } from './Avatar';
import type { AvatarRefs } from './Avatar';
import { Bush, Cone, Lamp, Pine, Pond, ProjectBuilding, Rock, Sign, hash } from './Scenery';
import { Landmark } from './Landmarks';
import type { LandmarkSpec } from './Landmarks';
import { Ghost, PlacementBar } from './Placement';
import { NAV_ITEMS, navLabel } from '../navConfig';
import { cancelPlacing, commitPlacing, getPlacing, playerPos, updateGhost, useIsPlacing } from '../placement';
import { buildSkin } from './textures';
import { Pet, PET_INFO } from './Pets';
import type { PetRefs } from './Pets';
import { Structure } from './Structures';
import { GAP, HY, LM_X, LM_Y, VX, W, ROAD, WALK, plot, posOf, rowsFor, warp } from './layout';
import { useShop } from '../shop';
import { STRUCT_FOOT } from '../shopData';

/* ---------------- city layout ---------------- */
const PITCH_MIN = 14, PITCH_MAX = 80, ZOOM_MIN = 0.55, ZOOM_MAX = 3.2, ZOOM_HOME = 1.3;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/* The premium buildings. Names, hints, icons and order come from navConfig.ts, the same list the nav bar uses,
   so a building is always called exactly what its nav button is called. */
const LANDMARKS: (LandmarkSpec & { panel: PanelKind })[] = NAV_ITEMS.map((n, i) => ({
  id: n.kind, panel: n.kind, label: navLabel(n), hint: n.hint, icon: n.icon, color: n.color, x: LM_X(i), y: LM_Y,
}));

/* empty plots: only the two park variants are kept (trees / pond). All the old filler buildings were removed. */
const variant = (i: number) => Math.floor(hash(i, 9) * 8);
const isPark = (v: number) => v === 1 || v === 6;

/* A culling zone: everything inside it is switched off (display:none) while it is outside the camera view.
   This is the main performance win: thousands of CSS-3D faces are never composited when off-screen. */
const Zn = ({ x, y, decor, children }: { x: number; y: number; decor?: boolean; children: ReactNode }) => <div className="zone" data-zx={x} data-zy={y} data-decor={decor ? '1' : undefined}>{children}</div>;

/* Player state survives closing pop-ups and remounts */
const saved = { x: VX(2), y: 640, yaw: 0, pitch: 67, face: 90, zoom: ZOOM_HOME };
type Obstacle = { x: number; y: number; hx: number; hy: number };
type Spot = { id: string; ix: number; iy: number; label: string; hint: string };
const CARS = [
  { x: 800, k: 0, l: 1, c: '#d84b3e' }, { x: 1750, k: 1, l: 0, c: '#e3b53c' }, { x: 2600, k: 1, l: 1, c: '#3e7fd8' },
  { x: 1250, k: 2, l: 0, c: '#e8e8ea' }, { x: 2350, k: 0, l: 0, c: '#3fa56b' }, { x: 640, k: 2, l: 1, c: '#7a4fb5' },
  { x: 3150, k: 0, l: 1, c: '#e8793a' }, { x: 3300, k: 2, l: 0, c: '#2fb5b0' },
];

export default function World() {
  const { projects } = useStore();
  const { open, shift } = useUI();
  const night = useNight();
  const phase = usePhase();
  const shop = useShop();
  const skin = useMemo(() => buildSkin(shop.look), [shop.look]);
  const skinRef = useRef(skin); skinRef.current = skin;
  const cos = useMemo(() => ({ hat: shop.hat, face: shop.face, back: shop.back }), [shop.hat, shop.face, shop.back]);
  const petRefs: PetRefs = { root: useRef(null), hop: useRef(null), tail: useRef(null) };
  const petRefsRef = useRef(petRefs); petRefsRef.current = petRefs;
  const petId = useRef<string | null>(null); petId.current = shop.pet;
  const pst = useRef({ x: saved.x - 40, y: saved.y, face: 90, t: 0, init: false });

  const pts = useMemo(() => projects.map((p, i) => posOf(p, i)), [projects]);
  const rows = rowsFor(pts);
  const H = HY(rows) + 260;
  const slots = rows * 16;
  const placing = useIsPlacing();

  const [near, setNear] = useState<string | null>(null);
  const [nudgeOpen, setNudgeOpen] = useState(true);

  const refs: AvatarRefs = { root: useRef(null), ub: useRef(null), hd: useRef(null), ll: useRef(null), rl: useRef(null), la: useRef(null), ra: useRef(null) };
  const refsRef = useRef(refs); refsRef.current = refs;
  const world = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const st = useRef({ ...saved, zoomT: saved.zoom, walk: 0, idle: 0 });
  const keys = useRef(new Set<string>());
  const nearRef = useRef<string | null>(null);
  const drag = useRef<{ x: number; y: number; moved: number } | null>(null);
  const ptrs = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef(0);

  const spots = useMemo<Spot[]>(() => [
    ...LANDMARKS.map((l) => ({ id: `lm:${l.id}`, ix: l.x, iy: l.y + 140, label: l.label, hint: l.hint })),
    ...projects.map((p, i) => ({ id: `g:${p.id}`, ix: pts[i].x, iy: pts[i].y + 104, label: p.name, hint: 'Inspect this building' })),
  ], [projects, pts]);

  const obstacles = useMemo<Obstacle[]>(() => {
    const o: Obstacle[] = LANDMARKS.map((l) => ({ x: l.x, y: l.y, hx: 128, hy: 78 }));
    pts.forEach((q, i) => { const k = Math.max(0.85, projects[i]?.design?.size ?? 1); o.push({ x: q.x, y: q.y, hx: 64 * k, hy: 48 * k }); });
    CARS.forEach((c) => o.push({ x: c.x, y: HY(c.k) + (c.l ? 22 : -22), hx: 24, hy: 12 }));
    for (let k = 0; k < 6; k++) o.push({ x: 660 + 520 * k, y: LM_Y + 90, hx: 14, hy: 14 });
    shop.placed.forEach((p) => { const [fw, fh] = STRUCT_FOOT[p.key] ?? [20, 20]; o.push({ x: p.x, y: p.y, hx: fw + 4, hy: fh + 4 }); });
    return o;
  }, [pts, projects, shop.placed]);
  const obstaclesRef = useRef(obstacles); obstaclesRef.current = obstacles;
  const HRef = useRef(H); HRef.current = H;

  /* a structure may be dropped anywhere that is open ground: not on a building, landmark, car or another structure */
  const spotFree = (key: string, x: number, y: number) => {
    const [fw, fh] = STRUCT_FOOT[key] ?? [20, 20];
    if (x < 80 || y < 80 || x > W - 80 || y > HRef.current - 80) return false;
    return !obstaclesRef.current.some((o) => Math.abs(x - o.x) < o.hx + fw && Math.abs(y - o.y) < o.hy + fh);
  };
  const moveGhost = (x: number, y: number, follow: boolean) => { const g = getPlacing(); if (g) updateGhost(x, y, spotFree(g.key, x, y), follow); };

  /* screen point -> point on the ground (inverse of the CSS camera, same maths as the culling below) */
  const groundAt = (cx: number, cy: number) => {
    const stg = stageRef.current; if (!stg) return null;
    const r = stg.getBoundingClientRect(), s = st.current;
    const SW = r.width, SH = r.height, sx = cx - r.left, sy = cy - r.top;
    const ya = (s.yaw * Math.PI) / 180, ca = Math.cos(ya), sa = Math.sin(ya);
    const th = (s.pitch * Math.PI) / 180, cp = Math.cos(th), sp = Math.sin(th);
    const ox = SW / 2, oy = SH * 0.3, ay = ((78 - (67 - s.pitch) * 0.32) / 100) * SH;
    const den = 800 * cp + (sy - oy) * sp;
    if (den < 60) return null;                        // pointing at the sky
    const ry = (800 * (sy - ay)) / den, f = 800 / (800 - ry * sp);
    if (!(f > 0) || !isFinite(f)) return null;
    const rx = (sx - ox) / f;
    return { x: s.x + (rx * ca + ry * sa) / s.zoom, y: s.y + (-rx * sa + ry * ca) / s.zoom };
  };

  const act = useCallback((id: string) => {
    if (getPlacing()) return;                          // while placing a structure, clicks drop it instead of opening buildings
    if (id.startsWith('g:')) return open('project', id.slice(2));
    const l = LANDMARKS.find((x) => `lm:${x.id}` === id);
    if (l) open(l.panel);
  }, [open]);
  const actRef = useRef(act); actRef.current = act;
  const clickSpot = useCallback((id: string) => () => { if (!drag.current || drag.current.moved < 6) actRef.current(id); }, []);

  /* zoom only the city camera (never the page); everything else stays put */
  const zoomBy = useCallback((f: number) => { const q = st.current; q.zoomT = clamp(q.zoomT * f, ZOOM_MIN, ZOOM_MAX); }, []);

  /* ---------------- game loop ---------------- */
  useEffect(() => {
    const s = st.current;
    let eyeEl: HTMLElement | null = null;
    let eyesClosed = false;
    let lastSkin = skinRef.current;
    const typing = (t: EventTarget | null) => { const el = t as HTMLElement | null; return !!el && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable); };
    const kd = (e: KeyboardEvent) => {
      if (typing(e.target)) return;
      if (document.querySelector('[role="dialog"]')) { keys.current.clear(); return; }
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '+' || e.key === '=') { e.preventDefault(); zoomBy(1.18); return; }
        if (e.key === '-' || e.key === '_') { e.preventDefault(); zoomBy(1 / 1.18); return; }
        if (e.key === '0') { e.preventDefault(); s.zoomT = ZOOM_HOME; return; }
        return;
      }
      const k = e.key.toLowerCase();
      if (getPlacing()) {
        if (k === 'enter' || k === 'f') { e.preventDefault(); commitPlacing(); return; }
        if (k === 'escape') { cancelPlacing(); return; }
      }
      if ((k === 'f' || k === 'enter') && nearRef.current) {
        if (k === 'enter' && (e.target as HTMLElement | null)?.tagName === 'BUTTON') return;
        actRef.current(nearRef.current); return;
      }
      if (k.startsWith('arrow')) e.preventDefault();
      keys.current.add(k);
    };
    const ku = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase());
    window.addEventListener('keydown', kd); window.addEventListener('keyup', ku);

    /* wheel / trackpad pinch / ctrl+wheel: zoom the map around the player, block browser page-zoom */
    const onWheel = (e: WheelEvent) => {
      if (document.querySelector('[role="dialog"]')) return;
      if (!(e.target as HTMLElement | null)?.closest?.('.app')) return;
      e.preventDefault();
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1;
      zoomBy(Math.exp(-e.deltaY * unit * (e.ctrlKey ? 0.012 : 0.0016)));
    };
    /* Safari trackpad pinch fires gesture events instead of ctrl+wheel */
    let gScale = 1;
    const gStart = (e: Event) => { if (document.querySelector('[role="dialog"]')) return; e.preventDefault(); gScale = 1; };
    const gChange = (e: Event) => {
      if (document.querySelector('[role="dialog"]')) return;
      e.preventDefault();
      const sc = (e as unknown as { scale: number }).scale;
      if (sc > 0) { zoomBy(sc / gScale); gScale = sc; }
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('gesturestart', gStart, { passive: false });
    window.addEventListener('gesturechange', gChange, { passive: false });

    let raf = 0, last = performance.now(), cullAt = -1e9, lite = false, fpsT = performance.now(), fpsN = 0, slow = 0, lastTf = '', lastTop = '';
    /* view-frustum culling: project each zone with the same maths as the CSS camera and hide the ones off screen */
    const cull = () => {
      const stg = stageRef.current, w = world.current;
      if (!stg || !w) return;
      const SW = stg.clientWidth, SH = stg.clientHeight;
      const ya = (s.yaw * Math.PI) / 180, ca = Math.cos(ya), sa = Math.sin(ya);
      const th = (s.pitch * Math.PI) / 180, cp = Math.cos(th), sp = Math.sin(th);
      const ox = SW / 2, oy = SH * 0.3, ay = ((78 - (67 - s.pitch) * 0.32) / 100) * SH;
      const thr = lite ? 0.34 : 0.24, rad = lite ? 1250 : 1e9;
      w.querySelectorAll<HTMLElement>('.zone').forEach((el) => {
        const dx = Number(el.dataset.zx) - s.x, dy = Number(el.dataset.zy) - s.y;
        const rx = (dx * ca - dy * sa) * s.zoom, ry = (dx * sa + dy * ca) * s.zoom;
        const z = ry * sp;
        let show = false;
        if (z < 700) {
          const f = 800 / (800 - z);
          const sx = ox + rx * f, sy = oy + (ay - oy + ry * cp) * f, m = (280 * s.zoom + 70) * f;
          show = f * s.zoom > thr && !(el.dataset.decor && dx * dx + dy * dy > rad * rad) && sx > -m && sx < SW + m && sy > -m && sy < SH + m;
        }
        el.classList.toggle('off', !show);
      });
    };
    const blocked = (x: number, y: number) => obstacles.some((o) => Math.abs(x - o.x) < o.hx && Math.abs(y - o.y) < o.hy);

    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000); last = t;
      if (warp.to) { s.x = warp.to.x; s.y = warp.to.y; warp.to = null; }
      const k = keys.current;
      if (document.querySelector('[role="dialog"]')) k.clear();
      const ix = (k.has('d') || k.has('arrowright') ? 1 : 0) - (k.has('a') || k.has('arrowleft') ? 1 : 0);
      const iy = (k.has('w') || k.has('arrowup') ? 1 : 0) - (k.has('s') || k.has('arrowdown') ? 1 : 0);
      if (k.has('q')) s.yaw -= 100 * dt;
      if (k.has('e')) s.yaw += 100 * dt;
      const a = (s.yaw * Math.PI) / 180;
      let mx = Math.cos(a) * ix - Math.sin(a) * iy;
      let my = -Math.sin(a) * ix - Math.cos(a) * iy;
      const len = Math.hypot(mx, my);
      const moving = len > 0;
      if (moving) {
        mx /= len; my /= len;
        const nx = Math.min(W - 60, Math.max(60, s.x + mx * 250 * dt));
        const ny = Math.min(H - 60, Math.max(60, s.y + my * 250 * dt));
        if (!blocked(nx, s.y)) s.x = nx;
        if (!blocked(s.x, ny)) s.y = ny;
        const target = (Math.atan2(my, mx) * 180) / Math.PI;
        const diff = ((target - s.face + 540) % 360) - 180;
        s.face += diff * Math.min(1, dt * 14);
        s.walk += dt * 11; s.idle = 0;
      } else { s.walk *= 0.85; s.idle += dt; }

      playerPos.x = s.x; playerPos.y = s.y; playerPos.face = s.face;
      const gp = getPlacing();
      if (gp && gp.follow) {                      // until the mouse is used, the ghost sits just in front of the player
        const fa = (s.face * Math.PI) / 180;
        moveGhost(s.x + Math.cos(fa) * 90, s.y + Math.sin(fa) * 90, true);
      }
      const swing = Math.sin(s.walk) * 44 * (moving ? 1 : Math.min(1, Math.abs(s.walk)));
      const idleW = moving ? 0 : Math.max(0, 1 - Math.abs(swing) / 8);
      const bob = moving ? Math.abs(Math.sin(s.walk)) * 3 : 0;
      const breathe = Math.sin(s.idle * 2.3) * 0.9 * idleW;
      const armIdle = Math.sin(s.idle * 1.7) * 4 * idleW;
      const look = Math.sin(s.idle * 0.55) * Math.sin(s.idle * 0.19 + 1) * 36 * idleW;
      const sc = 1.45;

      const R = refsRef.current;
      s.zoom += (s.zoomT - s.zoom) * Math.min(1, dt * 10);
      if (Math.abs(s.zoomT - s.zoom) < 0.0008) s.zoom = s.zoomT;
      if (world.current) {
        const top = `${(78 - (67 - s.pitch) * 0.32).toFixed(2)}%`;
        const tf = `rotateX(${s.pitch}deg) rotateZ(${s.yaw}deg) scale3d(${s.zoom},${s.zoom},${s.zoom}) translate3d(${-s.x}px,${-s.y}px,0)`;
        if (top !== lastTop) { lastTop = top; world.current.style.top = top; }
        if (tf !== lastTf) { lastTf = tf; world.current.style.transform = tf; }
      }
      /* adaptive quality: if the frame rate stays low, switch to a lighter scene (fewer decor objects, no soft shadows) */
      fpsN++;
      if (t - fpsT >= 1500) {
        const fps = (fpsN * 1000) / (t - fpsT); fpsN = 0; fpsT = t;
        slow = fps < 45 ? slow + 1 : Math.max(0, slow - 1);
        if (!lite && slow >= 2) { lite = true; stageRef.current?.setAttribute('data-lite', '1'); cullAt = -1e9; }
        else if (lite && slow === 0 && fps > 58) { lite = false; stageRef.current?.removeAttribute('data-lite'); cullAt = -1e9; }
      }
      if (R.root.current) R.root.current.style.transform = `translate3d(${s.x}px,${s.y}px,${bob}px) rotateZ(${s.face}deg) scale3d(${sc},${sc},${sc})`;
      if (R.ll.current) R.ll.current.style.transform = `translate3d(0,-4px,18px) rotateY(${swing}deg)`;
      if (R.rl.current) R.rl.current.style.transform = `translate3d(0,4px,18px) rotateY(${-swing}deg)`;
      if (R.ub.current) R.ub.current.style.transform = `translate3d(0,0,${breathe}px)`;
      if (R.la.current) R.la.current.style.transform = `translate3d(0,-12px,36px) rotateY(${-swing - armIdle}deg)`;
      if (R.ra.current) R.ra.current.style.transform = `translate3d(0,12px,36px) rotateY(${swing + armIdle}deg)`;
      if (R.hd.current) R.hd.current.style.transform = `rotateZ(${look}deg)`;

      if (t - cullAt > 140) { cullAt = t; cull(); }

      // blinking (only the face texture swaps)
      if (lastSkin !== skinRef.current) { lastSkin = skinRef.current; eyeEl = null; eyesClosed = false; }
      if (!eyeEl && R.hd.current) eyeEl = R.hd.current.querySelector<HTMLElement>('.f-e');
      const closed = (t / 1000) % 3.7 < 0.13;
      if (eyeEl && closed !== eyesClosed) { eyesClosed = closed; eyeEl.style.background = closed ? skinRef.current.headBlink : skinRef.current.headFront; }

      // pet follows behind the player and hops while walking
      const P = petRefsRef.current;
      const pid = petId.current;
      if (pid && P.root.current && P.hop.current) {
        const info = PET_INFO[pid];
        const ps = pst.current;
        if (!ps.init) { ps.x = s.x - 40; ps.y = s.y; ps.init = true; }
        const fa = (s.face * Math.PI) / 180;
        const tx = s.x - Math.cos(fa) * 46 + Math.cos(fa + Math.PI / 2) * 16;
        const ty = s.y - Math.sin(fa) * 46 + Math.sin(fa + Math.PI / 2) * 16;
        const ox = ps.x, oy = ps.y;
        const k2 = Math.min(1, dt * 4.5);
        ps.x += (tx - ps.x) * k2; ps.y += (ty - ps.y) * k2;
        const vx = ps.x - ox, vy = ps.y - oy;
        const speed = Math.hypot(vx, vy) / Math.max(dt, 0.001);
        const pmoving = speed > 25;
        if (pmoving) {
          const tg = (Math.atan2(vy, vx) * 180) / Math.PI;
          ps.face += ((((tg - ps.face + 540) % 360) - 180)) * Math.min(1, dt * 10);
          ps.t += dt * 13;
        } else {
          const tg = (Math.atan2(s.y - ps.y, s.x - ps.x) * 180) / Math.PI;
          ps.face += ((((tg - ps.face + 540) % 360) - 180)) * Math.min(1, dt * 3);
          ps.t += dt * 3;
        }
        const hopZ = info.hover + (pmoving ? Math.abs(Math.sin(ps.t)) * info.hop : Math.sin(ps.t * 0.6) * (info.hover ? 1.6 : 0.4));
        P.root.current.style.transform = `translate3d(${ps.x}px,${ps.y}px,0) rotateZ(${ps.face}deg) scale3d(${info.scale},${info.scale},${info.scale})`;
        P.hop.current.style.transform = `translate3d(0,0,${hopZ}px)`;
        if (P.tail.current && info.tail[0] !== 0) P.tail.current.style.transform = `translate3d(${info.tail[0]}px,0,${info.tail[1]}px) rotateZ(${Math.sin(ps.t * (pmoving ? 2.2 : 1.4)) * (pmoving ? 28 : 38)}deg)`;
      }

      let best: string | null = null, bd = 115;
      for (const g of spots) { const d = Math.hypot(g.ix - s.x, g.iy - s.y); if (d < bd) { bd = d; best = g.id; } }
      if (best !== nearRef.current) {
        const w = world.current;
        if (w) {
          if (nearRef.current) w.querySelector(`[data-spot="${nearRef.current}"]`)?.classList.remove('near');
          if (best) w.querySelector(`[data-spot="${best}"]`)?.classList.add('near');
        }
        nearRef.current = best; setNear(best);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('gesturestart', gStart); window.removeEventListener('gesturechange', gChange);
      Object.assign(saved, { x: s.x, y: s.y, yaw: s.yaw, pitch: s.pitch, face: s.face, zoom: s.zoomT });
    };
  }, [spots, obstacles, H, zoomBy]);

  const hold = (k: string) => ({
    onPointerDown: (e: React.PointerEvent) => { e.stopPropagation(); keys.current.add(k); },
    onPointerUp: () => keys.current.delete(k), onPointerLeave: () => keys.current.delete(k), onPointerCancel: () => keys.current.delete(k),
  });

  /* ---------------- static scenery (memoised: only rebuilt when data / daylight change) ---------------- */
  const city = useMemo(() => {
    const vRoadTop = HY(0) - 70, vRoadH = HY(rows) - HY(0) + 140;
    const hLeft = VX(0) - 70, hW = VX(4) - VX(0) + 140;
    const lampXs = [0, 1, 2, 3].map((j) => VX(j) + GAP / 2);
    const trees: { x: number; y: number }[] = [];
    for (let i = 0; i < 40; i++) {
      const a = hash(i, 1), b = hash(i, 2), side = i % 4;
      trees.push(side === 0 ? { x: -520 + a * 420, y: -420 + b * (H + 800) } : side === 1 ? { x: W + 100 + a * 420, y: -420 + b * (H + 800) }
        : side === 2 ? { x: -400 + a * (W + 800), y: -420 + b * 400 } : { x: -400 + a * (W + 800), y: H + 40 + b * 400 });
    }
    return (
      <>
        <div className="terrain" />
        <div className="ground" style={{ width: W, height: H }} />
        <div className="plaza" style={{ left: 150, top: 110, width: W - 300, height: HY(0) - 200 }} />
        {LANDMARKS.map((l) => <div key={l.id} className="walkway" style={{ left: l.x - 40, top: l.y + 50, width: 80, height: HY(0) - (l.y + 50) }} />)}

        {Array.from({ length: 5 }, (_, j) => <div key={`vw${j}`} className="walk" style={{ left: VX(j) - WALK / 2, top: vRoadTop - 20, width: WALK, height: vRoadH + 40 }} />)}
        {Array.from({ length: rows + 1 }, (_, k) => <div key={`hw${k}`} className="walk" style={{ left: hLeft - 20, top: HY(k) - WALK / 2, width: hW + 40, height: WALK }} />)}
        {Array.from({ length: 5 }, (_, j) => <div key={`vr${j}`} className="road v" style={{ left: VX(j) - ROAD / 2, top: vRoadTop, width: ROAD, height: vRoadH }} />)}
        {Array.from({ length: rows + 1 }, (_, k) => <div key={`hr${k}`} className="road h" style={{ left: hLeft, top: HY(k) - ROAD / 2, width: hW, height: ROAD }} />)}
        {Array.from({ length: 5 }, (_, j) => Array.from({ length: rows + 1 }, (_, k) => (
          <div key={`x${j}-${k}`} className="xing" style={{ left: VX(j) - 70, top: HY(k) - 70 }} />
        )))}

        {lampXs.flatMap((x, j) => Array.from({ length: rows + 1 }, (_, k) => [-1, 1].map((sd) => (
          <Zn key={`l${j}-${k}-${sd}`} x={x} y={HY(k) + sd * 66} decor>
            {night && <div className="glow" style={{ transform: `translate3d(${x}px,${HY(k) + sd * 66}px,4px)` }} />}
            <Lamp x={x} y={HY(k) + sd * 66} night={night} />
          </Zn>)))).flat()}
        {[1, 3].flatMap((j) => Array.from({ length: rows }, (_, r) => [-1, 1].map((sd) => <Zn key={`vl${j}-${r}-${sd}`} x={VX(j) + sd * 66} y={HY(r) + GAP / 2} decor><Lamp x={VX(j) + sd * 66} y={HY(r) + GAP / 2} night={night} /></Zn>))).flat()}

        {LANDMARKS.map((l) => (
          <Zn key={l.id} x={l.x} y={l.y}><div className="hit" data-spot={`lm:${l.id}`} onClick={clickSpot(`lm:${l.id}`)}><Landmark s={l} night={night} /></div></Zn>
        ))}
        {Array.from({ length: 6 }, (_, k) => <Zn key={`pp${k}`} x={660 + 520 * k} y={LM_Y + 90} decor><Pine x={660 + 520 * k} y={LM_Y + 90} night={night} /></Zn>)}
        {Array.from({ length: 7 }, (_, k) => <Zn key={`rk${k}`} x={530 + 520 * k} y={HY(0) - 150} decor><Rock x={530 + 520 * k} y={HY(0) - 150} s={0.8 + hash(k) * 0.5} /></Zn>)}

        {/* a small green in the middle of every block */}
        {Array.from({ length: rows * 4 }, (_, b) => {
          const cx = VX(b % 4) + GAP / 2, cy = HY(Math.floor(b / 4)) + GAP / 2;
          if (pts.some((q) => Math.abs(q.x - cx) < 150 && cy > q.y - 110 && cy < q.y + 150)) return null;
          return <Zn key={`pk${b}`} x={cx} y={cy} decor><Pine x={cx} y={cy - 4} night={night} s={0.85} /><Bush x={cx - 34} y={cy + 14} night={night} /><Bush x={cx + 34} y={cy + 10} night={night} s={0.85} /></Zn>;
        })}

        {projects.map((p, i) => {
          const q = pts[i];
          const ill = illumination(p, shift);
          return (
            <Zn key={p.id} x={q.x} y={q.y}>
              <div className="pad" style={{ left: q.x - 115, top: q.y - 82, width: 230, height: 204 }} />
              <div className="hit" data-spot={`g:${p.id}`} onClick={clickSpot(`g:${p.id}`)}>
                <ProjectBuilding p={p} x={q.x} y={q.y} illum={ill} night={night} />
                <Sign x={q.x} y={q.y + 80} p={p} night={night} />
              </div>
            </Zn>
          );
        })}

        {/* empty plots keep only their park scenery (and only when no project stands there) */}
        {Array.from({ length: slots }, (_, i) => {
          const v = variant(i);
          if (!isPark(v)) return null;
          const q = plot(i);
          if (pts.some((o) => Math.abs(o.x - q.x) < 200 && Math.abs(o.y - q.y) < 190)) return null;
          return (
            <Zn key={`f${i}`} x={q.x} y={q.y} decor>
              {v === 1
                ? <><Pine x={q.x - 70} y={q.y - 40} night={night} s={1.2} /><Pine x={q.x + 56} y={q.y - 56} night={night} s={1.4} /><Pine x={q.x - 10} y={q.y + 38} night={night} /><Pine x={q.x + 74} y={q.y + 40} night={night} s={0.9} /><Bush x={q.x - 66} y={q.y + 50} night={night} /><Rock x={q.x + 20} y={q.y - 4} s={0.8} /></>
                : <><Pond x={q.x - 10} y={q.y + 4} /><Pine x={q.x + 74} y={q.y - 30} night={night} s={1.2} /><Pine x={q.x - 76} y={q.y - 40} night={night} /><Rock x={q.x + 52} y={q.y + 44} /><Rock x={q.x - 60} y={q.y + 52} s={0.7} /><Cone x={q.x + 80} y={q.y + 58} /></>}
            </Zn>
          );
        })}

        {CARS.map((c, i) => (
          <Zn key={`c${i}`} x={c.x} y={HY(c.k)} decor><div className="box bld" style={{ transform: `translate3d(${c.x}px,${HY(c.k) + (c.l ? 22 : -22)}px,0)` }}>
            <Box w={38} d={19} h={9} c={c.c} /><Box w={20} d={16} h={8} x={-2} z={9} c="#bfe0f2" />
            {night && <div className="emit"><Box w={3} d={14} h={3} x={19} z={3} c="#fff3b0" /></div>}
          </div></Zn>
        ))}
        {trees.map((t, i) => <Zn key={`t${i}`} x={t.x} y={t.y} decor><Pine x={t.x} y={t.y} night={night} s={1.1 + hash(i, 7) * 0.7} /></Zn>)}
      </>
    );
  }, [projects, pts, night, shift, rows, slots, H, clickSpot]);

  /* structures the player bought and put on the map (kept apart so moving one does not rebuild the whole city) */
  const placedEls = useMemo(() => shop.placed.map((p) => <Zn key={p.key} x={p.x} y={p.y}><Structure id={p.key} x={p.x} y={p.y} night={night} /></Zn>), [shop.placed, night]);

  const candidates = useMemo(() => revisitCandidates(projects), [projects]);
  const nearSpot = spots.find((sp) => sp.id === near);
  const dialogOpen = typeof document !== 'undefined' && !!document.querySelector('[role="dialog"]');

  return (
    <div ref={stageRef} className={`stage ${night ? 'night' : 'day'} ph-${phase}`}
      onPointerDown={(e) => {
        ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        drag.current = { x: e.clientX, y: e.clientY, moved: 0 };
        if (ptrs.current.size === 2) { const [a, b] = [...ptrs.current.values()]; pinch.current = Math.hypot(a.x - b.x, a.y - b.y); }
      }}
      onPointerMove={(e) => {
        if (getPlacing() && e.pointerType === 'mouse' && e.buttons === 0) {   // hovering with a structure in hand: it follows the cursor
          const g = groundAt(e.clientX, e.clientY); if (g) moveGhost(g.x, g.y, false);
          return;
        }
        if (ptrs.current.has(e.pointerId)) ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (ptrs.current.size >= 2) {            // two fingers: pinch-zoom the map
          const [a, b] = [...ptrs.current.values()]; const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (pinch.current > 0 && dist > 0) zoomBy(dist / pinch.current);
          pinch.current = dist; if (drag.current) drag.current.moved = 99;
          return;
        }
        const d = drag.current; if (!d) return;
        const dx = e.clientX - d.x, dy = e.clientY - d.y;
        d.moved += Math.abs(dx) + Math.abs(dy); d.x = e.clientX; d.y = e.clientY;
        if (d.moved > 6) {                       // drag any direction: left/right = turn, up/down = tilt camera
          st.current.yaw += dx * 0.4;
          st.current.pitch = clamp(st.current.pitch - dy * 0.3, PITCH_MIN, PITCH_MAX);
        }
      }}
      onPointerUp={(e) => {
        const tap = drag.current && drag.current.moved < 6 && ptrs.current.size < 2;
        ptrs.current.delete(e.pointerId); if (ptrs.current.size < 2) pinch.current = 0;
        if (tap && getPlacing()) {                // a click / tap on the ground while placing
          const g = groundAt(e.clientX, e.clientY);
          if (g) { moveGhost(g.x, g.y, false); if (e.pointerType === 'mouse') commitPlacing(); }
        }
        setTimeout(() => { drag.current = null; }, 0);
      }}
      onPointerCancel={(e) => { ptrs.current.delete(e.pointerId); pinch.current = 0; drag.current = null; }}
      onPointerLeave={(e) => { ptrs.current.delete(e.pointerId); pinch.current = 0; drag.current = null; }}>
      <div className="sky"><div className="sky-body" /><div className="mount m1" /><div className="mount m2" /><div className="mount m3" /></div>
      <div className="world" ref={world}>
        {city}
        {placedEls}
        <Ghost night={night} />
        <Avatar refs={refs} skin={skin} cos={cos} />
        {shop.pet && <Pet key={shop.pet} id={shop.pet} refs={petRefs} />}
      </div>
      <div className="grade" aria-hidden="true" />
      <PlacementBar />

      {nearSpot && !dialogOpen && !placing && <button className="prompt" onClick={() => act(nearSpot.id)}><kbd>F</kbd><span><b>{nearSpot.label}</b> · {nearSpot.hint}</span></button>}

      {candidates[0] && (
        <aside className={`nudge-card ${nudgeOpen ? '' : 'min'}`}>
          <button className="nudge-head" onClick={() => setNudgeOpen(!nudgeOpen)}>
            <span><i>Revisit nudge</i> <b>{candidates[0].name}</b></span>{nudgeOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
          {nudgeOpen && (
            <div className="nudge-body">
              <p>Quiet for {dormantLabel(dormantDays(candidates[0]))}. “{candidates[0].reasonCategory}”</p>
              <button className="btn blue" onClick={() => open('project', candidates[0].id)}><Eye size={14} /> Inspect</button>
            </div>
          )}
        </aside>
      )}

      <div className="help"><span>Walk: <b>WASD / Arrows</b></span><i>/</i><span>Look: <b>Drag (any direction)</b></span><i>/</i><span>Zoom: <b>Wheel / Pinch</b></span><i>/</i><span>Interact: <b>F</b></span></div>
      <div className="dpad">
        <button {...hold('w')} style={{ gridArea: 'u' }} aria-label="Forward">▲</button>
        <button {...hold('a')} style={{ gridArea: 'l' }} aria-label="Left">◀</button>
        <button {...hold('s')} style={{ gridArea: 'd' }} aria-label="Back">▼</button>
        <button {...hold('d')} style={{ gridArea: 'r' }} aria-label="Right">▶</button>
        <button {...hold('q')} style={{ gridArea: 'q' }} aria-label="Turn left">⟲</button>
        <button {...hold('e')} style={{ gridArea: 'e' }} aria-label="Turn right">⟳</button>
      </div>
    </div>
  );
}