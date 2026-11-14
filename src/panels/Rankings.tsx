import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { CalendarDays, Medal, Shield, Sparkles, Trophy } from 'lucide-react';
import { Modal } from '../components/Modal';
import { StageTag, StatusBadge } from '../components/ProjectCard';
import { PATHS, dormantDays, dormantLabel, progressOf, recommend, revivalScore, stageOf, todayStr } from '../data';
import { useStore } from '../store';
import { useUI } from '../ui';

type Tab = 'all' | 'month' | 'mine';
interface Row { name: string; handle: string; revived: number; monuments: number; you?: boolean }

const TITLES = ['Graveyard Sovereign', 'Master Necromancer', 'Code Reanimator', 'Relic Restorer', 'Blueprint Forger', 'Foundations Mason', 'Rookie Gravedigger', 'Plot Scout'];
const MEDAL = ['#e0902a', '#9aa5b5', '#c2762f'];

/* Seeded demonstration builders (everyone else in the city) */
const ALL_TIME: Row[] = [
  { name: 'Elena Vance', handle: '@elena_v', revived: 11, monuments: 5 },
  { name: 'Marcus Chen', handle: '@marcus_systems', revived: 9, monuments: 4 },
  { name: 'Kiran Rao', handle: '@kiran_cloud', revived: 7, monuments: 3 },
  { name: 'Kai Takahashi', handle: '@takahashi_k', revived: 6, monuments: 2 },
  { name: 'Sara Connor', handle: '@sara_rustacean', revived: 4, monuments: 1 },
];
const MONTH: Row[] = [
  { name: 'Marcus Chen', handle: '@marcus_systems', revived: 5, monuments: 2 },
  { name: 'Elena Vance', handle: '@elena_v', revived: 4, monuments: 1 },
  { name: 'Kai Takahashi', handle: '@takahashi_k', revived: 3, monuments: 1 },
  { name: 'Sara Connor', handle: '@sara_rustacean', revived: 2, monuments: 1 },
  { name: 'Kiran Rao', handle: '@kiran_cloud', revived: 1, monuments: 0 },
];

export default function Rankings({ onClose }: { onClose: () => void }) {
  const { projects } = useStore();
  const { open } = useUI();
  const [tab, setTab] = useState<Tab>('all');

  /* "You" is computed from your real projects */
  const you = useMemo<{ all: Row; month: Row }>(() => {
    const since = new Date(todayStr() + 'T00:00:00Z'); since.setUTCDate(since.getUTCDate() - 30);
    const cut = since.toISOString().slice(0, 10);
    const ev = projects.flatMap((p) => p.events.map((e) => ({ ...e, pid: p.id })));
    const monthRevived = new Set(ev.filter((e) => e.date >= cut && /^Chose path: (?!Archive)/.test(e.text)).map((e) => e.pid)).size;
    const monthMon = new Set(ev.filter((e) => e.date >= cut && e.text.startsWith('Resurrected')).map((e) => e.pid)).size;
    return {
      all: { name: 'You', handle: '@your_city', you: true,
        revived: projects.filter((p) => p.status === 'reviving' || p.status === 'resurrected').length,
        monuments: projects.filter((p) => p.status === 'resurrected' || stageOf(progressOf(p)) === 3).length },
      month: { name: 'You', handle: '@your_city', you: true, revived: monthRevived, monuments: monthMon },
    };
  }, [projects]);

  const rows = useMemo(() => {
    const list = [...(tab === 'month' ? MONTH : ALL_TIME), tab === 'month' ? you.month : you.all];
    return list.sort((a, b) => b.revived - a.revived || b.monuments - a.monuments || (a.you ? 1 : -1));
  }, [tab, you]);

  const ranked = useMemo(() => [...projects].map((p) => ({ p, score: revivalScore(p) })).sort((a, b) => b.score - a.score), [projects]);

  const tabs = (
    <>
      <button className={`tab ${tab === 'all' ? 'on' : ''}`} onClick={() => setTab('all')}><Trophy size={16} /> All-time reanimators</button>
      <button className={`tab ${tab === 'month' ? 'on' : ''}`} onClick={() => setTab('month')}><CalendarDays size={16} /> This month</button>
      <button className={`tab ${tab === 'mine' ? 'on' : ''}`} onClick={() => setTab('mine')}><Sparkles size={16} /> My project potential</button>
      <span className="seed-chip">✦ Seeded demonstration rankings</span>
    </>
  );

  return (
    <Modal eyebrow="Sanctuary honors" title="Revival leaderboard: top reanimators" onClose={onClose} size="lg" tabs={tabs}
      footer={<><span className="muted small">{tab === 'mine' ? 'Score = how built it is, why you stopped and how few tasks remain.' : 'Revived = projects with a chosen revival path. Monuments = finished towers.'}</span>
        <button className="btn primary" onClick={onClose}><Shield size={16} /> Return to sanctuary</button></>}>
      {tab !== 'mine' ? (
        <div className="table-wrap flush"><table className="lb">
          <thead><tr><th>Rank</th><th>Builder</th><th>Honorary title</th><th className="c">Projects revived</th><th className="c">Fully rebuilt</th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.handle} className={r.you ? 'you' : ''}>
                <td className="rk">{i < 3 ? <Medal size={22} color={MEDAL[i]} /> : <b>#{i + 1}</b>}</td>
                <td><div className="builder"><span className="avatar">{r.name[0]}</span><div><strong>{r.name}</strong>{r.you && <span className="you-tag">YOU</span>}<small>{r.handle}</small></div></div></td>
                <td><span className="title-chip">{TITLES[i] ?? 'Plot Scout'}</span></td>
                <td className="c num-c">{r.revived}</td>
                <td className="c mono">{r.monuments} monument{r.monuments === 1 ? '' : 's'}</td>
              </tr>
            ))}
          </tbody>
        </table></div>
      ) : (
        <ol className="rank-list">
          {ranked.map(({ p, score }, i) => {
            const r = recommend(p);
            return (
              <li key={p.id} className="rank-row">
                <span className="rank-n">{i < 3 ? <Medal size={24} color={MEDAL[i]} /> : i + 1}</span>
                <div className="rank-main">
                  <strong>{p.name}</strong> <StatusBadge status={p.status} /> <StageTag pr={progressOf(p)} />
                  <small>{progressOf(p)}% built · quiet {dormantLabel(dormantDays(p))} · suggested <b style={{ color: PATHS[r.path].color }}>{PATHS[r.path].label}</b></small>
                  <div className="bar"><i style={{ width: `${score}%`, background: '#e98a2c' }} /></div>
                </div>
                <span className="rank-score" style={{ '--c': '#e98a2c' } as CSSProperties}>{score}<small>/100</small></span>
                <button className="btn" onClick={() => open('project', p.id)}>Inspect</button>
              </li>
            );
          })}
          {ranked.length === 0 && <p className="empty-state">Nothing to rank yet.</p>}
        </ol>
      )}
    </Modal>
  );
}
