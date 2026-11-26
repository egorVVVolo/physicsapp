// FIG: the four suvat equations, set out the way you would on paper: your list of s, u, v, a, t on the left
// (what is known, what is wanted, what nobody mentions) and the equations on the right, each with the one quantity
// it leaves out. The equations and what they contain come from RELATIONS (src/physics/kinematics).
// Tap targets: the equations. The first equations figure of a lesson draws itself: the frames, then the writing.
import { Circle, G as Group, Line, Path } from 'react-native-svg';
import { QUANTITIES, RELATIONS, leftOut } from '@/physics/kinematics';
import { EQUATION_IDS, type EquationsFig } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { stroke } from '@/theme/tokens';
import { STILL, type DrawClock } from './anim';
import { DrawnFade, DrawnPath, FILLS, ForceLetter, MonoLabel, penPart, rectPath } from './draw';
import type { TapProps, TapTarget } from './Sheet';

export const EQUATIONS_VB = { w: 340, h: 226 };

const TOP = 24;
// the equations: four rows, 48 apart so each is a full touch target on a phone
const EQ = { h: 40, pitch: 48 };
// your list: five rows over the same height
const LIST = { x: 12, w: 114, h: 32, pitch: 38.5 };

/** The equations stand on the right of the list, or wider, in the middle, when there is no list. */
const eqW = (fig: EquationsFig) => (fig.list ? 190 : 264);
const eqX = (fig: EquationsFig) => (fig.list ? 138 : (EQUATIONS_VB.w - eqW(fig)) / 2);

const PEN = { list: [0, 0.4], rows: [0.2, 0.62], marks: [0.8, 0.95] } as const;

export function equationsTargets(fig: EquationsFig): TapTarget[] {
  return EQUATION_IDS.map((id, i) => ({ id, x: eqX(fig), y: TOP + i * EQ.pitch, w: eqW(fig), h: EQ.h, label: RELATIONS[id].text }));
}

export function EquationsFigure({ fig, tap, clock = STILL }: { fig: EquationsFig; tap?: TapProps; clock?: DrawClock }) {
  const { palette: p } = useTheme();
  const x = eqX(fig);
  const w = eqW(fig);
  const wide = !fig.list;
  return (
    <Group>
      {fig.list && <List fig={fig} clock={clock} />}
      <DrawnFade clock={clock} from={FILLS[0]} to={FILLS[1]}>
        <MonoLabel x={x + 2} y={15} text="Equations" color={p.label} size={8.5} anchor="start" />
      </DrawnFade>
      {EQUATION_IDS.map((id, i) => {
        const y = TOP + i * EQ.pitch;
        const mark = tap?.marks?.[id];
        const on = tap?.selected === id;
        const focus = fig.focus === id;
        const edge = mark === 'right' ? p.ok : mark === 'wrong' ? p.bad : on ? p.select : focus ? p.ink : p.lineStrong;
        const fill = mark === 'right' ? p.okBg : mark === 'wrong' ? p.badBg : on ? p.selectBg : p.page;
        const frame = rectPath(x, y, w, EQ.h, 9);
        const pen = penPart(PEN.rows, i, EQUATION_IDS.length);
        const out = leftOut(id);
        const cx = x + w - (wide ? 28 : 22);
        const cy = y + EQ.h / 2;
        return (
          <Group key={id}>
            <DrawnFade clock={clock} from={FILLS[0]} to={FILLS[1]}>
              <Path d={frame.d} fill={fill} />
            </DrawnFade>
            <DrawnPath clock={clock} len={frame.len} from={pen[0]} to={pen[1]} d={frame.d} fill="none" stroke={edge} strokeWidth={mark || on || focus ? 2 : 1.3} />
            <DrawnFade clock={clock} from={FILLS[0]} to={FILLS[1]}>
              <ForceLetter x={x + (wide ? 20 : 14)} y={cy + (wide ? 5.8 : 5.2)} text={RELATIONS[id].text} color={p.ink} size={wide ? 17 : 15} anchor="start" />
            </DrawnFade>
            {/* the quantity this equation leaves out: its letter in a dashed ring, struck through */}
            {fig.leftOut === 'shown' && (
              <DrawnFade clock={clock} from={PEN.marks[0]} to={PEN.marks[1]}>
                <MonoLabel x={cx - 15} y={cy + 3.2} text="no" color={p.label} size={8.5} anchor="end" />
                <Circle cx={cx} cy={cy} r={10.5} fill={p.paper} stroke={p.label} strokeWidth={stroke.thin} strokeDasharray="3 3" />
                <ForceLetter x={cx} y={cy + 4.4} text={out} color={p.ink} size={13} />
                <Line x1={cx - 8} y1={cy + 8} x2={cx + 8} y2={cy - 8} stroke={p.label} strokeWidth={stroke.thin} />
              </DrawnFade>
            )}
          </Group>
        );
      })}
    </Group>
  );
}

/** Your list: one row per quantity. Known ones carry their value, the wanted one a "?", the fifth is "not given". */
function List({ fig, clock }: { fig: EquationsFig; clock: DrawClock }) {
  const { palette: p } = useTheme();
  if (!fig.list) return null;
  const { known, want } = fig.list;
  return (
    <Group>
      <DrawnFade clock={clock} from={FILLS[0]} to={FILLS[1]}>
        <MonoLabel x={LIST.x + 2} y={15} text="Your list" color={p.label} size={8.5} anchor="start" />
      </DrawnFade>
      {QUANTITIES.map((q, i) => {
        const y = TOP + i * LIST.pitch;
        const value = known[q];
        const wanted = q === want;
        const given = value !== undefined;
        const frame = rectPath(LIST.x, y, LIST.w, LIST.h, 7);
        const pen = penPart(PEN.list, i, QUANTITIES.length);
        const base = y + LIST.h / 2;
        return (
          <Group key={q}>
            <DrawnFade clock={clock} from={FILLS[0]} to={FILLS[1]}>
              <Path d={frame.d} fill={given || wanted ? p.page : 'none'} />
            </DrawnFade>
            <DrawnPath
              clock={clock}
              len={frame.len}
              from={pen[0]}
              to={pen[1]}
              d={frame.d}
              fill="none"
              stroke={wanted ? p.ink : p.lineStrong}
              strokeWidth={wanted ? 2 : 1.2}
              strokeDasharray={given || wanted ? undefined : '4 3'}
            />
            <DrawnFade clock={clock} from={FILLS[0]} to={FILLS[1]}>
              <ForceLetter x={LIST.x + 16} y={base + 5} text={q} color={given || wanted ? p.ink : p.faint} size={15} />
              {given && <MonoLabel x={LIST.x + 30} y={base + 3.4} text={`= ${value}`} color={p.ink} size={9.5} anchor="start" />}
              {wanted && (
                <>
                  <MonoLabel x={LIST.x + 30} y={base + 3.4} text="= ?" color={p.ink} size={9.5} anchor="start" />
                  <MonoLabel x={LIST.x + LIST.w - 8} y={base + 3} text="wanted" color={p.label} size={8} anchor="end" />
                </>
              )}
              {!given && !wanted && <MonoLabel x={LIST.x + 30} y={base + 3.4} text="not given" color={p.faint} size={9.5} anchor="start" />}
            </DrawnFade>
          </Group>
        );
      })}
    </Group>
  );
}
