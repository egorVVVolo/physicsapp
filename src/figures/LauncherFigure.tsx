// FIG: a toy launcher (src/physics/elastic), elastic strain energy. A tube on a shelf, a spring squashed by Δx behind a
// plunger, a ball in front held by the push F (blue). Released, the spring is back at its natural length and the ball
// leaves with the speed ½mv² = ½kΔx² gives (an outline arrow). On the right: the readings, a force–squash graph with the
// energy shaded as the triangle under the line, or two launchers A and B held by the same push, with their triangles.
// view 'curve': a rubber band's curved force–extension graph on squared paper, the area under it shaded.
import { Circle, G as Group, Line, Path, Polygon, Rect } from 'react-native-svg';
import { areaUnder, bandForce, energyForForce, launchSpeed, leaveTime, releaseRun, springEnergy } from '@/physics/elastic';
import { fixed, sig } from '@/physics/format';
import type { LauncherFig } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { stroke } from '@/theme/tokens';
import { STILL, useLoopTime, type DrawClock } from './anim';
import { useReducedMotionPref } from '@/ui/parts';
import { ForceArrow, ForceLetter, Hatch, MonoLabel } from './draw';
import { stage } from './kit';

export const LAUNCHER_VB = { w: 340, h: 230 };

const PEN = { shelf: [0, 0.25], tube: [0.15, 0.6], labels: [0.55, 0.98] } as const;
const TUBE = { x1: 14, x2: 180, h: 26 };
const L0 = 10; // the spring's natural length, cm
const K = 9; // viewBox units per cm
const SPRING0 = TUBE.x1 + 5; // the spring's fixed end
const NATURAL = SPRING0 + L0 * K; // the plunger with no squash
const PLUNGER = 5;
const BALL = 8;
const KF = 1.6; // viewBox units per newton of the push
const PX = 196;
const PR = 334;

const J = (E: number) => `${sig(E, 2)} J`;

export function launcherParams(fig: LauncherFig): string {
  if (fig.view === 'curve') return 'each square: 2 cm × 1 N = 0.02 J';
  if (fig.panel === 'pair') return 'B twice as stiff as A, same push';
  return `k = ${sig(fig.k)} N m⁻¹ · ball ${fixed(fig.m * 1000, 0)} g`;
}

type Props = { fig: LauncherFig; live?: number; playing?: boolean; clock?: DrawClock };

/** Played, the release is slowed down this many times (the real one is over in about a hundredth of a second). */
export const SLOW = 40;
const REST_S = 0.9; // held squashed first
/** Played, the ball is followed this far after it leaves the spring (its speed arrow stays clear of the panel). */
const FLIGHT_END = NATURAL + PLUNGER + BALL + 8;
const HOLD_S = 1.2; // the ball at the mouth of the tube, with its speed

/** Whether the figure plays (the sheet shows its pause button). */
export const launcherPlays = (fig: LauncherFig, live?: number): boolean => fig.view !== 'curve' && fig.play === true && fig.speed === true && live === undefined;

/** Model seconds from release until the ball reaches the mouth of the tube. */
function mouthTime(k: number, dx: number, m: number): number {
  const travel = (FLIGHT_END - (NATURAL + PLUNGER + BALL)) / K / 100 + dx; // m, from where it starts
  const v = launchSpeed(springEnergy(k, dx), m);
  return leaveTime(k, m) + Math.max(0, travel - dx) / v;
}

export function LauncherFigure({ fig, live, playing = false, clock = STILL }: Props) {
  const reduced = useReducedMotionPref();
  const plays = launcherPlays(fig, live);
  const x = live !== undefined ? live / 100 : fig.x;
  const loop = REST_S + (fig.view === 'curve' ? 0 : mouthTime(fig.k, x, fig.m)) * SLOW + HOLD_S;
  const t = useLoopTime(plays && playing && !reduced, loop, fig, 0);
  if (fig.view === 'curve') return <Curve clock={clock} />;
  // model seconds since release; with reduced motion the ball is shown leaving the tube
  const since = !plays ? undefined : reduced ? Infinity : (t - REST_S) / SLOW;
  return <Launchers fig={fig} x={x} since={since} clock={clock} />;
}


function Launchers({ fig, x, since, clock }: { fig: LauncherFig; x: number; since?: number; clock: DrawClock }) {
  const F = fig.k * x;
  const pair = fig.panel === 'pair' && fig.k2 !== undefined;
  const tubes = pair ? [{ cy: 74, k: fig.k, name: 'A' }, { cy: 152, k: fig.k2!, name: 'B' }] : [{ cy: 120, k: fig.k, name: '' }];
  return (
    <Group>
      {tubes.map((t) => (
        <OneLauncher key={t.cy} cy={t.cy} squash={F / t.k} F={F} name={t.name} released={fig.speed === true} speed={launchSpeed(springEnergy(t.k, F / t.k), fig.m)} run={since === undefined ? undefined : { since, k: t.k, m: fig.m }} clock={clock} />
      ))}
      {stage(clock, PEN.labels, <Panel fig={fig} x={x} />)}
    </Group>
  );
}

