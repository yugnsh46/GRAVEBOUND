import { useState } from 'react';
import type { DragEvent } from 'react';
import { Check, GripVertical, Send, Shield, Tag, Users, X } from 'lucide-react';
import { Modal } from '../components/Modal';
import { COMMUNITY, SKILLS, apply, resolveRequest, toggleOpen, useCollab, withdraw } from '../collab';
import { fmtDate } from '../data';
import { addCoins } from '../shop';
import { logAction } from '../activity';
import { useStore } from '../store';

type Tab = 'requests' | 'open' | 'apply';

export default function BuildersSquare({ onClose }: { onClose: () => void }) {
  const { projects, get, log } = useStore();
  const c = useCollab();
  const [tab, setTab] = useState<Tab>('requests');
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<'accept' | 'decline' | null>(null);
  const [target, setTarget] = useState(COMMUNITY[0].id);
  const [skill, setSkill] = useState(SKILLS[0]);
  const [msg, setMsg] = useState('');
  const [note, setNote] = useState('');

  const pending = c.requests.filter((r) => r.status === 'pending');
  const resolved = c.requests.filter((r) => r.status !== 'pending');
  const ownOpen = projects.filter((p) => c.open.includes(p.id));

  const decide = (id: string, status: 'accepted' | 'declined') => {
    const r = c.requests.find((x) => x.id === id);
    if (!r) return;
    resolveRequest(id, status); logAction();
    if (status === 'accepted') {
      addCoins(15);
      if (get(r.projectId)) log(r.projectId, 'note', `${r.builder} joined as co-builder (${r.skill})`);
      setNote(`Accepted ${r.builder}. They are now a co-builder on ${r.projectName}. +15 coins.`);
    } else setNote(`Declined ${r.builder}'s proposal.`);
  };
  const drop = (kind: 'accept' | 'decline') => (e: DragEvent) => {
    e.preventDefault(); setOver(null);
    const id = e.dataTransfer.getData('text/plain') || dragId;
    if (id) decide(id, kind === 'accept' ? 'accepted' : 'declined');
    setDragId(null);
  };
  const slot = (kind: 'accept' | 'decline') => ({
    onDragOver: (e: DragEvent) => { e.preventDefault(); setOver(kind); }, onDragLeave: () => setOver(null), onDrop: drop(kind),
  });

  const submit = () => {
    const cp = COMMUNITY.find((x) => x.id === target);
    if (!cp) return;
    if (msg.trim().length < 10) return setNote('Write at least a short message (10+ characters) so the owner knows why you fit.');
    apply({ projectId: cp.id, projectName: cp.name, skill, message: msg.trim() });
    logAction(); setMsg(''); setNote(`Application sent to ${cp.owner} for ${cp.name}.`);
  };

  const tabs = (
    <>
      <button className={`tab ${tab === 'requests' ? 'on' : ''}`} onClick={() => { setTab('requests'); setNote(''); }}><Users size={16} /> Join requests ({pending.length})</button>
      <button className={`tab ${tab === 'open' ? 'on' : ''}`} onClick={() => { setTab('open'); setNote(''); }}><Users size={16} /> Open projects ({ownOpen.length})</button>
      <button className={`tab ${tab === 'apply' ? 'on' : ''}`} onClick={() => { setTab('apply'); setNote(''); }}><Send size={16} /> Apply to co-build</button>
    </>
  );

  return (
    <Modal eyebrow="Co-builder assembly" title="Builders’ Square: open collaboration hub" onClose={onClose} size="lg" tabs={tabs}
      footer={<><span className="muted small">{note || 'Co-builders help finish what you could not.'}</span><button className="btn primary" onClick={onClose}><Shield size={16} /> Return to sanctuary</button></>}>

      {tab === 'requests' && (
        <>
          <p className="lead">✦ <b>Canvas protocol:</b> drag a pending request card into the <b>Accept slot</b> or the <b>Decline slot</b> below, or use the buttons on the card.</p>
          {pending.length === 0 && <p className="empty-state">No pending requests. Open one of your projects to attract co-builders.</p>}
          <div className="req-list">
            {pending.map((r) => (
              <article key={r.id} className="req">
                <div className="req-top"><div><strong>{r.builder}</strong> <span className="handle">{r.handle}</span></div><span className="req-proj">{r.projectName}</span></div>
                <p className="req-skill"><Tag size={14} /> {r.skill}</p>
                <p className="req-msg">“{r.message}”</p>
                <div className="req-row">
                  <span className="req-date">Applied: {fmtDate(r.date)}</span>
                  <div className={`req-card ${dragId === r.id ? 'dragging' : ''}`} draggable
                    onDragStart={(e) => { setDragId(r.id); e.dataTransfer.setData('text/plain', r.id); e.dataTransfer.effectAllowed = 'move'; }}
                    onDragEnd={() => { setDragId(null); setOver(null); }}>
                    <GripVertical size={16} className="grip" />
                    <div className="req-card-body">
                      <span className="pend"><Users size={13} /> Pending proposal</span>
                      <b>{r.builder} ({r.skill})</b>
                      <small>Drag to Accept or Decline slot for “{r.projectName}”</small>
                      <div className="req-btns">
                        <button className="btn tiny ok-btn" onClick={() => decide(r.id, 'accepted')}><Check size={13} /> Accept</button>
                        <button className="btn tiny no-btn" onClick={() => decide(r.id, 'declined')}><X size={13} /> Decline</button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="slots">
            <div className={`slot accept ${over === 'accept' ? 'over' : ''}`} {...slot('accept')}><Check size={20} /><b>Accept slot</b><small>Drop a request here to welcome the builder</small></div>
            <div className={`slot decline ${over === 'decline' ? 'over' : ''}`} {...slot('decline')}><X size={20} /><b>Decline slot</b><small>Drop a request here to politely decline</small></div>
          </div>
          {resolved.length > 0 && (
            <section className="panel"><h3>Resolved requests</h3>
              <ul className="resolved">{resolved.map((r) => <li key={r.id}><span className={`badge solid`} style={{ ['--c' as string]: r.status === 'accepted' ? '#2fae6b' : '#e5483b' }}>{r.status}</span> <b>{r.builder}</b> · {r.projectName} · {r.skill}</li>)}</ul></section>
          )}
        </>
      )}

      {tab === 'open' && (
        <>
          <p className="lead">Mark a project as open for co-builders. Other builders will be able to see it and send you join requests.</p>
          {projects.length === 0 && <p className="empty-state">Found a project first, then open it here.</p>}
          <div className="open-list">
            {projects.map((p) => {
              const isOpen = c.open.includes(p.id);
              const crew = c.requests.filter((r) => r.projectId === p.id && r.status === 'accepted');
              return (
                <div key={p.id} className={`open-row ${isOpen ? 'on' : ''}`}>
                  <div><strong>{p.name}</strong><small>{p.tagline}</small>{crew.length > 0 && <small className="crew">Co-builders: {crew.map((r) => r.builder).join(', ')}</small>}</div>
                  <button className={`switch ${isOpen ? 'on' : ''}`} role="switch" aria-checked={isOpen} onClick={() => { toggleOpen(p.id); logAction(); }}><i /><span>{isOpen ? 'Open for co-builders' : 'Closed'}</span></button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {tab === 'apply' && (
        <div className="two apply">
          <div>
            <h3 className="sec-title">1 · Choose a community project</h3>
            <div className="comm-list">
              {COMMUNITY.map((cp) => (
                <button key={cp.id} className={`comm ${target === cp.id ? 'on' : ''}`} onClick={() => setTarget(cp.id)}>
                  <b>{cp.name}</b><small>by {cp.owner}</small><span>{cp.desc}</span>
                  <em>{cp.looking.map((l) => <i key={l}>{l}</i>)}</em>
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="sec-title">2 · Your pitch</h3>
            <label>Your strongest skill<select value={skill} onChange={(e) => setSkill(e.target.value)}>{SKILLS.map((s) => <option key={s}>{s}</option>)}</select></label>
            <label>Message to the owner<textarea rows={4} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Why are you a good fit? What can you ship in a weekend?" /></label>
            <button className="btn primary" onClick={submit}><Send size={15} /> Send application</button>
            <h3 className="sec-title" style={{ marginTop: '1.2rem' }}>Your applications ({c.applications.length})</h3>
            {c.applications.length === 0 && <p className="muted small">No applications yet.</p>}
            <ul className="resolved">{c.applications.map((a) => (
              <li key={a.id}><span className="badge" style={{ ['--c' as string]: '#c9a21a' }}>pending</span> <b>{a.projectName}</b> · {a.skill} · {fmtDate(a.date)} <button className="link-btn" onClick={() => withdraw(a.id)}>withdraw</button></li>
            ))}</ul>
          </div>
        </div>
      )}
    </Modal>
  );
}
