import { useState } from 'react';
import type { DragEvent, FormEvent } from 'react';
import { Check, Flame, GripVertical, LogIn, LogOut, ShieldCheck, Tag, Trash2, Trophy, User as UserIcon, UserPlus } from 'lucide-react';
import { Modal } from '../components/Modal';
import { logout, login, register, currentUser, useAuth } from '../auth';
import { realStreak, useActivity } from '../activity';
import { demoProjects, progressOf, stageOf } from '../data';
import { useStore } from '../store';

type View = 'home' | 'signin' | 'register';
type Slot = 'exit' | 'reset';

export default function Account({ onClose }: { onClose: () => void }) {
  const a = useAuth();
  const user = currentUser(a);
  const { projects, replaceAll } = useStore();
  const act = useActivity();
  const [view, setView] = useState<View>('home');
  const [f, setF] = useState({ username: '', password: '', confirm: '', bio: '', skills: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const [over, setOver] = useState<Slot | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  const go = (v: View) => { setView(v); setErr(''); setNote(''); };

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setErr('');
    if (view === 'register' && f.password !== f.confirm) return setErr('The two passwords do not match.');
    setBusy(true);
    const skills = f.skills.split(',').map((x) => x.trim()).filter(Boolean).slice(0, 8);
    const msg = view === 'register' ? await register(f.username, f.password, f.bio, skills) : await login(f.username, f.password);
    setBusy(false);
    if (msg) return setErr(msg);
    setF({ username: '', password: '', confirm: '', bio: '', skills: '' }); setView('home');
    setNote(view === 'register' ? 'Pass created. Welcome, architect!' : 'Signed in. Welcome back!');
  };

  const signOut = () => { logout(); setView('home'); setNote('Signed out. You are browsing as a guest.'); };
  const doReset = () => { replaceAll(demoProjects()); setConfirmReset(false); setNote('City reset: all plots restored to the initial demo state.'); };

  const drop = (slot: Slot) => (e: DragEvent) => {
    e.preventDefault(); setOver(null);
    const what = e.dataTransfer.getData('text/plain');
    if (what !== slot) return setNote(slot === 'exit' ? 'That card belongs in the Demolition Matrix.' : 'That card belongs in the Sanctuary Exit Gate.');
    if (slot === 'exit') signOut(); else setConfirmReset(true);
  };
  const slotProps = (slot: Slot) => ({ onDragOver: (e: DragEvent) => { e.preventDefault(); setOver(slot); }, onDragLeave: () => setOver(null), onDrop: drop(slot) });
  const dragProps = (id: Slot) => ({ draggable: true, onDragStart: (e: DragEvent) => { e.dataTransfer.setData('text/plain', id); e.dataTransfer.effectAllowed = 'move'; } });

  const revived = projects.filter((p) => p.status === 'reviving' || p.status === 'resurrected').length;
  const towers = projects.filter((p) => p.status === 'resurrected' || stageOf(progressOf(p)) === 3).length;
  const streak = realStreak(act.days);

  return (
    <Modal eyebrow="Builder credentials" title="Architect dossier & credentials" onClose={onClose} size="md">
      {user ? (
        <div className="dossier">
          <div className="d-head">
            <span className="d-avatar">{user.username[0].toUpperCase()}</span>
            <div><h3 className="d-name">{user.username}</h3><p className="d-handle">@{user.username}</p></div>
          </div>
          <p className="d-bio">{user.bio || 'Systems architect & open-source archaeologist. Reviving high-potential dead repos.'}</p>
          <p className="d-sess"><ShieldCheck size={15} /> Client demo session · SHA-256 hashed secret · member since {user.created}</p>

          <div className="d-stats">
            <div><Flame size={16} /><b>{streak} {streak === 1 ? 'Day' : 'Days'}</b><span>Consecutive streak</span></div>
            <div><Trophy size={16} /><b>{revived} {revived === 1 ? 'Project' : 'Projects'}</b><span>Projects revived</span></div>
            <div><Check size={16} /><b>{towers} {towers === 1 ? 'Tower' : 'Towers'}</b><span>Fully rebuilt</span></div>
          </div>

          <h4 className="d-sub">Mastered system skills</h4>
          <div className="tags">{user.skills.length ? user.skills.map((s) => <span key={s} className="tag"><Tag size={11} /> {s}</span>) : <span className="muted small">No skills listed. Add some when you register a new pass.</span>}</div>

          <p className="d-canvas">✦ <b>Canvas protocol:</b> drag a card into its slot to commit a session transition.</p>
          <div className="d-pairs">
            <div className="d-card" {...dragProps('exit')}>
              <GripVertical size={16} className="grip" />
              <div><span className="pend">Active pass</span><b>{user.username}’s pass</b><small>Drop into Exit Gate to conclude session</small>
                <button className="btn tiny" onClick={signOut}><LogOut size={13} /> Sign out</button></div>
            </div>
            <div className={`d-slot ${over === 'exit' ? 'over' : ''}`} {...slotProps('exit')}><b>Sanctuary exit gate</b><small>Drop here to sign out active session</small><em>Action destination slot</em></div>

            <div className="d-card" {...dragProps('reset')}>
              <GripVertical size={16} className="grip" />
              <div><span className="pend warn">Reset city</span><b>Sanctuary demolition order</b><small>Drop into Demolition slot to restore demo state</small>
                <button className="btn tiny no-btn" onClick={() => setConfirmReset(true)}><Trash2 size={13} /> Reset</button></div>
            </div>
            <div className={`d-slot danger ${over === 'reset' ? 'over' : ''}`} {...slotProps('reset')}><b>Demolition matrix</b><small>Drop here to reset all plots to initial demo state</small><em>Action destination slot</em></div>
          </div>

          {confirmReset && (
            <div className="d-confirm" role="alertdialog">
              <p><b>Reset the whole city?</b> Your current projects will be replaced by the 8 demo projects.</p>
              <div><button className="btn tiny no-btn" onClick={doReset}>Yes, reset</button> <button className="btn tiny" onClick={() => setConfirmReset(false)}>Cancel</button></div>
            </div>
          )}
          {note && <p className="ok" role="status">{note}</p>}
        </div>
      ) : view === 'home' ? (
        <div className="guest">
          <UserIcon size={44} strokeWidth={1.6} />
          <h3>Browsing as Guest</h3>
          <p>Sign in with your builder credentials or create a demo pass to track your personal streak and revivals.</p>
          <div className="guest-btns">
            <button className="btn primary" onClick={() => go('signin')}><LogIn size={16} /> Sign in form</button>
            <button className="btn" onClick={() => go('register')}><UserPlus size={16} /> Register pass form</button>
          </div>
          {note && <p className="ok" role="status">{note}</p>}
        </div>
      ) : (
        <form className="form acct-form" onSubmit={submit}>
          <h3>{view === 'signin' ? 'Sign in to your pass' : 'Register a demo pass'}</h3>
          <label>Username<input value={f.username} onChange={set('username')} autoComplete="username" placeholder="e.g. yugnshsethi46" autoFocus /></label>
          <label>Password<input type="password" value={f.password} onChange={set('password')} autoComplete={view === 'signin' ? 'current-password' : 'new-password'} placeholder="At least 6 characters" /></label>
          {view === 'register' && (
            <>
              <label>Confirm password<input type="password" value={f.confirm} onChange={set('confirm')} autoComplete="new-password" /></label>
              <label>Short bio <small>(optional)</small><textarea rows={2} value={f.bio} onChange={set('bio')} placeholder="Systems architect & open-source archaeologist…" /></label>
              <label>Mastered skills <small>(comma separated, optional)</small><input value={f.skills} onChange={set('skills')} placeholder="TypeScript, Rust, WebGPU" /></label>
            </>
          )}
          <p className="muted small">Passwords are never stored. Only a salted SHA-256 hash is kept, in this browser.</p>
          {err && <p className="err" role="alert">{err}</p>}
          <div className="actions">
            <button type="button" className="btn ghost" onClick={() => go('home')}>Back</button>
            <button type="button" className="btn" onClick={() => go(view === 'signin' ? 'register' : 'signin')}>{view === 'signin' ? 'Need a pass?' : 'Have a pass?'}</button>
            <button type="submit" className="btn primary" disabled={busy}>{busy ? 'Checking…' : view === 'signin' ? 'Sign in' : 'Create pass'}</button>
          </div>
        </form>
      )}
    </Modal>
  );
}
