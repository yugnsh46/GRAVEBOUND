import { todayStr } from './data';
import { createStore } from './persist';

export interface JoinRequest { id: string; builder: string; handle: string; projectId: string; projectName: string; skill: string; message: string; date: string; status: 'pending' | 'accepted' | 'declined' }
export interface CommunityProject { id: string; name: string; owner: string; desc: string; looking: string[] }
export interface Application { id: string; projectId: string; projectName: string; skill: string; message: string; date: string }
interface CollabState { requests: JoinRequest[]; open: string[]; applications: Application[] }

const ago = (n: number) => { const d = new Date(todayStr() + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() - n); return d.toISOString().slice(0, 10); };

export const COMMUNITY: CommunityProject[] = [
  { id: 'c-tide', name: 'Tidepool', owner: 'Sara Connor', desc: 'A Rust CLI that visualises disk usage as an ocean map.', looking: ['Rust', 'UI Design'] },
  { id: 'c-lumen', name: 'Lumen Notes', owner: 'Kiran Rao', desc: 'Local-first markdown notes with graph links. Stalled at sync.', looking: ['Sync & CRDTs', 'React'] },
  { id: 'c-pixel', name: 'Pixel Pantry', owner: 'Elena Vance', desc: 'Pantry tracker with barcode scanning and recipe suggestions.', looking: ['Mobile', 'Computer Vision'] },
  { id: 'c-orbit', name: 'Orbit Chess', owner: 'Marcus Chen', desc: 'Chess variant on a rotating board. Rules engine is done.', looking: ['Game UI', 'Multiplayer'] },
  { id: 'c-echo', name: 'Echo Journal', owner: 'Kai Takahashi', desc: 'Voice journal that transcribes and tags entries.', looking: ['Audio', 'ML'] },
];
export const SKILLS = ['React & TypeScript', 'Backend & APIs', 'UI / UX Design', 'Data Visualization & Charts', 'Mobile', 'Game Development', 'DevOps & Deployment', 'Testing & QA', 'Technical Writing'];

const init: CollabState = {
  open: [], applications: [],
  requests: [
    { id: 'r1', builder: 'Elena Vance', handle: '@elena_v', projectId: 'demo-quiet', projectName: 'Quiet Hours', skill: 'Data Visualization & Maps', message: 'I have experience building map dashboards. I can help wire up the noise heatmap layer and CSV export!', date: ago(19), status: 'pending' },
    { id: 'r2', builder: 'Marcus Chen', handle: '@marcus_dev', projectId: 'demo-orchard', projectName: 'Pocket Orchard', skill: 'Game Loop & Save Systems', message: 'Love this idea. I can implement the season palette swap and save / load in a few hours.', date: ago(11), status: 'pending' },
    { id: 'r3', builder: 'Kai Takahashi', handle: '@takahashi_k', projectId: 'demo-chat', projectName: 'Parrot Chat', skill: 'Realtime & WebSockets', message: 'I can swap the dead translation API for an open one and add typing indicators.', date: ago(4), status: 'pending' },
  ],
};

const s = createStore<CollabState>('gravebound-collab-v1', init);
export const useCollab = s.useValue;

export const resolveRequest = (id: string, status: 'accepted' | 'declined') =>
  s.set((st) => ({ ...st, requests: st.requests.map((r) => (r.id === id ? { ...r, status } : r)) }));
export const toggleOpen = (projectId: string) =>
  s.set((st) => ({ ...st, open: st.open.includes(projectId) ? st.open.filter((x) => x !== projectId) : [...st.open, projectId] }));
export const apply = (a: Omit<Application, 'id' | 'date'>) =>
  s.set((st) => ({ ...st, applications: [{ ...a, id: Math.random().toString(36).slice(2, 9), date: todayStr() }, ...st.applications] }));
export const withdraw = (id: string) => s.set((st) => ({ ...st, applications: st.applications.filter((a) => a.id !== id) }));
