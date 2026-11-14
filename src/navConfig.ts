import type { PanelKind } from './ui';

/**
 * Single source of truth for the premium landmark buildings.
 * The navigation bar (Hud.tsx) AND the buildings on the map (World.tsx / Landmarks.tsx)
 * both read their names from here, so a name can never drift apart again.
 * The order here is the order of the nav bar and of the buildings along the plaza.
 */
export interface NavItem { kind: PanelKind; a: string; b: string; hint: string; icon: string; color: string; cls?: string }

export const NAV_ITEMS: NavItem[] = [
  { kind: 'archive', a: 'MY', b: 'CITY', hint: 'Browse every project', icon: '🏙️', color: '#6a8cbc' },
  { kind: 'new', a: 'NEW', b: 'PROJECT', hint: 'Found or import a project', icon: '🏗️', color: '#d8893a', cls: 'primary' },
  { kind: 'time', a: 'TIME', b: 'MACHINE', hint: 'Simulate temporal decay', icon: '⏳', color: '#4fb6d8' },
  { kind: 'activity', a: 'ACTIVITY', b: '', hint: 'Full project timeline', icon: '📈', color: '#8e75e0' },
  { kind: 'rank', a: 'RANKINGS', b: '', hint: 'Which project to revive first', icon: '🏆', color: '#d9a82e' },
  { kind: 'square', a: "BUILDERS'", b: 'SQUARE', hint: 'Co-build with other builders', icon: '🤝', color: '#2f9a78' },
  { kind: 'deed', a: 'CITY', b: 'DEED', hint: 'Backup, import, demo data', icon: '📜', color: '#a8845a' },
];

/** The text printed on the nav button and on the building sign, e.g. "TIME MACHINE". */
export const navLabel = (n: NavItem) => (n.b ? `${n.a} ${n.b}` : n.a);
