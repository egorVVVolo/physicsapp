import React, { useState } from 'react';
import { View } from 'react-native';
import Svg, { Defs, G, Line, LinearGradient, Path, Polygon, Rect, Stop, Text as SvgText } from 'react-native-svg';
import { A } from '../content/brakingDemo';
import { stoppingTime } from '../physics/braking';
import { colors } from '../theme/tokens';
import { fonts } from '../theme/fonts';
import { Pill } from './BrakingScene';

type Props = {
  height: number;
  u: number; // m/s
  xMax: number;
  yMax: number;
  // Everything below is a 0..1 amount, animated by the caller with useTween.
  base?: number; // highlights the time-to-stop on the x axis
  heightMark?: number; // highlights the starting speed on the y axis
  area?: number; // fills the triangle
  cells?: number; // shows the grid squares that bound the triangle
  cell?: { dt: number; dv: number }; // size of one square: seconds x m/s
  ghostU?: number; // faint earlier triangle for comparison
  areaLabel?: string;
};

const clamp01 = (n: number) => Math.min(Math.max(n, 0), 1);

// A v-t graph of one braking run, drawn piece by piece for the explain screens.
export function ExplainGraph({ height, u, xMax, yMax, base = 0, heightMark = 0, area = 0, cells = 0, cell, ghostU, areaLabel }: Props) {
  const [width, setWidth] = useState(0);
  const t0 = stoppingTime(u, A);
  const pl = 52;
  const pr = 16;
  const gTop = 26;
  const gBottom = height - 30;
  const px = (sec: number) => pl + (sec * (width - pl - pr)) / xMax;
  const py = (v: number) => gBottom - (v * (gBottom - gTop)) / yMax;
  const xStep = xMax > 7 ? 2 : 1;
  const yStep = yMax > 40 ? 20 : 10;
  const xTicks = Array.from({ length: Math.floor(xMax / xStep) + 1 }, (_, i) => i * xStep);
  const yTicks = Array.from({ length: Math.floor(yMax / yStep) + 1 }, (_, i) => i * yStep);
  const font = { fontFamily: fonts.bodyMedium, fontSize: 13 };

  // Squares bounding the triangle, revealed one after another.
  const cols = cell ? Math.round(t0 / cell.dt) : 0;
  const rows = cell ? Math.round(u / cell.dv) : 0;
  const total = cols * rows;

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={{ height }} accessible accessibilityLabel={`Velocity-time graph of a car braking from ${u} metres per second.`}>
      {width > 0 && (
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="exArea" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={colors.velocity} stopOpacity="0.6" />
              <Stop offset="1" stopColor={colors.velocity} stopOpacity="0.1" />
            </LinearGradient>
          </Defs>
          {yTicks.map((y) => (
            <Line key={`gy${y}`} x1={pl} y1={py(y)} x2={width - pr} y2={py(y)} stroke={colors.line} strokeWidth={1} />
          ))}
          {xTicks.map((x) => (
            <Line key={`gx${x}`} x1={px(x)} y1={gTop} x2={px(x)} y2={gBottom} stroke={colors.line} strokeWidth={1} />
          ))}

          {cell &&
            Array.from({ length: total }, (_, i) => {
              const c = i % cols;
              const r = Math.floor(i / cols);
              const alpha = clamp01(cells * (total + 6) - i);
              return (
                <Rect
                  key={i}
                  x={px(c * cell.dt) + 2}
                  y={py((r + 1) * cell.dv) + 2}
                  width={px(cell.dt) - px(0) - 4}
                  height={py(0) - py(cell.dv) - 4}
                  rx={5}
                  fill={colors.accent}
                  opacity={0.28 * alpha}
                />
              );
            })}

          {ghostU != null && (
            <Path d={`M ${px(0)} ${py(ghostU)} L ${px(stoppingTime(ghostU, A))} ${py(0)}`} stroke={colors.velocity} strokeWidth={2} strokeDasharray="4 3" opacity={0.5} />
          )}
          <Polygon points={`${px(0)},${py(0)} ${px(0)},${py(u)} ${px(t0)},${py(0)}`} fill="url(#exArea)" opacity={area} />
          <Path d={`M ${px(0)} ${py(u)} L ${px(t0)} ${py(0)}`} stroke={colors.velocity} strokeWidth={10} strokeLinecap="round" opacity={0.18} />
          <Path d={`M ${px(0)} ${py(u)} L ${px(t0)} ${py(0)}`} stroke={colors.velocity} strokeWidth={3.5} strokeLinecap="round" />

          <Line x1={pl} y1={gTop - 6} x2={pl} y2={gBottom} stroke={colors.axis} strokeWidth={1.5} />
          <Line x1={pl} y1={gBottom} x2={width - pr} y2={gBottom} stroke={colors.axis} strokeWidth={1.5} />
          {yTicks.map((y) => (
            <SvgText key={`ly${y}`} x={pl - 16} y={py(y) + 5} {...font} fill={colors.inkMuted} textAnchor="end">
              {y}
            </SvgText>
          ))}
          {xTicks.map((x) => (
            <SvgText key={`lx${x}`} x={px(x)} y={gBottom + 16} {...font} fill={colors.inkMuted} textAnchor="middle">
              {x}
            </SvgText>
          ))}
          <SvgText x={4} y={14} {...font} fontFamily={fonts.bodySemi} fill={colors.ink}>
            v / m s⁻¹
          </SvgText>
          <SvgText x={width - pr} y={gBottom - 7} {...font} fontFamily={fonts.bodySemi} fill={colors.ink} textAnchor="end">
            t / s
          </SvgText>

          {base > 0 && (
            <G>
              <Line x1={px(0)} y1={gBottom} x2={px(0) + (px(t0) - px(0)) * base} y2={gBottom} stroke={colors.accent} strokeWidth={7} strokeLinecap="round" />
              {base > 0.95 && <Pill x={(px(0) + px(t0)) / 2 - 38} y={gBottom - 18} text={`t = ${t0} s`} color={colors.accent} />}
            </G>
          )}
          {heightMark > 0 && (
            <G>
              <Line x1={pl} y1={gBottom} x2={pl} y2={gBottom - (gBottom - py(u)) * heightMark} stroke={colors.velocity} strokeWidth={7} strokeLinecap="round" />
              {heightMark > 0.95 && <Pill x={pl + 12} y={py(u / 2) + 4} text={`u = ${u} m/s`} color={colors.velocity} />}
            </G>
          )}
          {area > 0.9 && areaLabel && <Pill x={px(t0 / 3) - (areaLabel.length * 7.6 + 18) / 2} y={py(u * 0.22)} text={areaLabel} color={colors.ink} />}
          {cell && cells > 0.95 && <Pill x={px(0) + 14} y={py(u) - 6} text={`${cols} × ${rows} = ${total} squares`} color={colors.accent} />}
        </Svg>
      )}
    </View>
  );
}
