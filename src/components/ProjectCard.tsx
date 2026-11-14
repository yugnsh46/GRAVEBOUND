import type { CSSProperties } from 'react';
import { Clock } from 'lucide-react';
import { STAGES, STATUS, catIcon, dormantDays, dormantLabel, progressOf, stageOf } from '../data';
import type { Project } from '../types';

export function StatusBadge({ status }: { status: Project['status'] }) {
  return <span className="badge" style={{ '--c': STATUS[status].color } as CSSProperties}>{STATUS[status].label}</span>;
}

export function StageTag({ pr }: { pr: number }) {
  const s = STAGES[stageOf(pr)];
  return <span className="badge solid" style={{ '--c': s.color } as CSSProperties}>{s.icon} {s.short}</span>;
}

export function ProjectCard({ p, onOpen }: { p: Project; onOpen: () => void }) {
  const pr = progressOf(p);
  return (
    <button className="pcard" onClick={onOpen} style={{ '--c': STAGES[stageOf(pr)].color } as CSSProperties}>
      <div className="pcard-top"><span className="cat">{catIcon(p.category)} {p.category}</span><StatusBadge status={p.status} /></div>
      <h3>{p.name}</h3>
      <p className="tag-line">{p.tagline}</p>
      <div className="bar"><i style={{ width: `${pr}%` }} /></div>
      <div className="pcard-foot">
        <StageTag pr={pr} />
        <span>{pr}% built</span>
        <span><Clock size={12} /> {dormantLabel(dormantDays(p))}</span>
      </div>
      <p className="cause">“{p.reasonCategory}”</p>
    </button>
  );
}
