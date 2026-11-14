import type { LucideIcon } from 'lucide-react';
import { Activity, Building2, CircleHelp, Clock, FileText, Pause, Play, Plus, SkipForward, Trophy, User, Users, X } from 'lucide-react';
import { CoinIcon } from './components/CoinIcon';
import { clockText, nextPhase, togglePause, useMinutes, usePaused } from './clock';
import { currentUser, useAuth } from './auth';
import { useShop } from './shop';
import { useUI } from './ui';
import { NAV_ITEMS } from './navConfig';
import type { PanelKind } from './ui';

/* Names come from navConfig.ts, the same list the buildings on the map use. Only the icons live here. */
const ICONS: Partial<Record<PanelKind, LucideIcon>> = {
  archive: Building2, new: Plus, time: Clock, activity: Activity, rank: Trophy, square: Users, deed: FileText,
};

function Clock_() {
  const m = useMinutes();
  const paused = usePaused();
  const c = clockText(m);
  return (
    <div className="clockbox">
      <div className="clock"><span>{c.time}</span><span>· {c.phase}</span></div>
      <button className="clock-btn" onClick={togglePause} aria-label={paused ? 'Resume time' : 'Pause time'}>{paused ? <Play size={14} /> : <Pause size={14} />}</button>
      <button className="clock-btn" onClick={nextPhase} aria-label="Jump to the next time of day" title="Next time of day"><SkipForward size={14} /></button>
    </div>
  );
}

export function Hud() {
  const { panel, open, shift, setShift } = useUI();
  const { coins } = useShop();
  const auth = useAuth();
  const user = currentUser(auth);
  return (
    <>
      <div className="brand">
        <h1><span className="dia" />GRAVEBOUND</h1>
        <p>INTERACTIVE 3D SANCTUARY FOR<br />UNFINISHED PROJECTS</p>
      </div>
      <nav className="navpanel" aria-label="Main">
        {NAV_ITEMS.map((n) => {
          const Icon = ICONS[n.kind] ?? Building2;
          return (
            <button key={n.kind} className={`navbtn ${n.cls ?? ''} ${panel?.kind === n.kind ? 'active' : ''}`} onClick={() => open(n.kind)}>
              <Icon size={14} /><span>{n.a}{n.b && <><br />{n.b}</>}</span>
            </button>
          );
        })}
        <button className={`coin shop ${panel?.kind === 'shop' ? 'active' : ''}`} onClick={() => open('shop')} title="Shop: outfits, pets & structures"><CoinIcon size={18} /> {coins}<span>SHOP</span></button>
      </nav>
      <div className="topright">
        <Clock_ />
        <button className={`acct ${user ? 'on' : ''} ${panel?.kind === 'account' ? 'active' : ''}`} onClick={() => open('account')} title={user ? `Architect dossier: ${user.username}` : 'Sign in or register'}>
          <User size={15} />{user ? <span className="acct-name">{user.username}</span> : <span className="acct-in">SIGN<br />IN</span>}
        </button>
        <button className="helpbtn" onClick={() => open('guide')} aria-label="Open the guide" title="Guide & controls"><CircleHelp size={18} /></button>
      </div>
      {shift !== 0 && <button className="shift-chip" onClick={() => setShift(0)}>⏳ +{shift >= 12 ? `${shift / 12} YEAR${shift > 12 ? 'S' : ''}` : `${shift} MONTH${shift > 1 ? 'S' : ''}`} <X size={12} /></button>}
    </>
  );
}
