export type Path = 'undecided' | 'restart' | 'continue' | 'change' | 'repurpose' | 'archive';
export type Status = 'resting' | 'reviving' | 'resurrected' | 'archived';
export type EventKind = 'born' | 'milestone' | 'stalled' | 'buried' | 'visit' | 'decision' | 'note';

export type BuildingStyle = 'auto' | 'tower' | 'stepped' | 'cottage' | 'podium' | 'dome';
export type GlassTint = 'auto' | 'blue' | 'gold' | 'teal' | 'rose';

/** How the owner wants the finished building to look. Every field is optional on old saved projects. */
export interface BuildingDesign {
  style: BuildingStyle;
  wall?: string; trim?: string; roof?: string;   // hex colours; undefined = automatic palette
  glass: GlassTint;
  size: number;      // footprint scale (width and depth), 1 = normal
  height: number;    // height scale, 1 = normal
  garden: boolean; lamps: boolean; beacon: boolean;
}

export interface Task { id: string; text: string; done: boolean }
export interface TimelineEvent { id: string; date: string; kind: EventKind; text: string }

export interface Project {
  id: string;
  name: string;
  tagline: string;       // What the project was
  category: string;
  vision: string;        // What I wanted to build
  tasks: Task[];         // done = completed, !done = still unfinished
  reasonCategory: string; // Why I stopped (category)
  reasonStory: string;    // Why I stopped (story)
  status: Status;
  path: Path;
  plan: string;          // My plan for the chosen revival path
  tags: string[];
  repo: string;
  started: string;       // YYYY-MM-DD
  lastWorked: string;    // YYYY-MM-DD
  lastVisited: string | null;
  events: TimelineEvent[];
  pos?: { x: number; y: number }; // where the building stands in the city
  design?: BuildingDesign;        // custom look of the building (undefined = automatic)
}