type Run = { since: number; k: number; m: number };

function OneLauncher({ cy, squash, F, name, released: releasedIn, speed, run, clock }: { cy: number; squash: number; F: number; name: string; released: boolean; speed: number; run?: Run; clock: DrawClock }) {
  const { palette: p, soft } = useTheme();
  // played: held until `since` reaches 0, then the spring pushes plunger and ball out by the model (releaseRun)
  const state = run && run.since > 0 ? releaseRun(run.k, squash, run.m, run.since) : undefined;
  const released = run ? run.since > 0 : releasedIn;
  const cm = !released ? squash * 100 : state ? state.squash * 100 : 0;
  const xp = SPRING0 + (L0 - cm) * K; // the plunger's face, on the spring side
  const mouth = FLIGHT_END;
  const leftAt = NATURAL + PLUNGER + BALL; // where the ball leaves the spring: the speed is written above it
  const ballFrom = SPRING0 + (L0 - squash * 100) * K + PLUNGER + BALL;
  const ball = state ? Math.min(mouth, ballFrom + state.moved * 100 * K) : xp + PLUNGER + BALL;
  const flying = !run || (state?.left ?? false); // the speed arrow once the ball has left the spring
  const top = cy - TUBE.h / 2;
  const coils = 10;
  const pitch = (xp - SPRING0) / coils;
  const zig: string[] = [`M${SPRING0},${cy}`];
  for (let i = 0; i < coils; i++) {
    zig.push(`L${SPRING0 + (i + 0.25) * pitch},${cy - 9} L${SPRING0 + (i + 0.75) * pitch},${cy + 9}`);
  }
  zig.push(`L${xp},${cy}`);
  return (
    <Group>
      {stage(clock, PEN.shelf, <Hatch x1={8} x2={186} y={cy + TUBE.h / 2 + 2} color={p.draw} clock={clock} from={PEN.shelf[0]} to={PEN.shelf[1]} />)}
      {stage(
        clock,
        PEN.tube,
        <Group>
          {/* the tube: open at the right, closed at the left */}
          <Line x1={TUBE.x1} y1={top} x2={TUBE.x2} y2={top} stroke={p.draw} strokeWidth={stroke.body} />
          <Line x1={TUBE.x1} y1={top + TUBE.h} x2={TUBE.x2} y2={top + TUBE.h} stroke={p.draw} strokeWidth={stroke.body} />
          <Rect x={TUBE.x1} y={top} width={5} height={TUBE.h} fill={soft.metal.fill} stroke={p.draw} strokeWidth={stroke.thin} />
          {/* where the plunger sits with no squash */}
          {!released && cm > 0.05 && <Line x1={NATURAL} y1={top - 4} x2={NATURAL} y2={top + TUBE.h + 4} stroke={p.label} strokeWidth={stroke.thin} strokeDasharray="3 3" />}
          <Path d={zig.join(' ')} stroke={p.draw} strokeWidth={stroke.body} fill="none" strokeLinejoin="round" />
          <Rect x={xp} y={cy - 10} width={PLUNGER} height={20} rx={2} fill={soft.metal.fill} stroke={p.draw} strokeWidth={stroke.thin} />
          <Circle cx={ball} cy={cy} r={BALL} fill={soft.A.fill} stroke={soft.A.edge} strokeWidth={2} />
          {name !== '' && <MonoLabel x={TUBE.x1} y={top - 6} text={name} color={p.ink} size={10} anchor="start" />}
          {run && <MonoLabel x={TUBE.x1} y={cy + TUBE.h / 2 + 22} text={`${SLOW}× slower`} color={p.label} size={8} anchor="start" />}
        </Group>,
      )}
      {stage(
        clock,
        PEN.labels,
        released ? (
          <Group opacity={flying ? 1 : 0}>
            {/* the ball leaves: an outline arrow for its speed */}
            <Path d={`M${ball + 11},${cy - 3} h28 v-4 l9,7 l-9,7 v-4 h-28 Z`} fill="none" stroke={p.ink} strokeWidth={stroke.thin} strokeLinejoin="round" />
            <MonoLabel x={leftAt + 14} y={top - 8} text={`v = ${sig(speed)} m s⁻¹`} color={p.ink} size={8.5} />
          </Group>
        ) : (
          <Group>
            {cm > 0.05 && (
              <Group>
                <Path d={`M${xp},${top - 8} v-5 M${xp},${top - 10} H${NATURAL} M${NATURAL},${top - 8} v-5`} stroke={p.label} strokeWidth={stroke.thin} />
                <MonoLabel x={(xp + NATURAL) / 2} y={top - 15} text={`Δx ${fixed(cm, 1)} cm`} color={p.label} size={8} />
              </Group>
            )}
            {F > 0 && (
              <Group>
                <ForceArrow x1={ball + BALL + F * KF} y1={cy} x2={ball + BALL} y2={cy} color={p.force} width={2.6} />
                <ForceLetter x={ball + BALL + F * KF + 4} y={cy + 4} text={`F ${sig(F, 2)} N`} color={p.forceText} size={10} anchor="start" />
              </Group>
            )}
          </Group>
        ),
      )}
    </Group>
  );
}

