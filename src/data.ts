import type { EventKind, Path, Project, Status } from './types';

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
export const todayStr = () => new Date().toISOString().slice(0, 10);

export const CATEGORIES = [
  { id: 'Web App', icon: '🌐' }, { id: 'Developer Tool', icon: '🛠️' }, { id: 'AI Project', icon: '🧠' },
  { id: 'Game Project', icon: '🎮' }, { id: 'Community', icon: '🤝' }, { id: 'Mobile App', icon: '📱' },
];
export const catIcon = (c: string) => CATEGORIES.find((x) => x.id === c)?.icon ?? '📦';

export const STAGES = [
  { name: 'Junkyard scrap plot', short: 'Junkyard', desc: 'Earthen mound, excavated pit, and scrap masonry.', color: '#e5483b', icon: '🗑️' },
  { name: 'Foundation slab', short: 'Foundation', desc: 'A concrete slab and steel columns have been raised.', color: '#e98a2c', icon: '🏗️' },
  { name: 'Under construction', short: 'Build', desc: 'Walls and scaffolding. Half a building stands.', color: '#c9a21a', icon: '🧱' },
  { name: 'Finished tower', short: 'Final', desc: 'A complete glass-fronted tower. Nearly shipped.', color: '#2fae6b', icon: '🏙️' },
];
export const stageOf = (pr: number) => (pr < 25 ? 0 : pr < 50 ? 1 : pr < 80 ? 2 : 3);

export const REASONS = [
  'Ran out of time',
  'Lost interest',
  'Scope grew too big',
  'Hackathon ended',
  'Another priority took over',
  'Got stuck on a hard problem',
  'Tech or idea went outdated',
  'Teammates drifted away',
  'Other',
];

export const STATUS: Record<Status, { label: string; hint: string; color: string }> = {
  resting:     { label: 'Resting',      hint: 'Untouched and waiting for a decision.', color: '#7a6f5d' },
  reviving:    { label: 'Reviving',     hint: 'A revival path is chosen and in motion.', color: '#b5532f' },
  resurrected: { label: 'Resurrected',  hint: 'Finished or shipped. It came back.',     color: '#3f7a50' },
  archived:    { label: 'Archived',     hint: 'Laid to rest on purpose. It still counts.', color: '#5b6b86' },
};

export interface PathInfo {
  label: string; short: string; blurb: string; color: string;
  steps: string[]; // starter checklist for the chosen path
}
export const PATHS: Record<Path, PathInfo> = {
  undecided: { label: 'Undecided', short: 'No decision yet', blurb: 'Still resting. Nothing has been decided.', color: '#7a6f5d', steps: [] },
  restart: {
    label: 'Restart', short: 'Rebuild from scratch',
    blurb: 'Keep the idea, throw away the code. Rebuild it with everything you know now.',
    color: '#b5532f',
    steps: ['Write the idea in one sentence', 'List what you would do differently this time', 'Pick the stack and set up a clean repo', 'Ship the smallest version in one weekend'],
  },
  continue: {
    label: 'Continue', short: 'Pick up where you left off',
    blurb: 'Most of the groundwork exists. Re-open it and finish the next unfinished piece.',
    color: '#3f7a50',
    steps: ['Get the project running locally again', 'Choose ONE unfinished item to finish first', 'Time-box a 2 hour session this week', 'Update the timeline when it is done'],
  },
  change: {
    label: 'Change the idea', short: 'Reshape the scope',
    blurb: 'The original plan was too big. Shrink or redirect it into something finishable.',
    color: '#b8862b',
    steps: ['Cut the scope to a single core feature', 'Rewrite the goal as a one-week deliverable', 'Remove everything that is not the core', 'Define what "finished" means in one line'],
  },
  repurpose: {
    label: 'Repurpose', short: 'Salvage the good parts',
    blurb: 'Pull out the parts that work and give them a new home in a different project.',
    color: '#34739c',
    steps: ['List the parts that actually work', 'Extract them into a reusable module', 'Choose the new project that needs them', 'Leave a note in the old repo pointing to the new one'],
  },
  archive: {
    label: 'Archive', short: 'Let it rest in peace',
    blurb: 'Not every project needs a sequel. Document it, say thanks, and let it go.',
    color: '#5b6b86',
    steps: ['Write a short README about what you learned', 'Make the repo read-only', 'Save any assets or screenshots worth keeping'],
  },
};

