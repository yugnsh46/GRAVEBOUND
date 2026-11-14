import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

export type PanelKind = 'archive' | 'new' | 'time' | 'activity' | 'rank' | 'square' | 'deed' | 'shop' | 'account' | 'guide' | 'project';
export interface Panel { kind: PanelKind; id?: string; from?: { kind: PanelKind; id?: string } }

interface UI {
  panel: Panel | null;
  open: (kind: PanelKind, id?: string) => void;
  back: () => void;
  close: () => void;
  shift: number;                 // months applied by the Time Machine
  setShift: (n: number) => void;
}
const Ctx = createContext<UI | null>(null);
export const useUI = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error('useUI must be used inside <UIProvider>');
  return c;
};

export function UIProvider({ children }: { children: ReactNode }) {
  // The welcome guide opens automatically the first time the site is visited
  const [panel, setPanel] = useState<Panel | null>(() => {
    try { return localStorage.getItem('gravebound-guide-seen') ? null : { kind: 'guide' }; } catch { return null; }
  });
  const [shift, setShift] = useState(0);
  const open = useCallback((kind: PanelKind, id?: string) =>
    setPanel((prev) => ({ kind, id, from: prev && prev.kind !== kind ? { kind: prev.kind, id: prev.id } : prev?.from })), []);
  const close = useCallback(() => setPanel(null), []);
  const back = useCallback(() => setPanel((p) => (p?.from ? { kind: p.from.kind, id: p.from.id } : null)), []);
  const value = useMemo(() => ({ panel, open, back, close, shift, setShift }), [panel, open, back, close, shift]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
