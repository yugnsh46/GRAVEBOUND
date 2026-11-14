import { AnimatePresence } from 'framer-motion';
import { useUI } from '../ui';
import MyCity from './MyCity';
import NewProject from './NewProject';
import TimeMachine from './TimeMachine';
import Activity from './Activity';
import Rankings from './Rankings';
import BuildersSquare from './BuildersSquare';
import Shop from './Shop';
import Account from './Account';
import Guide from './Guide';
import CityDeed from './CityDeed';
import ProjectDetail from './ProjectDetail';

export function Panels() {
  const { panel, close } = useUI();
  const key = panel ? `${panel.kind}:${panel.id ?? ''}` : '';
  return (
    <AnimatePresence mode="wait">
      {panel?.kind === 'archive' && <MyCity key={key} onClose={close} />}
      {panel?.kind === 'new' && <NewProject key={key} editId={panel.id} onClose={close} />}
      {panel?.kind === 'time' && <TimeMachine key={key} onClose={close} />}
      {panel?.kind === 'activity' && <Activity key={key} onClose={close} />}
      {panel?.kind === 'rank' && <Rankings key={key} onClose={close} />}
      {panel?.kind === 'square' && <BuildersSquare key={key} onClose={close} />}
      {panel?.kind === 'shop' && <Shop key={key} onClose={close} />}
      {panel?.kind === 'account' && <Account key={key} onClose={close} />}
      {panel?.kind === 'guide' && <Guide key={key} onClose={close} />}
      {panel?.kind === 'deed' && <CityDeed key={key} onClose={close} />}
      {panel?.kind === 'project' && panel.id && <ProjectDetail key={key} id={panel.id} onClose={close} />}
    </AnimatePresence>
  );
}
