// FIG: one body shrunk to a dot (a particle), with each force as an arrow to scale from the dot and its text at the tip.
// The forces and their sizes come from the lesson file, where they are computed by src/physics.
import { Circle, G as Group, Rect } from 'react-native-svg';
import type { ParticleFig } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { stroke } from '@/theme/tokens';
import { STILL, type DrawClock } from './anim';
import { DrawnFade, ForceArrow, MonoLabel } from './draw';

export const PARTICLE_VB = { w: 340, h: 230 };
const DOT = { x: 170, y: 118 };
const RAD = Math.PI / 180;

export function ParticleFigure({ fig, clock = STILL }: { fig: ParticleFig; clock?: DrawClock }) {
  const { palette: p } = useTheme();
  return (
    <Group>
      <DrawnFade clock={clock} from={0} to={0.4}>
        <Rect x={DOT.x - 12} y={DOT.y - 12} width={24} height={24} rx={2} fill="none" stroke={p.label} strokeWidth={stroke.thin} strokeDasharray="3 3" />
      </DrawnFade>
      <DrawnFade clock={clock} from={0.3} to={0.75}>
        {fig.forces.map((f) => {
          const c = Math.cos(f.angle * RAD);
          const s = Math.sin(f.angle * RAD);
          const len = f.size * fig.scale;
          return <ForceArrow key={f.text + f.angle} x1={DOT.x} y1={DOT.y} x2={DOT.x + c * len} y2={DOT.y - s * len} color={p.force} />;
        })}
        <Circle cx={DOT.x} cy={DOT.y} r={3.8} fill={p.force} />
      </DrawnFade>
      <DrawnFade clock={clock} from={0.7} to={0.95}>
        {fig.forces.map((f) => {
          const c = Math.cos(f.angle * RAD);
          const s = Math.sin(f.angle * RAD);
          // up and down arrows reach the edges of the sheet: their names sit beside the tip, the others past it
          const upright = Math.abs(c) < 0.3;
          const len = f.size * fig.scale + (upright ? 0 : 9);
          const anchor = upright || c > 0.3 ? 'start' : 'end';
          const dy = upright ? (s > 0 ? 10 : -2) : s > 0.3 ? -2 : s < -0.3 ? 10 : 3;
          return <MonoLabel key={f.text + f.angle} x={DOT.x + c * len + (upright ? 9 : 0)} y={DOT.y - s * len + dy} text={f.text} color={p.ink} size={10} anchor={anchor} />;
        })}
      </DrawnFade>
    </Group>
  );
}