// ── the panel on the right ──

const GB = { x1: 214, x2: 330, y1: 58, y2: 178, xMax: 8, fMax: 30 };
const gx = (cm: number) => GB.x1 + (cm / GB.xMax) * (GB.x2 - GB.x1);
const gy = (F: number) => GB.y2 - (F / GB.fMax) * (GB.y2 - GB.y1);

function Panel({ fig, x }: { fig: LauncherFig; x: number }) {
  const { palette: p, soft } = useTheme();
  const F = fig.k * x;
  const E = springEnergy(fig.k, x);
  const hidden = fig.ask !== undefined;
  if (fig.panel === 'readings') {
    const rows = fig.rows ?? ['x', 'F'];
    const names = { x: 'squash Δx', F: 'push F', E: 'energy' } as const;
    const value = { x: `${fixed(x * 100, 1)} cm`, F: `${sig(F, 2)} N`, E: hidden ? '?' : J(E) } as const;
    return (
      <Group>
        {rows.map((row, r) => (
          <Group key={row}>
            <MonoLabel x={PX} y={62 + r * 26} text={names[row]} color={p.label} size={8.5} anchor="start" />
            <MonoLabel x={PR} y={62 + r * 26} text={value[row]} color={p.ink} size={10} anchor="end" />
            <Line x1={PX} y1={69 + r * 26} x2={PR} y2={69 + r * 26} stroke={p.paperLine} strokeWidth={stroke.hair} />
          </Group>
        ))}
      </Group>
    );
  }
  const grid: string[] = [];
  for (let f = 10; f <= GB.fMax; f += 10) grid.push(`M${GB.x1},${gy(f)} H${GB.x2}`);
  for (let c = 2; c <= GB.xMax; c += 2) grid.push(`M${gx(c)},${GB.y1} V${GB.y2}`);
  const axes = (
    <Group>
      <Path d={grid.join(' ')} stroke={p.paperLine} strokeWidth={stroke.hair} />
      <Path d={`M${GB.x1},${GB.y1 - 6} V${GB.y2} H${GB.x2 + 4}`} stroke={p.draw} strokeWidth={stroke.thin} fill="none" />
      {[0, 10, 20, 30].map((f) => (
        <MonoLabel key={f} x={GB.x1 - 5} y={gy(f) + 3} text={`${f}`} color={p.label} size={7.5} anchor="end" />
      ))}
      {[0, 2, 4, 6, 8].map((c) => (
        <MonoLabel key={c} x={gx(c)} y={GB.y2 + 12} text={`${c}`} color={p.label} size={7.5} />
      ))}
      <MonoLabel x={GB.x1 - 4} y={GB.y1 - 9} text="F / N" color={p.label} size={7.5} anchor="start" />
      <MonoLabel x={GB.x2} y={GB.y2 + 25} text="Δx / cm" color={p.label} size={7.5} anchor="end" />
    </Group>
  );
  const tri = (cm: number, f: number) => `${gx(0)},${gy(0)} ${gx(cm)},${gy(0)} ${gx(cm)},${gy(f)}`;
  if (fig.panel === 'pair' && fig.k2 !== undefined) {
    const xb = F / fig.k2;
    const lines = [
      { id: 'A', cm: x * 100, E: energyForForce(F, fig.k) },
      { id: 'B', cm: xb * 100, E: energyForForce(F, fig.k2) },
    ];
    return (
      <Group>
        {lines.map((l, i) => (
          <MonoLabel key={l.id} x={PR} y={18 + i * 14} text={`${l.id}: ${fixed(l.cm, 1)} cm · E ${hidden ? '?' : J(l.E)}`} color={p.ink} size={8.5} anchor="end" />
        ))}
        {axes}
        {!hidden && <Polygon points={tri(lines[0].cm, F)} fill={soft.A.fill} opacity={0.8} />}
        {!hidden && <Polygon points={tri(lines[1].cm, F)} fill={soft.B.fill} />}
        {lines.map((l) => (
          <Group key={l.id}>
            <Line x1={gx(0)} y1={gy(0)} x2={gx(l.cm)} y2={gy(F)} stroke={soft[l.id === 'A' ? 'A' : 'B'].edge} strokeWidth={stroke.force} />
            <Circle cx={gx(l.cm)} cy={gy(F)} r={3} fill={p.ink} />
            <MonoLabel x={gx(l.cm) + (l.id === 'A' ? 8 : -8)} y={gy(F) - 6} text={l.id} color={p.ink} size={9.5} />
          </Group>
        ))}
      </Group>
    );
  }
  const cm = x * 100;
  return (
    <Group>
      <MonoLabel x={PR} y={18} text={`Δx ${fixed(cm, 1)} cm · F ${sig(F, 2)} N`} color={p.ink} size={8.5} anchor="end" />
      <MonoLabel x={PR} y={32} text={`E = ½FΔx = ${hidden ? '?' : J(E)}`} color={p.ink} size={8.5} anchor="end" />
      {axes}
      {F > 0 && <Polygon points={tri(cm, F)} fill={soft.A.fill} opacity={0.85} />}
      {fig.inner !== undefined && <Polygon points={tri(fig.inner * 100, fig.k * fig.inner)} fill="none" stroke={p.ink} strokeWidth={stroke.thin} strokeDasharray="3 2" />}
      <Line x1={gx(0)} y1={gy(0)} x2={gx(GB.fMax / fig.k * 100)} y2={gy(GB.fMax)} stroke={p.label} strokeWidth={stroke.thin} strokeDasharray="3 3" />
      {F > 0 && <Line x1={gx(0)} y1={gy(0)} x2={gx(cm)} y2={gy(F)} stroke={soft.A.edge} strokeWidth={stroke.force} />}
      <Circle cx={gx(cm)} cy={gy(F)} r={4} fill={p.paper} stroke={p.ink} strokeWidth={stroke.body} />
    </Group>
  );
}

