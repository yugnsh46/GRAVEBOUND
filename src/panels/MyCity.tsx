import { useMemo, useState } from 'react';
import { LayoutGrid, List, Search } from 'lucide-react';
import { Modal } from '../components/Modal';
import { ProjectCard, StageTag, StatusBadge } from '../components/ProjectCard';
import { CATEGORIES, PATHS, REASONS, STATUS, dormantDays, dormantLabel, fmtDate, progressOf } from '../data';
import { useStore } from '../store';
import { useUI } from '../ui';
import type { Path, Status } from '../types';

type Sort = 'quiet' | 'recent' | 'progress' | 'name';

export default function MyCity({ onClose }: { onClose: () => void }) {
  const { projects } = useStore();
  const { open } = useUI();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<Status | 'all'>('all');
  const [path, setPath] = useState<Path | 'all'>('all');
  const [reason, setReason] = useState('all');
  const [cat, setCat] = useState('all');
  const [sort, setSort] = useState<Sort>('quiet');
  const [view, setView] = useState<'cards' | 'list'>('cards');

  const shown = useMemo(() => {
    const s = q.toLowerCase();
    const list = projects.filter((p) =>
      (status === 'all' || p.status === status) && (path === 'all' || p.path === path) &&
      (reason === 'all' || p.reasonCategory === reason) && (cat === 'all' || p.category === cat) &&
      (!s || [p.name, p.tagline, p.vision, p.reasonStory, ...p.tags].join(' ').toLowerCase().includes(s)));
    const by: Record<Sort, (a: typeof list[number], b: typeof list[number]) => number> = {
      quiet: (a, b) => dormantDays(b) - dormantDays(a),
      recent: (a, b) => b.started.localeCompare(a.started),
      progress: (a, b) => progressOf(b) - progressOf(a),
      name: (a, b) => a.name.localeCompare(b.name),
    };
    return list.sort(by[sort]);
  }, [projects, q, status, path, reason, cat, sort]);

  const statusKeys = Object.keys(STATUS) as Status[];
  const count = (s: Status) => projects.filter((p) => p.status === s).length;

  return (
    <Modal eyebrow="Project archive" title="My City: every project, one place" onClose={onClose} size="xl"
      footer={<><span className="muted">{shown.length} of {projects.length} plots shown</span><button className="btn primary" onClick={() => open('new')}>+ New project</button></>}>
      <div className="chips">
        <button className={`chip ${status === 'all' ? 'on' : ''}`} onClick={() => setStatus('all')}>All <span>{projects.length}</span></button>
        {statusKeys.map((k) => <button key={k} className={`chip ${status === k ? 'on' : ''}`} onClick={() => setStatus(k)}>{STATUS[k].label} <span>{count(k)}</span></button>)}
      </div>
      <div className="toolbar">
        <label className="search"><Search size={16} /><input placeholder="Search names, ideas, stories, tech…" value={q} onChange={(e) => setQ(e.target.value)} /></label>
        <select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Category"><option value="all">Any category</option>{CATEGORIES.map((c) => <option key={c.id}>{c.id}</option>)}</select>
        <select value={path} onChange={(e) => setPath(e.target.value as Path | 'all')} aria-label="Revival path"><option value="all">Any revival path</option>{(Object.keys(PATHS) as Path[]).map((k) => <option key={k} value={k}>{PATHS[k].label}</option>)}</select>
        <select value={reason} onChange={(e) => setReason(e.target.value)} aria-label="Reason stopped"><option value="all">Any reason stopped</option>{REASONS.map((r) => <option key={r}>{r}</option>)}</select>
        <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort"><option value="quiet">Quiet the longest</option><option value="recent">Newest started</option><option value="progress">Most built</option><option value="name">Name A–Z</option></select>
        <div className="seg">
          <button className={view === 'cards' ? 'on' : ''} onClick={() => setView('cards')} aria-label="Card view"><LayoutGrid size={16} /></button>
          <button className={view === 'list' ? 'on' : ''} onClick={() => setView('list')} aria-label="List view"><List size={16} /></button>
        </div>
      </div>

      {shown.length === 0 ? <p className="empty-state">{projects.length ? 'No projects match those filters.' : 'Your city is empty. Found a project to get started.'}</p>
        : view === 'cards' ? <div className="cards">{shown.map((p) => <ProjectCard key={p.id} p={p} onOpen={() => open('project', p.id)} />)}</div>
        : (
          <div className="table-wrap"><table>
            <thead><tr><th>Project</th><th>Stage</th><th>Status</th><th>Path</th><th>Why stopped</th><th>Quiet for</th><th>Last worked</th></tr></thead>
            <tbody>{shown.map((p) => (
              <tr key={p.id} onClick={() => open('project', p.id)}>
                <td><strong>{p.name}</strong><br /><small>{p.tagline}</small></td>
                <td><StageTag pr={progressOf(p)} /></td><td><StatusBadge status={p.status} /></td>
                <td>{PATHS[p.path].label}</td><td>{p.reasonCategory}</td><td>{dormantLabel(dormantDays(p))}</td><td>{fmtDate(p.lastWorked)}</td>
              </tr>))}</tbody>
          </table></div>
        )}
    </Modal>
  );
}
