import { useState } from 'react';
import type { CSSProperties } from 'react';
import { ArrowLeft, Check, Circle, ExternalLink, Eye, PartyPopper, Pencil, Plus, Trash2 } from 'lucide-react';
import { Modal } from '../components/Modal';
import { StageTag, StatusBadge } from '../components/ProjectCard';
import { KIND_LABEL, PATHS, STATUS, catIcon, dormantDays, dormantLabel, fmtDate, progressOf, recommend } from '../data';
import { useStore } from '../store';
import { useUI } from '../ui';
import type { Path } from '../types';

export default function ProjectDetail({ id, onClose }: { id: string; onClose: () => void }) {
  const { get, toggleTask, choosePath, update, log, revisit, remove, setStatus } = useStore();
  const { open, back, panel } = useUI();
  const p = get(id);
  const [note, setNote] = useState('');

  if (!p) return <Modal eyebrow="Project dossier" title="Plot not found" onClose={onClose} size="md"><p className="empty-state">This project no longer exists.</p></Modal>;

  const pr = progressOf(p);
  const done = p.tasks.filter((t) => t.done), todo = p.tasks.filter((t) => !t.done);
  const rec = recommend(p);
  const events = [...p.events].sort((a, b) => a.date.localeCompare(b.date));
  const paths = ['restart', 'continue', 'change', 'repurpose', 'archive'] as Path[];
  const addNote = () => { if (note.trim()) { log(p.id, 'note', note.trim()); setNote(''); } };

  return (
    <Modal eyebrow={`Project dossier · ${catIcon(p.category)} ${p.category}`} title={p.name} onClose={onClose} size="xl"
      footer={<>
        {panel?.from ? <button className="btn ghost" onClick={back}><ArrowLeft size={16} /> Back</button> : <span />}
        <div className="foot-actions">
          <button className="btn" onClick={() => revisit(p.id)}><Eye size={16} /> Mark revisited</button>
          <button className="btn" onClick={() => open('new', p.id)}><Pencil size={16} /> Edit</button>
          <button className="btn danger" onClick={() => { if (confirm(`Permanently demolish “${p.name}”?`)) { remove(p.id); onClose(); } }}><Trash2 size={16} /> Delete</button>
        </div>
      </>}>
      <div className="dossier-head">
        <div className="p-badges"><StatusBadge status={p.status} /><StageTag pr={pr} />{p.path !== 'undecided' && <span className="badge" style={{ '--c': PATHS[p.path].color } as CSSProperties}>{PATHS[p.path].label}</span>}</div>
        <p className="lead">{p.tagline}</p>
        <p className="muted">{fmtDate(p.started)} – {fmtDate(p.lastWorked)} · quiet for {dormantLabel(dormantDays(p))}{p.lastVisited && <> · last visited {fmtDate(p.lastVisited)}</>}</p>
        {(p.tags.length > 0 || p.repo) && <div className="tags">{p.tags.map((t) => <span key={t} className="tag">{t}</span>)}{p.repo && <a className="tag link" href={p.repo} target="_blank" rel="noreferrer">Repository <ExternalLink size={12} /></a>}</div>}
      </div>

      <div className="p-grid">
        <div className="p-main">
          <section className="panel"><h3>Description &amp; history</h3><h4>What I wanted to build</h4><p>{p.vision || <span className="muted">Nothing written yet.</span>}</p></section>
          <section className="panel">
            <div className="panel-head"><h3>Built vs. unfinished</h3><strong>{pr}%</strong></div>
            <div className="bar big"><i style={{ width: `${pr}%` }} /></div>
            <p className="muted small">Tick an unfinished item once you finish it. It moves to “completed”, lights up the building, and is added to the timeline.</p>
            <div className="two lists">
              <div><h4>Still unfinished ({todo.length})</h4>{todo.length === 0 && <p className="muted">Nothing left. Time to ship it.</p>}
                <ul className="tasks">{todo.map((t) => <li key={t.id}><button onClick={() => toggleTask(p.id, t.id)}><Circle size={16} /> {t.text}</button></li>)}</ul></div>
              <div><h4>Completed ({done.length})</h4>{done.length === 0 && <p className="muted">Nothing finished yet.</p>}
                <ul className="tasks done">{done.map((t) => <li key={t.id}><button onClick={() => toggleTask(p.id, t.id)} title="Mark unfinished"><Check size={16} /> {t.text}</button></li>)}</ul></div>
            </div>
          </section>
          <section className="panel"><h3>Why I stopped</h3><p className="cause-big">“{p.reasonCategory}”</p><p>{p.reasonStory || <span className="muted">No story written. Edit the project to add one.</span>}</p></section>
          <section className="panel"><h3>Timeline</h3>
            <ol className="timeline">{events.map((e) => <li key={e.id} className={`k-${e.kind}`}><time>{fmtDate(e.date)}</time><div><span className="kind">{KIND_LABEL[e.kind]}</span><p>{e.text}</p></div></li>)}</ol>
            <div className="add-note"><input placeholder="Add a note to the timeline…" value={note} onChange={(e) => setNote(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addNote()} /><button className="btn" onClick={addNote}><Plus size={16} /> Add</button></div>
          </section>
        </div>

        <aside className="p-side">
          <section className="panel revival"><h3>Revival paths</h3>
            <p className="suggest"><strong>Suggested: {PATHS[rec.path].label}.</strong> {rec.why}</p>
            <div className="path-list">{paths.map((k) => (
              <button key={k} className={`path-opt ${p.path === k ? 'on' : ''} ${rec.path === k ? 'rec' : ''}`} style={{ '--c': PATHS[k].color } as CSSProperties} onClick={() => choosePath(p.id, k)} aria-pressed={p.path === k}>
                <b>{PATHS[k].label}</b><span>{PATHS[k].short}</span></button>))}</div>
            {p.path !== 'undecided' && (
              <div className="plan"><h4>{PATHS[p.path].label}: starter steps</h4>
                <ul>{PATHS[p.path].steps.map((s) => <li key={s}>{s}</li>)}</ul>
                <label>My plan<textarea rows={4} value={p.plan} onChange={(e) => update(p.id, { plan: e.target.value })} placeholder="What will you do first, and by when?" /></label>
                <div className="plan-actions">
                  {p.status !== 'resurrected' && p.path !== 'archive' && <button className="btn primary" onClick={() => setStatus(p.id, 'resurrected')}><PartyPopper size={16} /> Mark resurrected</button>}
                  <button className="btn ghost" onClick={() => choosePath(p.id, 'undecided')}>Undo decision</button>
                </div>
              </div>)}
            <p className="muted small">Status: {STATUS[p.status].hint}</p>
          </section>
        </aside>
      </div>
    </Modal>
  );
}
