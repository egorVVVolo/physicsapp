// FIG: bodies and their momentum. Each body has a velocity (hollow arrow, right positive). Once revealed, its momentum
// p = mv (src/physics/momentum) is a solid ink arrow, all to one scale, so a slow heavy body and a fast light one can be
// compared at a glance. One lane per body, or all on one track heading at each other (`shared`) with their total.
import type { ReactNode } from 'react';
import { G as Group, Line, Path } from 'react-native-svg';
import { momentum, totalMomentum } from '@/physics/momentum';
import { fixed, signed } from '@/physics/format';
import type { BodiesFig } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { STILL, useTween, type DrawClock } from './anim';
import { ForceArrow, Hatch, MonoLabel } from './draw';
import { Ball, HollowArrow, stage, TROLLEY, Trolley } from './kit';

export const BODIES_VB = { w: 340, h: 230 };

const PEN = { ground: [0, 0.35], bodies: [0.25, 0.65], labels: [0.65, 0.95] } as const;
const LANES = [88, 186]; // centre of each body (lanes mode)
const START = 70; // where the arrows start (lanes mode)
const ROOM = 230; // the longest arrow (lanes mode)
const SHARED = { floor: 150, KP: 50, KV: 30 };

const NAMES = { cricket: 'CRICKET BALL', bowling: 'BOWLING BALL', trolley: 'TROLLEY' } as const;
const radius = (look: BodiesFig['bodies'][number]['look']) => (look === 'bowling' ? 22 : look === 'cricket' ? 6 : 0);

type Props = { fig: BodiesFig; clock?: DrawClock };

export function BodiesFigure({ fig, clock = STILL }: Props) {
  const grow = useTween(fig.p === 'shown' ? 1 : 0, fig.p === 'shown' ? 1 : 0, 520);
  const staged = (pen: readonly [number, number], children: ReactNode) => stage(clock, pen, children);
  return fig.shared ? <Shared fig={fig} grow={grow} stage={staged} /> : <Lanes fig={fig} grow={grow} stage={staged} />;
}

type Part = { fig: BodiesFig; grow: number; stage: (pen: readonly [number, number], children: ReactNode) => ReactNode };

/** One lane each: the body on the left, its velocity and (revealed) momentum running right, each to one scale. */
function Lanes({ fig, grow, stage }: Part) {
  const { palette: p } = useTheme();
  const ps = fig.bodies.map((b) => momentum(b.m, b.v));
  const kp = ROOM / Math.max(...ps.map(Math.abs));
  const kv = ROOM / Math.max(...fig.bodies.map((b) => Math.abs(b.v)));
  return (
    <Group>
      {fig.bodies.map((b, i) => {
        const y = LANES[i];
        const r = radius(b.look);
        const vLen = Math.max(10, b.v * kv);
        return (
          <Group key={b.id}>
            {stage(
              PEN.ground,
              b.look === 'cricket' ? (
                <Line x1={14} y1={y} x2={START - 12} y2={y} stroke={p.label} strokeWidth={1} strokeDasharray="2 4" />
              ) : (
                <Hatch x1={10} x2={330} y={y + r} color={p.draw} />
              ),
            )}
            {stage(PEN.bodies, <Body look={b.look} x={START - 30} y={y} r={r} />)}
            {stage(
              PEN.labels,
              <Group>
                <MonoLabel x={14} y={y - 50} text={`${NAMES[b.look]} · ${fixed(b.m, b.m < 1 ? 2 : 1)} kg · v ${fixed(b.v, Math.abs(b.v) >= 10 ? 0 : 1)} m s⁻¹`} color={p.label} size={8.5} anchor="start" />
                <HollowArrow from={[START, y - 30]} to={[START + vLen, y - 30]} color={p.label} weight="track" minLen={4} />
                {fig.p !== undefined && (
                  <Group>
                    {grow > 0.02 && <ForceArrow x1={START} y1={y - 4} x2={START + ps[i] * kp * grow} y2={y - 4} color={p.ink} width={3.2} />}
                    <MonoLabel x={START} y={y + 13} text={fig.p === 'shown' ? `p = ${fixed(ps[i], 2)} kg m s⁻¹` : 'p = ?'} color={p.ink} size={9} anchor="start" />
                  </Group>
                )}
              </Group>,
            )}
          </Group>
        );
      })}
    </Group>
  );
}

/** All on one track, heading at each other: velocities, momenta (revealed) and the total under the track. */
function Shared({ fig, grow, stage }: Part) {
  const { palette: p } = useTheme();
  const y = SHARED.floor;
  const total = totalMomentum(fig.bodies);
  const totalText = fig.total === 'shown' ? `Σp = ${Math.abs(total) < 0.005 ? '0' : `${signed(total, 2)} kg m s⁻¹`}` : 'Σp = ?';
  // the first body on the left facing right, the second on the right facing left, a gap between their buffers
  const rears = [24, 316];
  return (
    <Group>
      {stage(PEN.ground, <Hatch x1={10} x2={330} y={y} color={p.draw} />)}
      {stage(
        PEN.ground,
        <Group>
          <Path d="M14,26 H40" stroke={p.label} strokeWidth={1.2} />
          <Path d="M35,22 L41,26 L35,30" stroke={p.label} strokeWidth={1.2} fill="none" />
          <MonoLabel x={46} y={29} text="+" color={p.label} size={10} anchor="start" />
        </Group>,
      )}
      {fig.bodies.map((b, i) => {
        const facing = i === 0 ? 1 : -1;
        const mid = rears[i] + (facing * TROLLEY.w) / 2;
        const pb = momentum(b.m, b.v);
        const vLen = b.v * SHARED.KV;
        return (
          <Group key={b.id}>
            {stage(PEN.bodies, <Trolley rear={rears[i]} floor={y} facing={facing} text={`${b.id} ${fixed(b.m, 2)} kg`} buffer="spring" />)}
            {stage(
              PEN.labels,
              <Group>
                <HollowArrow from={[mid, y - 52]} to={[mid + vLen, y - 52]} color={p.label} weight="track" minLen={4} />
                <MonoLabel x={mid + vLen / 2} y={y - 67} text={`v = ${signed(b.v, 1)} m s⁻¹`} color={p.ink} size={9} />
                {fig.p !== undefined && (
                  <Group>
                    {grow > 0.02 && <ForceArrow x1={mid} y1={y - 88} x2={mid + pb * SHARED.KP * grow} y2={y - 88} color={p.ink} width={3.2} />}
                    <MonoLabel x={mid + (pb * SHARED.KP) / 2} y={y - 99} text={fig.p === 'shown' ? `p = ${signed(pb, 2)}` : 'p = ?'} color={p.ink} size={9} />
                  </Group>
                )}
              </Group>,
            )}
          </Group>
        );
      })}
      {fig.total !== undefined &&
        stage(
          PEN.labels,
          <Group>
            <MonoLabel x={170} y={y + 40} text={totalText} color={p.ink} size={11} />
            {fig.p === 'shown' && <MonoLabel x={170} y={y + 56} text="kg m s⁻¹, + to the right" color={p.label} size={8} />}
          </Group>,
        )}
    </Group>
  );
}

/** A cricket ball (small, with a seam) or a bowling ball (large, three finger holes), flat. */
function Body({ look, x, y, r }: { look: BodiesFig['bodies'][number]['look']; x: number; y: number; r: number }) {
  if (look === 'trolley') return <Trolley rear={x - TROLLEY.w / 2} floor={y} facing={1} text="" buffer="none" />;
  return <Ball look={look} x={x} y={y} r={r} />;
}
