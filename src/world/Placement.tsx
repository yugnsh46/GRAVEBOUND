import { Check, X } from 'lucide-react';
import { cancelPlacing, commitPlacing, usePlacing } from '../placement';
import { ITEMS, STRUCT_FOOT } from '../shopData';
import { Structure } from './Structures';

/** The see-through-ish preview of the structure being placed: the real model plus a green / red footprint. */
export function Ghost({ night }: { night: boolean }) {
  const p = usePlacing();
  if (!p) return null;
  const [fw, fh] = STRUCT_FOOT[p.key] ?? [20, 20];
  return (
    <div className="box ghost">
      <i className={`tp ghost-foot ${p.ok ? 'ok' : 'bad'}`} style={{ width: fw * 2 + 18, height: fh * 2 + 18, marginLeft: -(fw + 9), marginTop: -(fh + 9), transform: `translate3d(${p.x}px,${p.y}px,2.6px)` }} />
      <div className="box ghost-lift"><Structure id={p.key} x={p.x} y={p.y} night={night} /></div>
    </div>
  );
}

/** Bottom bar shown while a structure is being placed. */
export function PlacementBar() {
  const p = usePlacing();
  if (!p) return null;
  const item = ITEMS.find((i) => i.id === `struct:${p.key}`);
  return (
    <div className="place-bar" role="status" onPointerDown={(e) => e.stopPropagation()} onPointerUp={(e) => e.stopPropagation()}>
      <div className="place-txt">
        <b>{item?.icon} Placing {item?.name}</b>
        <span>{p.ok ? 'Move the mouse (or tap the map) to choose a spot, then click to drop it.' : 'That spot is blocked. Try somewhere open.'}</span>
      </div>
      <button className="btn primary" disabled={!p.ok} onClick={() => commitPlacing()}><Check size={15} /> Place here</button>
      <button className="btn" onClick={() => cancelPlacing()}><X size={15} /> Cancel</button>
    </div>
  );
}
