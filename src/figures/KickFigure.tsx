// FIG: balls kicked from one spot on level ground, each at its own angle. Every point of every path comes from
// projectilePosition (src/physics/projectile): sideways uₓt, upward u_y t − ½gt², on one clock.
// The launch velocity is an outline arrow with its angle, optionally split into its two components. The path is a
// dashed curve; played, the flights run in real time with a clock and draw their paths as they go.
// How far and how high are dimension lines, "?" until the question is answered.
// On the explore screen the slider is the launch angle: the path, the time and the distance follow it.
// The first kick figure of a lesson draws itself: ground → launch arrows → paths; the labels come last.
import { Circle, G as Group, Path } from 'react-native-svg';
import { flightTime, launchParts, projectilePosition, projectileRange, timeToTop, topHeight, type Launch } from '@/physics/projectile';
import { fixed } from '@/physics/format';
import type { KickFig } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { stroke } from '@/theme/tokens';
import { useReducedMotionPref } from '@/ui/parts';
import { STILL, useLoopTime, type DrawClock } from './anim';
import { DrawnFade, DrawnPath, FILLS, Hatch, MonoLabel } from './draw';
import { Ball, HollowArrow, stage, Tag } from './kit';

export const KICK_VB = { w: 340, h: 248 };

const GROUND = 212;
const K = 7; // viewBox units per metre
const R = 6; // ball radius
const O: [number, number] = [36, GROUND - R]; // the ball's centre at the kick
const KV = 6; // viewBox units per m s⁻¹ of a launch arrow
const KV_PARTS = 9; // … of a launch arrow split into components (drawn alone, so it can be larger)
const KV_TOP = 3; // … of the velocity at the top
const HOLD = 1.2; // s the played figure waits with every ball landed before it starts again
const RAD = Math.PI / 180;

const PEN = {
  ground: [0, 0.28],
  launch: [0.28, 0.55],
  path: [0.45, 0.8],
  labels: [0.8, 0.95],
} as const;

const launchOf = (u: number, angle: number): Launch => ({ u, angle, h: 0 });
/** Where the ball's centre is drawn at time t of a flight (it rests where it landed). */
function pointAt(l: Launch, t: number): [number, number] {
  const pos = projectilePosition(Math.min(t, flightTime(l)), l);
  return [O[0] + pos.x * K, O[1] - Math.max(0, pos.y) * K];
}

/** The kicks with the explore slider's angle in place of the first one's. */
function kicksOf(fig: KickFig, live?: number) {
  return fig.kicks.map((k, i) => ({ ...k, angle: i === 0 && live !== undefined ? live : k.angle }));
}

/** True when the figure plays the flights (and so gets a pause button). */
export function kickPlays(fig: KickFig): boolean {
  return fig.play === true;
}

/** The given values in the sheet header; on the explore screen (`angle` from the slider) the time and the distance. */
export function kickParams(fig: KickFig, angle?: number): string {
  if (angle !== undefined) {
    const l = launchOf(fig.u, angle);
    return `in the air ${fixed(flightTime(l), 2)} s · lands ${fixed(projectileRange(l), 1)} m away`;
  }
  const angles = fig.kicks.map((k) => `${fixed(k.angle, 0)}°`).join(' and ');
  return `u = ${fixed(fig.u, 0)} m s⁻¹ at ${angles}`;
}

type Props = { fig: KickFig; live?: number; playing: boolean; clock?: DrawClock };

