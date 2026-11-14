import type { RefObject } from 'react';
import { Box } from '../components/Box3D';
import type { Skin } from './textures';

type R = RefObject<HTMLDivElement | null>;
export interface AvatarRefs { root: R; ub: R; hd: R; ll: R; rl: R; la: R; ra: R }
export interface Cosmetics { hat: string | null; face: string | null; back: string | null }

const Hat = ({ id }: { id: string }) => {
  switch (id) {
    case 'hardhat': return <><Box w={18} d={18} h={6} z={52} c="#f5c518" /><Box w={11} d={11} h={3} z={58} c="#e0b010" /><Box w={4} d={18} h={1.5} x={10} z={52} c="#f5c518" /></>;
    case 'cap': return <><Box w={17} d={17} h={5} z={52} c="#d8483b" /><Box w={8} d={12} h={1.5} x={11} z={52} c="#a82e24" /></>;
    case 'tophat': return <><Box w={22} d={22} h={2} z={52} c="#14141b" /><Box w={14} d={14} h={14} z={54} c="#1a1a22" /><Box w={14.6} d={14.6} h={3} z={54} c="#c0392b" /></>;
    case 'crown': return (
      <><Box w={18} d={18} h={4} z={52} c="#f2c94c" />
        {[[-6, -6], [6, -6], [-6, 6], [6, 6]].map(([x, y], i) => <Box key={i} w={4} d={4} h={5} x={x} y={y} z={56} c="#f2c94c" />)}
        <div className="emit"><Box w={3} d={3} h={3} x={8.6} z={53} c="#e5483b" /></div></>);
    default: return null;
  }
};

const Face = ({ id }: { id: string }) => id === 'shades'
  ? <Box w={1.6} d={15} h={3.6} x={8.7} z={41.5} c="#0c0c10" />
  : id === 'goggles'
    ? <><Box w={2} d={15} h={4.6} x={8.9} z={41} c="#2b8fd9" /><Box w={16.8} d={16.8} h={1.6} z={42.5} c="#2f2f36" /></>
    : null;

const Back = ({ id }: { id: string }) => {
  if (id === 'backpack') return <><Box w={6} d={11} h={14} x={-7} z={20} c="#c0392b" /><Box w={1.5} d={7} h={5} x={-10.2} z={24} c="#8f2a1f" /></>;
  if (id === 'cape') return <Box w={1.6} d={15} h={26} x={-5.3} z={10} c="#b21f2d" />;
  if (id === 'wings') return <><Box w={1.4} d={14} h={17} x={-5.8} y={-10} z={21} c="#f0f4ff" /><Box w={1.4} d={14} h={17} x={-5.8} y={10} z={21} c="#f0f4ff" /><Box w={1.4} d={8} h={9} x={-6.6} y={-12} z={14} c="#dbe4ff" /><Box w={1.4} d={8} h={9} x={-6.6} y={12} z={14} c="#dbe4ff" /></>;
  return null;
};

/** Minecraft-style builder. Faces +x. Limbs pivot at hip/shoulder so they can swing; the upper body bobs for idle breathing.
 *  Wrappers carry a static default pose so the same model can also be shown (spinning) in the shop preview. */
export function Avatar({ refs, skin, cos }: { refs: AvatarRefs; skin: Skin; cos: Cosmetics }) {
  const leg = <Box w={8} d={8} h={18} z={-18} c={skin.bottom} bg={{ e: skin.legFront, n: skin.legSide, s: skin.legSide, w: skin.legSide }} />;
  const arm = <Box w={8} d={8} h={18} z={-18} c={skin.sleeve} bg={{ e: skin.armFront, n: skin.armSide, s: skin.armSide, w: skin.armSide }} />;
  return (
    <div ref={refs.root} className="box">
      <div className="shadow" />
      <div ref={refs.ll} className="box" style={{ transform: 'translate3d(0,-4px,18px)' }}>{leg}</div>
      <div ref={refs.rl} className="box" style={{ transform: 'translate3d(0,4px,18px)' }}>{leg}</div>
      <div ref={refs.ub} className="box">
        <Box w={8} d={16} h={18} z={18} c={skin.top} bg={{ e: skin.torsoFront, w: skin.torsoBack, n: skin.torsoSide, s: skin.torsoSide }} />
        {cos.back && <Back id={cos.back} />}
        <div ref={refs.la} className="box" style={{ transform: 'translate3d(0,-12px,36px)' }}>{arm}</div>
        <div ref={refs.ra} className="box" style={{ transform: 'translate3d(0,12px,36px)' }}>{arm}</div>
        <div ref={refs.hd} className="box">
          <Box w={16} d={16} h={16} z={36} c={skin.hair} bg={{ e: skin.headFront, t: skin.hair, w: skin.headBack, n: skin.headSide, s: skin.headSide }} />
          {skin.longHair && <Box w={2.6} d={15.4} h={19} x={-9} z={22} c={skin.hair} />}
          {cos.hat && <Hat id={cos.hat} />}
          {cos.face && <Face id={cos.face} />}
        </div>
      </div>
    </div>
  );
}
