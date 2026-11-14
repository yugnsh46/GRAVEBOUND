import { useRef, useState } from 'react';
import { Download, FlaskConical, Trash2, Upload } from 'lucide-react';
import { Modal } from '../components/Modal';
import { useStore } from '../store';
import type { Project } from '../types';

export default function CityDeed({ onClose }: { onClose: () => void }) {
  const { projects, loadDemo, replaceAll, clearAll } = useStore();
  const file = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState('');

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(projects, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `gravebound-city-deed-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(a.href);
    setMsg(`Exported ${projects.length} projects.`);
  };
  const importJson = async (f: File | undefined) => {
    if (!f) return;
    try {
      const data = JSON.parse(await f.text()) as Project[];
      if (!Array.isArray(data) || data.some((p) => !p.id || !p.name || !Array.isArray(p.tasks) || !Array.isArray(p.events))) throw new Error('bad');
      replaceAll(data.map((p) => ({ ...p, category: p.category ?? 'Web App' })));
      setMsg(`Imported ${data.length} projects.`);
    } catch { setMsg('That file is not a GRAVEBOUND city deed.'); }
    if (file.current) file.current.value = '';
  };

  return (
    <Modal eyebrow="Ownership records" title="City Deed: backup, import & demo data" onClose={onClose} size="md">
      <p className="muted">Your whole city lives in this browser. Export the deed to back it up or move it to another device.</p>
      <div className="vault-list">
        <button className="btn" onClick={() => setMsg(`${loadDemo()} demo project(s) added.`)}><FlaskConical size={16} /> Load demo projects</button>
        <button className="btn" onClick={exportJson}><Download size={16} /> Export city deed (JSON)</button>
        <button className="btn" onClick={() => file.current?.click()}><Upload size={16} /> Import city deed</button>
        <input ref={file} type="file" accept="application/json" hidden onChange={(e) => importJson(e.target.files?.[0])} />
        <button className="btn danger" onClick={() => { if (confirm('Demolish the whole city? This cannot be undone.')) { clearAll(); setMsg('City demolished.'); } }}><Trash2 size={16} /> Demolish everything</button>
      </div>
      {msg && <p className="ok" role="status">{msg}</p>}
    </Modal>
  );
}
