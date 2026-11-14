import { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { ProjectBuilding } from '../world/Scenery';
import type { BuildingDesign, Project } from '../types';

/** Rotating 3D preview of a building. It always shows the finished form; real buildings rise as tasks get done. */
export function BuildingPreview({ id, name, design }: { id: string; name: string; design: BuildingDesign }) {
  const [night, setNight] = useState(false);
  const fake: Project = {
    id, name, tagline: '', category: '', vision: '', tasks: [{ id: 't', text: 't', done: true }], reasonCategory: '', reasonStory: '',
    status: 'resting', path: 'undecided', plan: '', tags: [], repo: '', started: '', lastWorked: '', lastVisited: null, events: [], design,
  };
  return (
    <div className={`bprev ${night ? 'night' : 'day'}`} aria-label="3D preview of your building">
      <div className="bprev-tools">
        <button className={!night ? 'on' : ''} onClick={() => setNight(false)} type="button"><Sun size={11} /> Day</button>
        <button className={night ? 'on' : ''} onClick={() => setNight(true)} type="button"><Moon size={11} /> Night</button>
      </div>
      <div className="bprev-world">
        <div className="bprev-pad" />
        <ProjectBuilding p={fake} x={0} y={0} illum={100} night={night} />
      </div>
      <div className="bprev-tag"><span>Finished form · hover to pause</span></div>
    </div>
  );
}
