import { useMemo, useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import { Dices, GitBranch, PencilRuler, RotateCcw } from 'lucide-react';
import { Modal } from '../components/Modal';
import { CATEGORIES, REASONS, STAGES, catIcon, stageOf, todayStr, uid } from '../data';
import { useStore } from '../store';
import { PlotPicker } from './PlotPicker';
import { collides, freeSpot, posOf, rowsFor, warp } from '../world/layout';
import type { Pt } from '../world/layout';
import { useUI } from '../ui';
import { BuildingPreview } from '../components/BuildingPreview';
import { HEIGHT_RANGE, PRESETS, SIZE_RANGE, STYLES, TINTS, defaultDesign, normalizeDesign, randomDesign } from '../design';
import type { BuildingDesign, Task } from '../types';

const lines = (s: string) => s.split('\n').map((l) => l.trim()).filter(Boolean);
const titleCase = (s: string) => s.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

function DesignControls({ d, onChange }: { d: BuildingDesign; onChange: (p: Partial<BuildingDesign>) => void }) {
  const toggle = (k: 'garden' | 'lamps' | 'beacon', label: string) => (
    <button type="button" className={`chip ${d[k] ? 'on' : ''}`} onClick={() => onChange({ [k]: !d[k] })}>{label}</button>
  );
  return (
    <div className="dz">
      <div className="dz-row"><b>Building style</b>
        <div className="dz-styles">{STYLES.map((s) => <button type="button" key={s.id} title={s.hint} className={`dz-style ${d.style === s.id ? 'on' : ''}`} onClick={() => onChange({ style: s.id })}><span>{s.icon}</span>{s.name}</button>)}</div></div>
      <div className="dz-row"><b>Colour theme</b>
        <div className="dz-presets">{PRESETS.map((p) => (
          <button type="button" key={p.name} title={p.name} aria-label={p.name}
            className={`dz-preset ${d.wall === p.wall && d.roof === p.roof ? 'on' : ''}`}
            style={{ '--w': p.wall, '--r': p.roof, '--t': p.trim } as CSSProperties} onClick={() => onChange({ wall: p.wall, trim: p.trim, roof: p.roof })} />))}</div>
        <div className="dz-colors">
          <label>Walls<input type="color" value={d.wall ?? '#cfd8e6'} onChange={(e) => onChange({ wall: e.target.value })} /></label>
          <label>Trim<input type="color" value={d.trim ?? '#8c9db8'} onChange={(e) => onChange({ trim: e.target.value })} /></label>
          <label>Roof<input type="color" value={d.roof ?? '#5a6a85'} onChange={(e) => onChange({ roof: e.target.value })} /></label>
          <button type="button" className="btn tiny" onClick={() => onChange({ wall: undefined, trim: undefined, roof: undefined })}>Auto</button>
        </div></div>
      <div className="dz-row"><b>Window glass</b>
        <div className="dz-tints">{TINTS.map((t) => <button type="button" key={t.id} className={`dz-tint ${d.glass === t.id ? 'on' : ''}`} style={{ '--c': t.c } as CSSProperties} onClick={() => onChange({ glass: t.id })}><i />{t.name}</button>)}</div></div>
      <div className="dz-row"><b>Width &amp; depth <i>{Math.round(d.size * 100)}%</i></b>
        <input type="range" {...SIZE_RANGE} value={d.size} onChange={(e) => onChange({ size: Number(e.target.value) })} /></div>
      <div className="dz-row"><b>Height <i>{Math.round(d.height * 100)}%</i></b>
        <input type="range" {...HEIGHT_RANGE} value={d.height} onChange={(e) => onChange({ height: Number(e.target.value) })} /></div>
      <div className="dz-row"><b>Extras</b>
        <div className="dz-toggles">{toggle('garden', '🌷 Front garden')}{toggle('lamps', '💡 Street lamps')}{toggle('beacon', '🔦 Roof beacon')}</div></div>
      <div className="dz-actions">
        <button type="button" className="btn tiny" onClick={() => onChange(randomDesign())}><Dices size={13} /> Surprise me</button>
        <button type="button" className="btn tiny" onClick={() => onChange({ ...defaultDesign() })}><RotateCcw size={13} /> Reset design</button>
      </div>
    </div>
  );
}

export default function NewProject({ editId, onClose }: { editId?: string; onClose: () => void }) {
  const { get, add, update, log, projects } = useStore();
  const { open } = useUI();
  const editing = editId ? get(editId) : undefined;
  const [tab, setTab] = useState<'manual' | 'github'>('manual');
  const [f, setF] = useState({
    name: editing?.name ?? '', tagline: editing?.tagline ?? '', category: editing?.category ?? 'Web App',
    vision: editing?.vision ?? '',
    done: editing?.tasks.filter((t) => t.done).map((t) => t.text).join('\n') ?? '',
    todo: editing?.tasks.filter((t) => !t.done).map((t) => t.text).join('\n') ?? '',
    reasonCategory: editing?.reasonCategory ?? REASONS[0], reasonStory: editing?.reasonStory ?? '',
    started: editing?.started ?? todayStr(), lastWorked: editing?.lastWorked ?? todayStr(),
    tags: editing?.tags.join(', ') ?? '', repo: editing?.repo ?? '',
  });
  const others = useMemo(() => projects.map((p, i) => ({ ...posOf(p, i), name: p.name, id: p.id })).filter((o) => o.id !== editId), [projects, editId]);
  const rows = rowsFor([...others, ...(editing?.pos ? [editing.pos] : [])]);
  const [pos, setPos] = useState<Pt>(() => editing?.pos ?? freeSpot(others));
  const [draftId] = useState(() => editing?.id ?? uid());   // fixed up-front so the 3D preview matches the real building
  const [design, setDesignState] = useState<BuildingDesign>(() => normalizeDesign(editing?.design));
  const setDesign = (patch: Partial<BuildingDesign>) => setDesignState((d) => ({ ...d, ...patch }));
  const [err, setErr] = useState('');
  const [gh, setGh] = useState('');
  const [ghMsg, setGhMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  const nDone = lines(f.done).length, nTodo = lines(f.todo).length;
  const pr = nDone + nTodo ? Math.round((nDone / (nDone + nTodo)) * 100) : 0;
  const stage = STAGES[stageOf(pr)];

  const importGithub = async () => {
    const m = gh.trim().match(/(?:github\.com\/)?([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?$/);
    if (!m) return setGhMsg('Enter a public repo like owner/name or a full github.com URL.');
    setBusy(true); setGhMsg('');
    try {
      const r = await fetch(`https://api.github.com/repos/${m[1]}/${m[2]}`);
      if (!r.ok) throw new Error(r.status === 404 ? 'Repository not found (is it public?).' : 'GitHub refused the request. Try again later.');
      const d = await r.json() as { name: string; description: string | null; language: string | null; topics?: string[]; created_at: string; pushed_at: string; html_url: string };
      setF((o) => ({ ...o, name: titleCase(d.name), tagline: d.description ?? o.tagline, tags: [d.language, ...(d.topics ?? [])].filter(Boolean).join(', '),
        started: d.created_at.slice(0, 10), lastWorked: d.pushed_at.slice(0, 10), repo: d.html_url }));
      setGhMsg('Imported. Review the details, then add what is done and unfinished.');
      setTab('manual');
    } catch (e) { setGhMsg(e instanceof Error ? e.message : 'Import failed.'); }
    setBusy(false);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!f.name.trim()) return setErr('Give the project a name so we know what is being built here.');
    if (!f.tagline.trim()) return setErr('Describe the project in one line.');
    if (f.lastWorked < f.started) return setErr('"Last worked on" cannot be before the start date.');
    if (collides(pos, others)) return setErr('That spot is already taken. Pick a free spot on the map in step 6.');
    const reuse = (text: string, done: boolean): Task => ({ id: editing?.tasks.find((t) => t.text === text)?.id ?? uid(), text, done });
    const data = {
      name: f.name.trim(), tagline: f.tagline.trim(), category: f.category, vision: f.vision.trim(),
      tasks: [...lines(f.done).map((t) => reuse(t, true)), ...lines(f.todo).map((t) => reuse(t, false))],
      reasonCategory: f.reasonCategory, reasonStory: f.reasonStory.trim(),
      tags: f.tags.split(',').map((t) => t.trim()).filter(Boolean), repo: f.repo.trim(), started: f.started, lastWorked: f.lastWorked,
    };
    warp.to = { x: pos.x, y: pos.y + 150 };
    if (editing) { update(editing.id, { ...data, pos, design }); log(editing.id, 'note', 'Edited project details'); open('project', editing.id); }
    else { const id = add({ ...data, pos, design, id: draftId }); open('project', id); }
  };

  const tabs = (
    <>
      <button className={`tab ${tab === 'manual' ? 'on' : ''}`} onClick={() => setTab('manual')}><PencilRuler size={16} /> Manual architectural design</button>
      <button className={`tab ${tab === 'github' ? 'on' : ''}`} onClick={() => setTab('github')}><GitBranch size={16} /> Public GitHub import</button>
    </>
  );

  return (
    <Modal eyebrow="Sanctuary architecture" title={editing ? `Edit ${editing.name}` : 'Found or import a project'} onClose={onClose} size="xl" tabs={tabs}
      footer={<>
        <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
        <button type="submit" form="np-form" className="btn primary">{editing ? 'Save changes' : 'Found project'}</button>
      </>}>
      {tab === 'github' ? (
        <section className="panel gh">
          <h3><span className="num">1</span> Public repository</h3>
          <p className="muted">Paste a public GitHub repo. We will pull the name, description, language, topics and the first and last commit dates.</p>
          <div className="add-note"><input value={gh} onChange={(e) => setGh(e.target.value)} placeholder="owner/repo or https://github.com/owner/repo" onKeyDown={(e) => e.key === 'Enter' && importGithub()} /><button className="btn primary" onClick={importGithub} disabled={busy}>{busy ? 'Fetching…' : 'Import'}</button></div>
          {ghMsg && <p className={ghMsg.startsWith('Imported') ? 'ok' : 'err'}>{ghMsg}</p>}
        </section>
      ) : (
        <form id="np-form" className="np-grid" onSubmit={submit}>
          <div className="np-left">
            <section className="panel"><h3><span className="num">1</span> Project identity</h3>
              <label>Project title *<input value={f.name} onChange={set('name')} placeholder="e.g. Prism Vector Engine" autoFocus /></label>
              <label>Tagline / mission statement<input value={f.tagline} onChange={set('tagline')} placeholder="e.g. Fast, minimal 2D Bézier curve rasterizer in Rust" /></label>
            </section>
            <section className="panel"><h3><span className="num">2</span> Project category</h3>
              <div className="cat-grid">{CATEGORIES.map((c) => <button type="button" key={c.id} className={`cat-btn ${f.category === c.id ? 'on' : ''}`} onClick={() => setF({ ...f, category: c.id })}>{c.icon} {c.id}</button>)}</div>
            </section>
            <section className="panel"><h3><span className="num">3</span> Project content &amp; roadmap</h3>
              <label>What did you want to build?<textarea rows={2} value={f.vision} onChange={set('vision')} placeholder="The full dream version." /></label>
              <div className="two">
                <label>What did you complete? <small>(one per line)</small><textarea rows={4} value={f.done} onChange={set('done')} placeholder={'Login page\nDatabase schema'} /></label>
                <label>What is still unfinished? <small>(one per line)</small><textarea rows={4} value={f.todo} onChange={set('todo')} placeholder={'Payments\nMobile layout'} /></label>
              </div>
              <div className="two">
                <label>Cause of abandonment<select value={f.reasonCategory} onChange={set('reasonCategory')}>{REASONS.map((r) => <option key={r}>{r}</option>)}</select></label>
                <label>Technology stack <small>(comma separated)</small><input value={f.tags} onChange={set('tags')} placeholder="TypeScript, React" /></label>
              </div>
              <label>The longer story <small>(optional)</small><textarea rows={2} value={f.reasonStory} onChange={set('reasonStory')} placeholder="What actually happened?" /></label>
              <div className="two">
                <label>Started<input type="date" value={f.started} max={todayStr()} onChange={set('started')} /></label>
                <label>Last worked on<input type="date" value={f.lastWorked} max={todayStr()} onChange={set('lastWorked')} /></label>
              </div>
              <label>Repository / link <small>(optional)</small><input type="url" value={f.repo} onChange={set('repo')} placeholder="https://github.com/…" /></label>
            </section>
            {err && <p className="err" role="alert">{err}</p>}
          </div>

          <aside className="np-right">
            <div className="np-preview"><BuildingPreview id={draftId} name={f.name} design={design} /></div>
            <section className="panel"><h3><span className="num">4</span> Live architectural preview</h3>
              <div className="prev-head"><span className="prev-ico">{catIcon(f.category)}</span><div><b>{f.name.trim() || 'Untitled project'}</b><small>{f.category}</small></div></div>
              <div className="stage-card" style={{ '--c': stage.color } as CSSProperties}><b>Stage {stageOf(pr) + 1}: {stage.name}</b><span>{stage.desc}</span></div>
              <div className="init"><div className="init-top"><b>Completion</b><span className="badge" style={{ '--c': '#0c7bc9' } as CSSProperties}>{pr}%</span></div>
                <div className="bar big"><i style={{ width: `${pr}%`, background: stage.color }} /></div></div>
              <p className="muted small">{nDone} done · {nTodo} unfinished. Your design shows fully once the building is finished; until then it rises stage by stage.</p>
            </section>
            <section className="panel"><h3><span className="num">5</span> Design your building</h3>
              <DesignControls d={design} onChange={setDesign} /></section>
            <section className="panel"><h3><span className="num">6</span> Plot placement</h3>
              <p className="muted small">Choose exactly where your building will stand. Click or drag on the map; roads and other buildings are avoided.</p>
              <PlotPicker value={pos} onChange={setPos} others={others} rows={rows} />
            </section>
          </aside>
        </form>
      )}
    </Modal>
  );
}