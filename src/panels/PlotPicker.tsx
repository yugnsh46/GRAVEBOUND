import { useRef } from 'react';
import type { PointerEvent } from 'react';
import { HY, LM_X, LM_Y, ROAD, VX, W, collides, freeSpot, snap } from '../world/layout';
import type { Pt } from '../world/layout';

export type Placed = Pt & { name: string };

/** Top-down map of the city. Click or drag to choose where the building will stand. */
export function PlotPicker({ value, onChange, others, rows }: { value: Pt; onChange: (p: Pt) => void; others: Placed[]; rows: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const down = useRef(false);
  const H = HY(rows) + 260;
  const bad = collides(value, others);

  const pick = (e: PointerEvent<SVGSVGElement>) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    onChange(snap(((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H, rows));
  };

  return (
    <div className="picker">
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="City map. Click to place your building."
        onPointerDown={(e) => { down.current = true; e.currentTarget.setPointerCapture(e.pointerId); pick(e); }}
        onPointerMove={(e) => down.current && pick(e)}
        onPointerUp={() => { down.current = false; }} onPointerCancel={() => { down.current = false; }}>
        <rect width={W} height={H} rx="40" fill="#5aa043" />
        <rect x="150" y="110" width={W - 300} height={HY(0) - 200} fill="#c9c4b4" />
        {Array.from({ length: 5 }, (_, j) => <rect key={`v${j}`} x={VX(j) - ROAD / 2} y={HY(0) - 70} width={ROAD} height={HY(rows) - HY(0) + 140} fill="#4a4f5c" />)}
        {Array.from({ length: rows + 1 }, (_, k) => <rect key={`h${k}`} x={VX(0) - 70} y={HY(k) - ROAD / 2} width={VX(4) - VX(0) + 140} height={ROAD} fill="#4a4f5c" />)}
        {Array.from({ length: 7 }, (_, i) => <rect key={`l${i}`} x={LM_X(i) - 90} y={LM_Y - 60} width="180" height="120" rx="14" fill="#34406a" />)}
        {others.map((o, i) => (
          <g key={i}>
            <rect x={o.x - 115} y={o.y - 82} width="230" height="204" rx="18" fill="#8d8a7c" stroke="#5f5c52" strokeWidth="6" />
            <text x={o.x} y={o.y + 20} textAnchor="middle" fontSize="54" fontWeight="700" fill="#fff" style={{ pointerEvents: 'none' }}>{o.name.length > 11 ? o.name.slice(0, 10) + '…' : o.name}</text>
          </g>
        ))}
        <rect x={value.x - 115} y={value.y - 82} width="230" height="204" rx="18" fill={bad ? '#e5483b99' : '#2fae6bcc'} stroke={bad ? '#8f2a1a' : '#14663b'} strokeWidth="10" strokeDasharray="26 14" />
        <text x={value.x} y={value.y + 22} textAnchor="middle" fontSize="64" fontWeight="800" fill="#fff" style={{ pointerEvents: 'none' }}>{bad ? 'TAKEN' : 'NEW'}</text>
      </svg>
      <div className="picker-row">
        <span className={bad ? 'err' : 'ok-txt'}>{bad ? 'This spot overlaps another building.' : 'Spot is free. Click or drag to move it.'}</span>
        <button type="button" className="btn" onClick={() => onChange(freeSpot(others))}>Auto-pick</button>
      </div>
    </div>
  );
}