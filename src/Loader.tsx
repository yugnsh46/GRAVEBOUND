import { useEffect, useRef, useState } from 'react';

const STEPS = ['Surveying the plots…', 'Raising the buildings…', 'Planting trees…', 'Lighting the lamps…', 'Waking the city…'];
const MIN_MS = 3200;

/* skyline that builds itself while the world loads: [left %, width px, height px, colour] */
const SKYLINE: [number, number, number, string][] = [
  [4, 46, 92, '#2a3a63'], [12, 38, 150, '#33477a'], [20, 54, 112, '#26365c'], [29, 40, 188, '#3b5390'], [37, 60, 100, '#2c3d6b'],
  [47, 44, 214, '#42609f'], [56, 56, 126, '#2a3a63'], [65, 40, 170, '#38508a'], [73, 58, 96, '#26365c'], [82, 42, 148, '#33477a'], [90, 50, 110, '#2c3d6b'],
];

export function Loader({ onDone }: { onDone: () => void }) {
  const [pct, setPct] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const doneRef = useRef(onDone); doneRef.current = onDone;

  useEffect(() => {
    const t0 = performance.now();
    let raf = 0, last = -1, fontsReady = false, finished = false;
    const timers: number[] = [];
    document.fonts?.ready.then(() => { fontsReady = true; });
    timers.push(window.setTimeout(() => { fontsReady = true; }, 5000));   // never hang on a slow font request
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / MIN_MS);
      let v = (1 - Math.pow(1 - p, 2.2)) * 100;                              // quick start, soft landing
      if (!fontsReady) v = Math.min(v, 94);
      const n = Math.floor(v);
      if (n !== last) { last = n; setPct(n); }
      if (p >= 1 && fontsReady && !finished) {
        finished = true; setPct(100);
        timers.push(window.setTimeout(() => setLeaving(true), 350));
        timers.push(window.setTimeout(() => doneRef.current(), 1100));
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); timers.forEach((id) => clearTimeout(id)); };
  }, []);

  return (
    <div className={`loader ${leaving ? 'leave' : ''}`} role="status" aria-live="polite" aria-label="Loading GRAVEBOUND">
      <div className="ld-stars" aria-hidden="true" />
      <div className="ld-moon" aria-hidden="true" />
      <div className="ld-center">
        <div className="ld-logo" aria-hidden="true"><i className="ld-dia" /><i className="ld-ring" /></div>
        <h1 className="ld-title" aria-label="GRAVEBOUND">{'GRAVEBOUND'.split('').map((c, i) => <span key={i} style={{ animationDelay: `${0.2 + i * 0.08}s` }}>{c}</span>)}</h1>
        <p className="ld-sub">Interactive 3D sanctuary for unfinished projects</p>
        <div className="ld-bar"><i style={{ width: `${pct}%` }} /></div>
        <div className="ld-meta"><span>{pct >= 100 ? 'Welcome, builder.' : STEPS[Math.min(STEPS.length - 1, Math.floor(pct / 20))]}</span><b>{pct}%</b></div>
      </div>
      <div className="ld-city" aria-hidden="true">
        {SKYLINE.map(([l, w, h, c], i) => <div key={i} className="ld-b" style={{ left: `${l}%`, width: w, height: h, background: c, animationDelay: `${0.4 + i * 0.22}s` }}><u style={{ animationDelay: `${1 + i * 0.22}s` }} /></div>)}
        <div className="ld-walker"><i /><b /></div>
      </div>
      <div className="ld-ground" aria-hidden="true" />
    </div>
  );
}