export function KickFigure({ fig, live, playing, clock = STILL }: Props) {
  const { palette: p, material: m } = useTheme();
  const reduced = useReducedMotionPref();
  const kicks = kicksOf(fig, live);
  const plays = kickPlays(fig) && live === undefined;
  const length = Math.max(...kicks.map((k) => flightTime(launchOf(fig.u, k.angle))));
  const loop = useLoopTime(plays && playing && !reduced && !clock.on, length, kicks.map((k) => k.id).join(''), HOLD);
  const timeOf = (l: Launch) => (plays ? (reduced ? length : loop) : fig.at === 'top' ? timeToTop(l) : 0);
  const first = launchOf(fig.u, kicks[0].angle);

  return (
    <Group>
      <Hatch x1={6} x2={334} y={GROUND} color={p.draw} clock={clock} from={PEN.ground[0]} to={PEN.ground[1]} />

      {/* the paths: the whole flight, up to the top, or (while it plays and no path is given) as far as the ball has got */}
      {kicks.map((k) => {
        const l = launchOf(fig.u, k.angle);
        const T = flightTime(l);
        const until = fig.path === 'shown' ? T : fig.path === 'toTop' ? timeToTop(l) : plays ? Math.min(timeOf(l), T) : 0;
        if (until <= 0) return null;
        const { d, len } = pathOf(l, until);
        return <DrawnPath key={`p${k.id}`} clock={clock} len={len} from={PEN.path[0]} to={PEN.path[1]} d={d} fill="none" stroke={p.label} strokeWidth={stroke.thin} strokeDasharray="4 4" />;
      })}

      {/* names at the tops of the paths, when two paths are drawn */}
      {fig.path === 'shown' &&
        kicks.length > 1 &&
        stage(clock, PEN.labels, 
          kicks.map((k) => {
            const l = launchOf(fig.u, k.angle);
            const [x, y] = pointAt(l, timeToTop(l));
            return <Tag key={`n${k.id}`} x={x} y={y - 10} text={k.id} />;
          }),
        )}

      {/* the launch: an outline arrow along each kick with its angle; 'parts' adds the two components */}
      {fig.launch && !plays && (
        <DrawnFade clock={clock} from={PEN.launch[0]} to={PEN.launch[1]}>
          {kicks.map((k, i) => (
            <LaunchArrow key={`a${k.id}`} u={fig.u} angle={k.angle} name={k.id} parts={fig.launch === 'parts'} arc={30 + i * 22} labelAt={(k.angle + (i > 0 ? kicks[i - 1].angle : 0)) / 2} />
          ))}
        </DrawnFade>
      )}

      {fig.height && stage(clock, PEN.labels, <HeightLine l={first} label={fig.height} />)}
      {fig.range && stage(clock, PEN.labels, <RangeLines fig={fig} kicks={kicks} label={fig.range} />)}

      {/* the balls */}
      {kicks.map((k) => {
        const l = launchOf(fig.u, k.angle);
        const [x, y] = pointAt(l, timeOf(l));
        return (
          <DrawnFade key={`b${k.id}`} clock={clock} from={FILLS[0]} to={FILLS[1]}>
            <Ball x={x} y={y} r={R} />
          </DrawnFade>
        );
      })}

      {fig.topV && stage(clock, PEN.labels, <TopVelocity l={first} label={fig.topV} />)}

      {plays && stage(clock, PEN.labels, <MonoLabel x={10} y={18} text={`t = ${fixed(Math.min(loop, length), 2)} s`} color={p.label} size={9} anchor="start" />)}
    </Group>
  );
}

/** The path from the kick to time `until`, as a smooth polyline, with its length. */
function pathOf(l: Launch, until: number): { d: string; len: number } {
  const n = 48;
  let d = '';
  let len = 0;
  let prev: [number, number] | null = null;
  for (let i = 0; i <= n; i++) {
    const pt = pointAt(l, (until * i) / n);
    d += `${i === 0 ? 'M' : ' L'}${pt[0].toFixed(1)},${pt[1].toFixed(1)}`;
    if (prev) len += Math.hypot(pt[0] - prev[0], pt[1] - prev[1]);
    prev = pt;
  }
  return { d, len };
}

/**
 * The launch velocity from the ball, its angle above the ground, and (with `parts`) its two components with their sizes.
 * The angle is written at `labelAt` degrees: in the wedge between this arrow and the one below it, so it never sits on an arrow.
 */
