import { useState } from 'react';
import type { CSSProperties } from 'react';
import { AlertTriangle, Clock, Rewind } from 'lucide-react';
import { Modal } from '../components/Modal';
import { decayLabel, fmtDate, illumination } from '../data';
import { useStore } from '../store';
import { useUI } from '../ui';

const STEPS = [
  { m: 0, t: 'Present day', d: 'Current city timeline.' },
  { m: 1, t: '+1 month', d: 'Recent commits cool down; unreviewed ideas stagnate.' },
  { m: 6, t: '+6 months', d: 'Window lights dim; dependencies pick up security advisories.' },
  { m: 12, t: '+1 year', d: 'Framework versions deprecate; architectural decay sets in.' },
  { m: 24, t: '+2 years', d: 'Total dormancy; deep moss and dust gather without maintenance.' },
];

export default function TimeMachine({ onClose }: { onClose: () => void }) {
  const { projects } = useStore();
  const { shift, setShift } = useUI();
  const [sel, setSel] = useState(shift);
  const step = STEPS.find((s) => s.m === sel) ?? STEPS[0];

  return (
    <Modal eyebrow="Chrono-simulation engine" title="Time Machine: temporal decay simulator" onClose={onClose} size="xl"
      footer={<>
        <button className="btn" onClick={() => { setSel(0); setShift(0); }}><Rewind size={16} /> Reset to present</button>
        <button className="btn primary" onClick={() => { setShift(sel); onClose(); }}>Apply &amp; return to world</button>
      </>}>
      <p className="lead">Simulate the passage of time across the city. As time accelerates forward, unattended projects gradually dim their window illumination, gather dust and moss, and accumulate dependency decay, demonstrating why continuous revival is essential.</p>
      <div className="steps">
        {STEPS.map((s) => (
          <button key={s.m} className={`step ${sel === s.m ? 'on' : ''}`} onClick={() => setSel(s.m)}>
            <b><Clock size={14} /> {s.t}</b><span>{s.d}</span>
          </button>
        ))}
      </div>
      <section className="panel warn">
        <h3><AlertTriangle size={16} /> Project status under current dilation ({sel} months forward)</h3>
        <p className="muted small">{step.d}</p>
        <div className="decay-list">
          {projects.map((p) => {
            const ill = illumination(p, sel);
            const lab = decayLabel(ill);
            return (
              <div key={p.id} className="decay-row">
                <div><strong>{p.name}</strong><small>Last active: {fmtDate(p.lastVisited && p.lastVisited > p.lastWorked ? p.lastVisited : p.lastWorked)}</small></div>
                <div className="decay-bar"><div className="bar"><i style={{ width: `${ill}%`, background: lab.color }} /></div><span>{ill}% illumination</span></div>
                <span className="badge solid" style={{ '--c': lab.color } as CSSProperties}>{lab.text}</span>
              </div>
            );
          })}
          {projects.length === 0 && <p className="empty-state">No buildings to decay yet.</p>}
        </div>
      </section>
    </Modal>
  );
}
