import { Box } from '../components/Box3D';

const at = (x: number, y: number) => ({ transform: `translate3d(${x}px,${y}px,0)` });

const clockFace = 'linear-gradient(#222,#222) 50% 24%/2px 28% no-repeat,linear-gradient(#222,#222) 64% 50%/22% 2px no-repeat,radial-gradient(circle,#fffbe8 0 55%,#2b2b2b 56% 62%,#d9c9a0 63%)';

export function Structure({ id, x, y, night }: { id: string; x: number; y: number; night: boolean }) {
  switch (id) {
    case 'flowers': return (
      <div className="box" style={at(x, y)}>
        <Box w={46} d={24} h={5} c="#6a4a2e" bg={{ t: '#5a3d26' }} />
        {['#e5483b', '#f5c518', '#ff7ab8', '#ffffff', '#b57bff', '#ff9a3c', '#e5483b', '#f5c518'].map((c, i) => (
          <Box key={i} w={4} d={4} h={4} x={-18 + i * 5.2} y={i % 2 ? 5 : -5} z={5 + (i % 3) * 2} c={c} />))}
        {Array.from({ length: 8 }, (_, i) => <Box key={`s${i}`} w={1.2} d={1.2} h={6} x={-18 + i * 5.2} y={i % 2 ? 5 : -5} z={5} c="#2f8a3a" />)}
      </div>);
    case 'bench': return (
      <div className="box" style={at(x, y)}>
        <Box w={36} d={10} h={3} z={9} c="#8b5a2b" /><Box w={36} d={2.4} h={11} y={-4.6} z={9} c="#7a4d22" />
        <Box w={3} d={10} h={9} x={-14} c="#2b2f38" /><Box w={3} d={10} h={9} x={14} c="#2b2f38" />
      </div>);
    case 'fountain': return (
      <div className="box" style={at(x, y)}>
        <Box w={54} d={54} h={8} c="#9aa3b2" />
        <div className="emit"><Box w={46} d={46} h={3} z={7} c="#5fc7ee" /></div>
        <Box w={10} d={10} h={22} z={8} c="#b8c0cc" /><Box w={28} d={28} h={4} z={24} c="#a9b2c0" />
        <div className="emit"><Box w={22} d={22} h={2} z={27} c="#6fd0f5" /><Box w={4} d={4} h={12} z={28} c="#bfe8ff" /></div>
        {night && <div className="glow" style={{ transform: 'translate3d(0,0,4px)' }} />}
      </div>);
    case 'statue': return (
      <div className="box" style={at(x, y)}>
        <Box w={28} d={28} h={14} c="#a9afb9" /><Box w={32} d={32} h={3} z={14} c="#8e95a1" />
        <Box w={5} d={5} h={12} x={0} y={-3.2} z={17} c="#d8b24a" /><Box w={5} d={5} h={12} x={0} y={3.2} z={17} c="#d8b24a" />
        <Box w={8} d={13} h={14} z={29} c="#e0bb54" /><Box w={8} d={8} h={8} z={43} c="#ecc760" />
        <Box w={3} d={3} h={15} y={8.5} z={31} c="#e0bb54" /><Box w={3} d={3} h={9} y={-8.5} z={31} c="#e0bb54" />
      </div>);
    case 'gazebo': return (
      <div className="box" style={at(x, y)}>
        <Box w={58} d={58} h={3} c="#c9b48a" />
        {[[-24, -24], [24, -24], [-24, 24], [24, 24]].map(([cx, cy], i) => <Box key={i} w={5} d={5} h={34} x={cx} y={cy} z={3} c="#e8e4d6" />)}
        <Box w={66} d={66} h={5} z={37} c="#a8442f" /><Box w={38} d={38} h={6} z={42} c="#8c3724" /><Box w={3} d={3} h={9} z={48} c="#f2c94c" />
      </div>);
    case 'clock': return (
      <div className="box" style={at(x, y)}>
        <Box w={32} d={32} h={58} c="#b9a888" /><Box w={36} d={36} h={6} z={58} c="#6b5a40" />
        <div className="emit"><Box w={26} d={26} h={26} z={64} c="#d9c9a0" bg={{ e: clockFace, w: clockFace, n: clockFace, s: clockFace }} /></div>
        <Box w={32} d={32} h={8} z={90} c="#6b5a40" /><Box w={4} d={4} h={14} z={98} c="#f2c94c" />
      </div>);
    default: return null;
  }
}