export const KIND_LABEL: Record<EventKind, string> = {
  born: 'Started', milestone: 'Milestone', stalled: 'Went quiet', buried: 'Buried here',
  visit: 'Revisited', decision: 'Decision', note: 'Note',
};

export const daysBetween = (from: string, to: string = todayStr()) =>
  Math.max(0, Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86400000));

export const dormantDays = (p: Project) => daysBetween(p.lastWorked);
export const progressOf = (p: Project) => (p.tasks.length ? Math.round((p.tasks.filter((t) => t.done).length / p.tasks.length) * 100) : 0);

export const dormantLabel = (d: number) =>
  d < 1 ? 'today' : d < 31 ? `${d} day${d === 1 ? '' : 's'}` : d < 365 ? `${Math.round(d / 30)} months` : `${(d / 365).toFixed(1).replace('.0', '')} years`;

export const fmtDate = (s: string) =>
  new Date(s + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export function recommend(p: Project): { path: Path; why: string } {
  const pr = progressOf(p);
  const r = p.reasonCategory.toLowerCase();
  if (pr >= 65) return { path: 'continue', why: `It is already ${pr}% built. The shortest road to a finished project is to pick it back up.` };
  if (r.includes('scope')) return { path: 'change', why: 'You stopped because the scope grew. Shrinking it into something finishable fixes the actual cause.' };
  if (r.includes('outdated')) return { path: 'repurpose', why: 'The tech or idea aged out. Salvage what still works and move it somewhere current.' };
  if (r.includes('interest')) return { path: pr > 35 ? 'repurpose' : 'archive', why: 'Interest is gone, so forcing a restart rarely works. Reuse the good parts or let it rest.' };
  if (pr <= 20) return { path: 'restart', why: `Only ${pr}% exists. A clean restart will cost less than untangling old decisions.` };
  if (r.includes('stuck')) return { path: 'change', why: 'A hard problem blocked you. Reshape the idea so that problem is no longer on the critical path.' };
  return { path: 'continue', why: 'Time, not the idea, was the blocker. The idea is still sound so keep going.' };
}

/* ---------------- Demo projects ---------------- */
const t = (text: string, done: boolean) => ({ id: uid(), text, done });
const ev = (date: string, kind: EventKind, text: string) => ({ id: uid(), date, kind, text });

export const demoProjects = (): Project[] => [
  {
    id: 'demo-lantern', category: 'Web App', name: 'The Lantern Archive',
    tagline: 'A web app for collecting the stories behind old family photos.',
    vision: 'Upload a photo, tag the people in it, and let relatives attach short spoken stories. Everything gets stitched into a private family timeline.',
    tasks: [t('Photo wall layout', true), t('Upload flow with previews', true), t('Basic auth', true), t('Face tagging UI', false), t('Audio story recorder', false), t('Private share links', false), t('Family timeline view', false)],
    reasonCategory: 'Another priority took over',
    reasonStory: 'Final-year exams started right as the tagging system got complicated. I told myself I would come back in a week. That was a year ago.',
    status: 'resting', path: 'undecided', plan: '', tags: ['React', 'Firebase', 'Web Audio'], repo: 'https://github.com/example/lantern-archive',
    started: '2024-02-10', lastWorked: '2024-05-14', lastVisited: null,
    events: [ev('2024-02-10', 'born', 'Started after finding grandma\u2019s photo box'), ev('2024-03-02', 'milestone', 'Photo wall and upload flow working'), ev('2024-04-18', 'milestone', 'Basic auth added'), ev('2024-05-14', 'stalled', 'Last commit. Exams began.'), ev('2025-01-06', 'buried', 'Moved into the graveyard')],
  },
  {
    id: 'demo-orchard', category: 'Game Project', name: 'Pocket Orchard',
    tagline: 'A cozy pixel-art garden game where focus sessions grow trees.',
    vision: 'Every completed focus session plants a tree. Trees change with the seasons, and a long streak turns a patch of dirt into an orchard you can walk through.',
    tasks: [t('Tile map renderer', true), t('Tree growth loop', true), t('Sprite set (6 trees)', true), t('Season palette swap', false), t('Save / load', false), t('Apple harvesting', false)],
    reasonCategory: 'Lost interest',
    reasonStory: 'Started during a game jam and the dopamine ran out once the core loop worked. Polish felt like chores.',
    status: 'resting', path: 'undecided', plan: '', tags: ['TypeScript', 'Canvas', 'Aseprite'], repo: '',
    started: '2023-11-02', lastWorked: '2024-02-02', lastVisited: null,
    events: [ev('2023-11-02', 'born', 'Game jam kick-off'), ev('2023-11-05', 'milestone', 'Jam submission: trees grow on a grid'), ev('2024-02-02', 'stalled', 'Stopped opening the repo'), ev('2025-01-06', 'buried', 'Moved into the graveyard')],
  },
  {
    id: 'demo-quiet', category: 'Mobile App', name: 'Quiet Hours',
    tagline: 'A mobile app to find quiet places in a busy city.',
    vision: 'A crowd-sourced map where people rate places by noise level and time of day, so students and remote workers can find a calm table.',
    tasks: [t('Map prototype', true), t('Seed data for 12 places', true), t('User accounts', false), t('Noise rating flow', false), t('Backend + API', false), t('Moderation', false), t('Offline mode', false)],
    reasonCategory: 'Scope grew too big',
    reasonStory: 'Every feature needed another feature. Accounts needed moderation, ratings needed anti-spam, maps needed a paid plan. I could not see the finish line any more.',
    status: 'resting', path: 'undecided', plan: '', tags: ['React Native', 'Mapbox', 'Node'], repo: 'https://github.com/example/quiet-hours',
    started: '2023-08-01', lastWorked: '2023-10-19', lastVisited: null,
    events: [ev('2023-08-01', 'born', 'Sketched on the back of a bus ticket'), ev('2023-09-12', 'milestone', 'Map prototype with 12 places'), ev('2023-10-19', 'stalled', 'Scope exploded. Paused.'), ev('2025-01-06', 'buried', 'Moved into the graveyard')],
  },
  {
    id: 'demo-hack', category: 'Community', name: 'FloodWatch',
    tagline: 'A hackathon tool that warns neighbourhoods before street-level flooding.',
    vision: 'Combine rainfall forecasts with community photos of waterlogged roads and send alerts to people on affected streets.',
    tasks: [t('Rainfall API integration', true), t('Alert threshold logic', true), t('Dashboard map', true), t('Photo reports', true), t('SMS alerts', false), t('Ward-level boundaries', false)],
    reasonCategory: 'Hackathon ended',
    reasonStory: 'We placed third, got a certificate, and then everyone went back to classes. Nobody owned it afterwards.',
    status: 'reviving', path: 'continue', plan: 'Wire SMS through a free-tier provider and ship ward boundaries for just one city. Ask Riya if she wants to co-own it.', tags: ['Next.js', 'Postgres', 'Twilio'], repo: 'https://github.com/example/floodwatch',
    started: '2024-08-16', lastWorked: '2024-08-18', lastVisited: '2025-10-30',
    events: [ev('2024-08-16', 'born', 'Hackathon day 1'), ev('2024-08-18', 'milestone', 'Demo day. Placed 3rd.'), ev('2024-08-18', 'stalled', 'Team disbanded'), ev('2025-10-30', 'visit', 'Reopened the repo. It still runs.'), ev('2025-10-30', 'decision', 'Chose path: Continue')],
  },
  {
    id: 'demo-recipe', category: 'Web App', name: 'Recipe Book',
    tagline: 'A personal cookbook that scales ingredients and builds shopping lists.',
    vision: 'Paste any recipe URL, clean it up, scale servings, and get one combined shopping list for the week.',
    tasks: [t('Recipe parser', true), t('Serving scaler', true), t('Local storage', true), t('Shopping list merge', true), t('Meal planner', true), t('Local image upload', false), t('Print layout', false)],
    reasonCategory: 'Got stuck on a hard problem',
    reasonStory: 'Image upload kept corrupting on Safari and I never found why. I stopped three features from done.',
    status: 'resting', path: 'undecided', plan: '', tags: ['Vue', 'IndexedDB'], repo: 'https://github.com/example/recipe-book',
    started: '2024-06-01', lastWorked: '2024-09-09', lastVisited: null,
    events: [ev('2024-06-01', 'born', 'Wanted a cookbook without ads'), ev('2024-07-20', 'milestone', 'Shopping list merging works'), ev('2024-09-09', 'stalled', 'Safari image bug. Gave up for the night.'), ev('2025-01-06', 'buried', 'Moved into the graveyard')],
  },
  {
    id: 'demo-chat', category: 'Web App', name: 'Parrot Chat',
    tagline: 'A real-time chat app with built-in translation.',
    vision: 'Everyone types in their own language and reads everyone else\u2019s messages in theirs, live.',
    tasks: [t('WebSocket server', true), t('Rooms', true), t('Translation API hookup', false), t('Language detection', false), t('Typing indicators', false), t('Message history', false)],
    reasonCategory: 'Tech or idea went outdated',
    reasonStory: 'The translation API I used was sunset and several big apps shipped the same idea natively.',
    status: 'resting', path: 'undecided', plan: '', tags: ['Socket.IO', 'Express'], repo: '',
    started: '2023-03-14', lastWorked: '2023-05-02', lastVisited: null,
    events: [ev('2023-03-14', 'born', 'Weekend experiment'), ev('2023-05-02', 'stalled', 'Translation API shut down'), ev('2025-01-06', 'buried', 'Moved into the graveyard')],
  },
  {
    id: 'demo-habit', category: 'Mobile App', name: 'Habit Garden',
    tagline: 'A habit tracker where each habit is a plant.',
    vision: 'Skip a day and the plant droops. Keep a streak and it blooms. No guilt notifications, just a garden to look at.',
    tasks: [t('Habit CRUD', true), t('Streak logic', true), t('Plant illustrations (3)', true), t('Streak calendar', true), t('Reminders', true), t('Widgets', true), t('Launch page', false)],
    reasonCategory: 'Other',
    reasonStory: 'It was basically done. I never wrote the launch page and the finish line felt boring.',
    status: 'resurrected', path: 'continue', plan: 'Shipped a one-page launch site and posted it.', tags: ['Svelte', 'PWA'], repo: 'https://github.com/example/habit-garden',
    started: '2024-01-05', lastWorked: '2024-03-30', lastVisited: '2025-11-01',
    events: [ev('2024-01-05', 'born', 'Started on New Year\u2019s resolutions week'), ev('2024-03-30', 'stalled', 'Done but never launched'), ev('2025-10-12', 'decision', 'Chose path: Continue'), ev('2025-11-01', 'milestone', 'Launched. Resurrected!')],
  },
  {
    id: 'demo-term', category: 'Developer Tool', name: 'Termfolio',
    tagline: 'A portfolio website that looks like a terminal.',
    vision: 'Visitors type commands like `projects` and `about` to explore my work.',
    tasks: [t('Command parser', true), t('Boot animation', true), t('Projects command', false), t('Mobile keyboard support', false)],
    reasonCategory: 'Lost interest',
    reasonStory: 'The idea had been done a thousand times. I archived it with respect.',
    status: 'archived', path: 'archive', plan: 'Wrote a README about the command parser trick and kept the repo public.', tags: ['TypeScript', 'CSS'], repo: 'https://github.com/example/termfolio',
    started: '2022-09-01', lastWorked: '2022-10-10', lastVisited: '2025-06-18',
    events: [ev('2022-09-01', 'born', 'Weekend project'), ev('2022-10-10', 'stalled', 'Lost interest'), ev('2025-06-18', 'decision', 'Chose path: Archive')],
  },
];


/* ---------- Time machine: "temporal decay" ---------- */
const lastActive = (p: Project) => (p.lastVisited && p.lastVisited > p.lastWorked ? p.lastVisited : p.lastWorked);
export const idleDays = (p: Project, shiftMonths = 0) => daysBetween(lastActive(p)) + Math.round(shiftMonths * 30.4);
/** 0-100: how "lit" the building is. Neglect dims it. */
export function illumination(p: Project, shiftMonths = 0): number {
  if (p.status === 'archived') return 35;
  const rate = p.status === 'resurrected' ? 60 : 14;
  return Math.max(0, Math.min(100, Math.round(100 - idleDays(p, shiftMonths) / rate)));
}
export const decayLabel = (i: number) =>
  i >= 75 ? { text: 'Active Beacon', color: '#2fae6b' } : i >= 45 ? { text: 'Dimming', color: '#c9a21a' }
    : i >= 15 ? { text: 'Dormant', color: '#e98a2c' } : { text: 'Overgrown', color: '#e5483b' };

/* ---------- Rankings: revival potential ---------- */
export function revivalScore(p: Project): number {
  const r = p.reasonCategory.toLowerCase();
  let s = progressOf(p) * 0.7;
  if (/time|priority|hackathon|teammates/.test(r)) s += 18;
  else if (/stuck|scope/.test(r)) s += 6;
  else if (/interest|outdated/.test(r)) s -= 8;
  s += Math.min(12, p.tasks.filter((t) => !t.done).length === 0 ? 0 : 12 - p.tasks.filter((t) => !t.done).length);
  if (p.status === 'resurrected' || p.status === 'archived') s -= 100;
  return Math.max(0, Math.min(100, Math.round(s)));
}
