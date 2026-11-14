import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { PATHS, demoProjects, todayStr, uid } from './data';
import { logAction } from './activity';
import { addCoins } from './shop';
import { freeSpot, plot, withPos } from './world/layout';
import type { EventKind, Path, Project, Status } from './types';

const KEY = 'gravebound-v1';

function load(): Project[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Project[];
      if (Array.isArray(parsed)) return withPos(parsed);
    }
  } catch { /* ignore */ }
  return withPos(demoProjects());
}

interface Store {
  projects: Project[];
  get: (id: string) => Project | undefined;
  add: (p: Omit<Project, 'id' | 'events' | 'status' | 'path' | 'plan' | 'lastVisited'> & { id?: string }) => string;
  update: (id: string, patch: Partial<Project>) => void;
  remove: (id: string) => void;
  log: (id: string, kind: EventKind, text: string, date?: string) => void;
  toggleTask: (id: string, taskId: string) => void;
  choosePath: (id: string, path: Path) => void;
  setStatus: (id: string, status: Status) => void;
  revisit: (id: string) => void;
  loadDemo: () => number;
  replaceAll: (list: Project[]) => void;
  clearAll: () => void;
}

const Ctx = createContext<Store | null>(null);
export const useStore = () => {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore must be used inside <StoreProvider>');
  return s;
};


export function StoreProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(load);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(projects)); } catch { /* ignore */ }
  }, [projects]);

  const map = useCallback((id: string, fn: (p: Project) => Project) =>
    setProjects((ps) => ps.map((p) => (p.id === id ? fn(p) : p))), []);

  const log = useCallback((id: string, kind: EventKind, text: string, date: string = todayStr()) => {
    logAction();
    map(id, (p) => ({ ...p, events: [...p.events, { id: uid(), date, kind, text }] }));
  }, [map]);

  const value = useMemo<Store>(() => ({
    projects,
    get: (id) => projects.find((p) => p.id === id),
    add: (data) => {
      logAction(); addCoins(10);
      const id = data.id ?? uid();
      const t = todayStr();
      const events = [
        { id: uid(), date: data.started, kind: 'born' as const, text: 'Project started' },
        ...(data.lastWorked !== data.started ? [{ id: uid(), date: data.lastWorked, kind: 'stalled' as const, text: `Went quiet: ${data.reasonCategory}` }] : []),
        { id: uid(), date: t, kind: 'buried' as const, text: 'Moved into the graveyard' },
      ];
      setProjects((ps) => [...ps, { ...data, pos: data.pos ?? freeSpot(ps.map((p, i) => p.pos ?? plot(i))), id, status: 'resting', path: 'undecided', plan: '', lastVisited: null, events }]);
      return id;
    },
    update: (id, patch) => map(id, (p) => ({ ...p, ...patch })),
    remove: (id) => setProjects((ps) => ps.filter((p) => p.id !== id)),
    log,
    toggleTask: (id, taskId) => {
      const cur = projects.find((x) => x.id === id)?.tasks.find((t) => t.id === taskId);
      if (cur && !cur.done) addCoins(5);
      logAction();
      map(id, (p) => {
      const task = p.tasks.find((x) => x.id === taskId);
      if (!task) return p;
      const done = !task.done;
      const events = done
        ? [...p.events, { id: uid(), date: todayStr(), kind: 'milestone' as const, text: `Finished: ${task.text}` }]
        : p.events;
      return { ...p, tasks: p.tasks.map((x) => (x.id === taskId ? { ...x, done } : x)), events, lastWorked: done ? todayStr() : p.lastWorked };
      });
    },
    choosePath: (id, path) => { logAction(); map(id, (p) => ({
      ...p, path,
      status: path === 'archive' ? 'archived' : path === 'undecided' ? 'resting' : 'reviving',
      lastVisited: todayStr(),
      events: [...p.events, { id: uid(), date: todayStr(), kind: 'decision', text: `Chose path: ${PATHS[path].label}` }],
    })); },
    setStatus: (id, status) => { logAction(); if (status === 'resurrected') addCoins(25); map(id, (p) => ({
      ...p, status,
      events: [...p.events, { id: uid(), date: todayStr(), kind: 'milestone', text: status === 'resurrected' ? 'Resurrected! Project is back from the dead.' : `Status changed to ${status}` }],
    })); },
    revisit: (id) => { logAction(); map(id, (p) => ({
      ...p, lastVisited: todayStr(),
      events: [...p.events, { id: uid(), date: todayStr(), kind: 'visit', text: 'Revisited the project' }],
    })); },
    loadDemo: () => {
      const have = new Set(projects.map((p) => p.id));
      const fresh = demoProjects().filter((d) => !have.has(d.id));
      if (fresh.length) setProjects((ps) => withPos([...ps, ...fresh]));
      return fresh.length;
    },
    replaceAll: (list) => setProjects(withPos(list)),
    clearAll: () => setProjects([]),
  }), [projects, map, log]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}