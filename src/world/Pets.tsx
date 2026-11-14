import type { RefObject } from 'react';
import { Box } from '../components/Box3D';

type R = RefObject<HTMLDivElement | null>;
export interface PetRefs { root: R; hop: R; tail: R }

/* Per-pet motion settings used by the game loop */
export const PET_INFO: Record<string, { tail: [number, number]; scale: number; hover: number; hop: number }> = {
  cat: { tail: [-6.5, 6], scale: 1.5, hover: 0, hop: 2.2 },
  dog: { tail: [-7.5, 7], scale: 1.5, hover: 0, hop: 2.4 },
  bunny: { tail: [-5.5, 4], scale: 1.6, hover: 0, hop: 5.5 },
  robot: { tail: [0, 0], scale: 1.4, hover: 14, hop: 0 },
  dragon: { tail: [-7, 6], scale: 1.4, hover: 0, hop: 2 },
};

const eyes = (base: string, y = '42%') => `radial-gradient(circle at 28% ${y},#0d0d12 0 13%,transparent 14%),radial-gradient(circle at 72% ${y},#0d0d12 0 13%,transparent 14%),${base}`;
const legs = (c: string, dx: number, dy: number, h = 3.2) =>
  [[dx, -dy], [dx, dy], [-dx, -dy], [-dx, dy]].map(([x, y], i) => <Box key={i} w={2.6} d={2.6} h={h} x={x} y={y} c={c} />);

function Model({ id, tail }: { id: string; tail: R }) {
  switch (id) {
    case 'cat': return (<>
      <Box w={13} d={6} h={6} z={3} c="#8b93a0" />{legs('#7a828f', 4.5, 2)}
      <Box w={7} d={7} h={7} x={8} z={5} c="#98a0ad" bg={{ e: eyes('#98a0ad') }} />
      <Box w={2} d={2} h={3} x={8} y={-2.5} z={12} c="#7a828f" /><Box w={2} d={2} h={3} x={8} y={2.5} z={12} c="#7a828f" />
      <div ref={tail} className="box" style={{ transform: 'translate3d(-6.5px,0,6px)' }}><Box w={7} d={1.8} h={1.8} x={-3.5} c="#7a828f" /></div></>);
    case 'dog': return (<>
      <Box w={15} d={7} h={7} z={3} c="#a9743f" />{legs('#8f5f32', 5, 2.2)}
      <Box w={8} d={7} h={7} x={9} z={6} c="#b98348" bg={{ e: eyes('#b98348', '48%') }} />
      <Box w={3} d={4} h={3} x={13.8} z={6.5} c="#e8d4b0" /><Box w={1} d={2} h={1.6} x={15.4} z={8} c="#1a1a1a" />
      <Box w={2} d={2} h={5} x={8} y={-4.6} z={8} c="#6b4423" /><Box w={2} d={2} h={5} x={8} y={4.6} z={8} c="#6b4423" />
      <div ref={tail} className="box" style={{ transform: 'translate3d(-7.5px,0,8px)' }}><Box w={6} d={2} h={2} x={-3} c="#8f5f32" /></div></>);
    case 'bunny': return (<>
      <Box w={10} d={7} h={8} z={2} c="#f4f1ea" />{legs('#e6e1d6', 3.2, 2, 2.6)}
      <Box w={6} d={6} h={6} x={6} z={7} c="#fbf9f4" bg={{ e: eyes('#fbf9f4', '45%') }} />
      <Box w={1.8} d={1.8} h={9} x={5.5} y={-1.8} z={12} c="#fbf9f4" /><Box w={1.8} d={1.8} h={9} x={5.5} y={1.8} z={12} c="#fbf9f4" />
      <div ref={tail} className="box" style={{ transform: 'translate3d(-5.5px,0,4px)' }}><Box w={3.4} d={3.4} h={3.4} x={-1.2} c="#ffffff" /></div></>);
    case 'robot': return (<>
      <Box w={9} d={9} h={8} z={0} c="#c4ccd8" />
      <div className="emit"><Box w={1} d={6} h={2.6} x={4.8} z={3.5} c="#19e3ff" /></div>
      <Box w={1} d={1} h={4} z={8} c="#6b7380" /><div className="emit"><Box w={2} d={2} h={2} z={12} c="#ff4d5e" /></div>
      <Box w={2} d={2} h={5} y={-5.6} z={1} c="#98a2b2" /><Box w={2} d={2} h={5} y={5.6} z={1} c="#98a2b2" />
      <div className="emit"><Box w={5} d={5} h={1.6} z={-2} c="#3ab4ff" /></div>
      <div ref={tail} className="box" /></>);
    case 'dragon': return (<>
      <Box w={14} d={8} h={8} z={3} c="#3fae6b" />{legs('#2f8f55', 5, 2.6, 3.4)}
      <Box w={8} d={7} h={7} x={10} z={6} c="#4fc47c" bg={{ e: eyes('#4fc47c', '40%') }} />
      <Box w={3} d={5} h={3} x={14.8} z={6} c="#5ed48a" />
      <Box w={1.5} d={1.5} h={4} x={9} y={-2.6} z={13} c="#f2c94c" /><Box w={1.5} d={1.5} h={4} x={9} y={2.6} z={13} c="#f2c94c" />
      <Box w={6} d={10} h={1.4} x={-1} y={-9} z={9} c="#2f8f55" /><Box w={6} d={10} h={1.4} x={-1} y={9} z={9} c="#2f8f55" />
      <Box w={9} d={5} h={1.2} z={11} c="#e8d38a" />
      <div ref={tail} className="box" style={{ transform: 'translate3d(-7px,0,6px)' }}><Box w={10} d={3} h={3} x={-5} c="#3fae6b" /><Box w={3} d={3} h={3} x={-11} c="#f2c94c" /></div></>);
    default: return null;
  }
}

export function Pet({ id, refs }: { id: string; refs: PetRefs }) {
  return (
    <div ref={refs.root} className="box">
      <div className="shadow pet-shadow" />
      <div ref={refs.hop} className="box"><Model id={id} tail={refs.tail} /></div>
    </div>
  );
}