// ── view: 'curve' ──

const CB = { x1: 56, x2: 318, y1: 24, y2: 184, xMax: 20, fMax: 8 };
const cx = (cm: number) => CB.x1 + (cm / CB.xMax) * (CB.x2 - CB.x1);
const cy = (F: number) => CB.y2 - (F / CB.fMax) * (CB.y2 - CB.y1);

function Curve({ clock }: { clock: DrawClock }) {
  const { palette: p, soft } = useTheme();
  const grid: string[] = [];
  for (let f = 1; f <= CB.fMax; f++) grid.push(`M${CB.x1},${cy(f)} H${CB.x2}`);
  for (let c = 2; c <= CB.xMax; c += 2) grid.push(`M${cx(c)},${CB.y1} V${CB.y2}`);
  const pts: string[] = [];
  for (let i = 0; i <= 80; i++) {
    const cm = (CB.xMax * i) / 80;
    pts.push(`${cx(cm)},${cy(bandForce(cm / 100))}`);
  }
  const area = areaUnder(bandForce, 0, CB.xMax / 100); // J, shaded (the question asks for the method only)
  return (
    <Group>
      {stage(
        clock,
        [0, 0.4],
        <Group>
          <Path d={grid.join(' ')} stroke={p.paperLine} strokeWidth={stroke.hair} />
          <Path d={`M${CB.x1},${CB.y1 - 6} V${CB.y2} H${CB.x2 + 4}`} stroke={p.draw} strokeWidth={stroke.thin} fill="none" />
          {[0, 2, 4, 6, 8].map((f) => (
            <MonoLabel key={f} x={CB.x1 - 6} y={cy(f) + 3} text={`${f}`} color={p.label} size={8} anchor="end" />
          ))}
          {[0, 4, 8, 12, 16, 20].map((c) => (
            <MonoLabel key={c} x={cx(c)} y={CB.y2 + 13} text={`${c}`} color={p.label} size={8} />
          ))}
          <MonoLabel x={CB.x1 - 30} y={CB.y1 - 10} text="F / N" color={p.label} size={8} anchor="start" />
          <MonoLabel x={CB.x2} y={CB.y2 + 27} text="Δx / cm" color={p.label} size={8} anchor="end" />
        </Group>,
      )}
      {stage(
        clock,
        [0.4, 0.95],
        <Group>
          {area > 0 && <Polygon points={`${cx(0)},${cy(0)} ${pts.join(' ')} ${cx(CB.xMax)},${cy(0)}`} fill={soft.A.fill} opacity={0.85} />}
          <Path d={`M${pts.join(' L')}`} stroke={soft.A.edge} strokeWidth={stroke.force} fill="none" />
          <MonoLabel x={cx(17.6)} y={cy(7.2)} text="Rubber band" color={p.label} size={8} anchor="end" />
        </Group>,
      )}
    </Group>
  );
}
