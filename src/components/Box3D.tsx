import type { ReactNode } from 'react';

/* A CSS-3D block. Dimensions are w (x), d (y), h (z, up). Position is the block's base centre. */
type Face = 't' | 'e' | 'w' | 's' | 'n';
export type BoxProps = {
  w: number; d: number; h: number; x?: number; y?: number; z?: number; c: string;
  bg?: Partial<Record<Face, string>>; front?: ReactNode; east?: ReactNode; children?: ReactNode;
};

export function Box({ w, d, h, x = 0, y = 0, z = 0, c, bg, front, east, children }: BoxProps) {
  const f = (k: Face, fw: number, fh: number, t: string, kids?: ReactNode) => (
    <i className={`face f-${k}`} style={{ width: fw, height: fh, marginLeft: -fw / 2, marginTop: -fh / 2, transform: t, background: bg?.[k] ?? c }}>{kids}</i>
  );
  return (
    <div className="box" style={{ transform: `translate3d(${x}px,${y}px,${z}px)` }}>
      {f('t', w, d, `translateZ(${h}px)`)}
      {f('e', d, h, `translate3d(${w / 2}px,0,${h / 2}px) rotateY(90deg) rotateZ(-90deg)`, east)}
      {f('w', d, h, `translate3d(${-w / 2}px,0,${h / 2}px) rotateY(-90deg) rotateZ(90deg)`)}
      {f('s', w, h, `translate3d(0,${d / 2}px,${h / 2}px) rotateX(-90deg)`, front)}
      {f('n', w, h, `translate3d(0,${-d / 2}px,${h / 2}px) rotateX(90deg) rotateZ(180deg)`)}
      {children}
    </div>
  );
}
