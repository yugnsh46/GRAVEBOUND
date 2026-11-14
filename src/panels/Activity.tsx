import { useMemo, useState } from 'react';
import { Check, Flame, TrendingUp } from 'lucide-react';
import { Modal } from '../components/Modal';
import { buildHeatmap, useActivity } from '../activity';
import { KIND_LABEL, fmtDate } from '../data';
import { useStore } from '../store';
import { useUI } from '../ui';

export default function Activity({ onClose }: { onClose: () => void }) {
  const { projects } = useStore();
  const { open } = useUI();
  const [pid, setPid] = useState('all');
  const real = useActivity();
  const hm = useMemo(() => buildHeatmap(real.days), [real]);
  const reanimated = projects.filter((p) => p.status === 'reviving' || p.status === 'resurrected').length;

  const groups = useMemo(() => {
    const all = projects.filter((p) => pid === 'all' || p.id === pid)
      .flatMap((p) => p.events.map((e) => ({ ...e, pid: p.id, pname: p.name })))
      .sort((a, b) => b.date.localeCompare(a.date));
    const m = new Map<string, typeof all>();
    for (const e of all) {
      const k = new Date(e.date + 'T00:00:00').toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
      m.set(k, [...(m.get(k) ?? []), e]);
    }
    return [...m.entries()];
  }, [projects, pid]);

  return (
    <Modal eyebrow="City ledger" title="Activity: the whole project timeline" onClose={onClose} size="lg"
      footer={<select value={pid} onChange={(e) => setPid(e.target.value)} aria-label="Filter by project"><option value="all">All projects</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>}>
      {groups.length === 0 && <p className="empty-state">No history yet.</p>}
      {groups.map(([month, evs]) => (
        <section key={month} className="tl-group">
          <h3>{month}</h3>
          <ol className="timeline">
            {evs.map((e) => (
              <li key={e.id} className={`k-${e.kind}`}>
                <time>{fmtDate(e.date)}</time>
                <div><span className="kind">{KIND_LABEL[e.kind]}</span> <button className="link-btn" onClick={() => open('project', e.pid)}>{e.pname}</button><p>{e.text}</p></div>
              </li>
            ))}
          </ol>
        </section>
      ))}

      <section className="heatmap" aria-label="26-week project activity heatmap">
        <p className="eyebrow-d">Contribution telemetry</p>
        <h3 className="hm-title">26-week project activity heatmap</h3>
        <div className="hm-stats">
          <div><span><TrendingUp size={15} /> Total sanctuary actions</span><b>{hm.total}</b><small>Recorded across last 6 months</small></div>
          <div><span><Flame size={15} /> Current active streak</span><b>{hm.streak} Days</b><small>Consecutive building days</small></div>
          <div><span><Check size={15} /> Projects reanimated</span><b>{reanimated} {reanimated === 1 ? 'Project' : 'Projects'}</b><small>Graduated from junkyard plots</small></div>
        </div>
        <div className="hm-wrap">
          <div className="hm-days"><span /><span>Mon</span><span /><span>Wed</span><span /><span>Fri</span><span /></div>
          <div className="hm-grid">
            {hm.weeks.map((col, w) => (
              <div key={w} className="hm-col">
                {col.map((c) => <i key={c.date} className={`hm hm${c.level} ${c.future ? 'fut' : ''}`} title={c.future ? '' : `${c.count} action${c.count === 1 ? '' : 's'} on ${c.date}`} />)}
              </div>
            ))}
          </div>
        </div>
        <div className="hm-legend"><span className="muted small">Seeded demo activity plus your real actions</span><span>Less <i className="hm hm0" /><i className="hm hm1" /><i className="hm hm2" /><i className="hm hm3" /><i className="hm hm4" /> More</span></div>
      </section>
    </Modal>
  );
}