function LaunchArrow({ u, angle, name, parts, arc, labelAt }: { u: number; angle: number; name: string; parts: boolean; arc: number; labelAt: number }) {
  const { palette: p, material: m } = useTheme();
  const c = launchParts(launchOf(u, angle));
  const kv = parts ? KV_PARTS : KV;
  const tip: [number, number] = [O[0] + c.ux * kv, O[1] - c.uy * kv];
  const a = angle * RAD;
  const arcD = `M${O[0] + arc},${O[1]} A${arc},${arc} 0 0 0 ${O[0] + arc * Math.cos(a)},${O[1] - arc * Math.sin(a)}`;
  const mid = labelAt * RAD;
  const nameText = parts ? `${name} ${fixed(u, 0)} m s⁻¹` : name;
  return (
    <Group>
      {parts && (
        <Group>
          <Path d={`M${O[0]},${tip[1]} H${tip[0]} V${O[1]}`} fill="none" stroke={p.label} strokeWidth={stroke.thin} strokeDasharray="4 3" />
          <HollowArrow from={O} to={[tip[0], O[1]]} color={p.draw} weight="thin" />
          <HollowArrow from={O} to={[O[0], tip[1]]} color={p.draw} weight="thin" />
        </Group>
      )}
      <Path d={arcD} fill="none" stroke={p.label} strokeWidth={stroke.thin} />
      <MonoLabel x={O[0] + (arc + 11) * Math.cos(mid)} y={O[1] - (arc + 11) * Math.sin(mid) + 3} text={`${fixed(angle, 0)}°`} color={p.ink} size={8.5} />
      <HollowArrow from={O} to={tip} color={p.draw} />
      <Circle cx={O[0]} cy={O[1]} r={2.6} fill={p.draw} />
      <Tag x={tip[0] + 8 + (nameText.length * 5.4) / 2} y={tip[1] - (parts ? 6 : -2)} text={nameText} />
      {parts && (
        <Group>
          <Tag x={(O[0] + tip[0]) / 2} y={GROUND + 18} text={`${fixed(c.ux, 1)} m s⁻¹`} />
          <Tag x={O[0] - 4 + (`${fixed(c.uy, 1)} m s⁻¹`.length * 5.4) / 2} y={tip[1] - 8} text={`${fixed(c.uy, 1)} m s⁻¹`} />
        </Group>
      )}
    </Group>
  );
}

/** How far each ball lands from the kick, as a dimension line under the ground ("?" until answered). Equal ones are drawn once. */
function RangeLines({ fig, kicks, label }: { fig: KickFig; kicks: { angle: number }[]; label: 'unknown' | 'afterCheck' | 'shown' }) {
  const { palette: p, material: m } = useTheme();
  // with two kicks, one line with "?" would already tell that they land at the same spot: draw nothing until answered
  if (label !== 'shown' && kicks.length > 1) return null;
  const ranges = [...new Set(kicks.map((k) => fixed(projectileRange(launchOf(fig.u, k.angle)), 1)))];
  return (
    <Group>
      {ranges.map((r, i) => {
        const x2 = O[0] + Number(r) * K;
        const y = GROUND + 18 + i * 14;
        return (
          <Group key={r}>
            <Path d={`M${O[0]},${y - 5} V${y + 5} M${x2},${y - 5} V${y + 5} M${O[0]},${y} H${x2}`} stroke={p.label} strokeWidth={stroke.thin} />
            <Tag x={(O[0] + x2) / 2} y={y + 3.5} text={label === 'shown' ? `${r} m` : '?'} />
          </Group>
        );
      })}
    </Group>
  );
}

/** How high the ball rises: a dashed line down from the top of its path to the ground, with its length ("?" until answered). */
function HeightLine({ l, label }: { l: Launch; label: 'unknown' | 'afterCheck' | 'shown' }) {
  const { palette: p, material: m } = useTheme();
  const [x, y] = pointAt(l, timeToTop(l));
  const yTop = y + R; // the bottom of the ball at the top, so the line meets the ground at the same height it starts
  return (
    <Group>
      <Path d={`M${x},${yTop} V${GROUND}`} stroke={p.label} strokeWidth={stroke.thin} strokeDasharray="4 3" />
      <Path d={`M${x - 5},${GROUND} H${x + 5}`} stroke={p.label} strokeWidth={stroke.thin} />
      <Tag x={x + 8 + (label === 'shown' ? 24 : 6)} y={(yTop + GROUND) / 2 + 3} text={label === 'shown' ? `${fixed(topHeight(l), 1)} m` : '?'} />
    </Group>
  );
}

/** The velocity at the top: only its sideways part is left, an outline arrow along the ground ("v = ?" until answered). */
function TopVelocity({ l, label }: { l: Launch; label: 'unknown' | 'afterCheck' | 'shown' }) {
  const { palette: p, material: m } = useTheme();
  const [x, y] = pointAt(l, timeToTop(l));
  const ux = launchParts(l).ux;
  if (label !== 'shown') return <Tag x={x + R + 22} y={y + 3.5} text="v = ?" />;
  const tipX = x + R + 2 + ux * KV_TOP;
  return (
    <Group>
      <HollowArrow from={[x + R + 2, y]} to={[tipX, y]} color={p.draw} />
      <Tag x={(x + tipX) / 2 + 4} y={y - 11} text={`v = ${fixed(ux, 1)} m s⁻¹`} />
    </Group>
  );
}
