import React, { useState } from 'react';
import { View } from 'react-native';
import Svg, { Line, Path, Text as SvgText } from 'react-native-svg';
import { displacementAt, duration, Graph } from '../physics/motion';
import { fonts } from '../theme/fonts';
import { colors } from '../theme/tokens';

// A small static graph for choosing between pictures: v-t drawn from the points, or s-t from the model.
// Option cards share one range so the shapes can be compared fairly.
export function MiniGraph({
  graph,
  kind,
  height,
  range,
  color = colors.velocity,
}: {
  graph: Graph;
  kind: 'vt' | 'st';
  height: number;
  range: [number, number]; // value axis, m/s for vt and m for st
  color?: string;
}) {
  const [width, setWidth] = useState(0);
  const D = duration(graph);
  const pl = 34;
  const pr = 10;
  const top = 12;
  const bottom = height - 22;
  const px = (t: number) => pl + (t * (width - pl - pr)) / D;
  const py = (y: number) => bottom - ((y - range[0]) * (bottom - top)) / (range[1] - range[0]);
  const font = { fontFamily: fonts.bodyMedium, fontSize: 13 };

  let d = '';
  if (kind === 'vt') {
    d = graph.t.map((t, i) => `${i === 0 ? 'M' : 'L'} ${px(t)} ${py(graph.v[i])}`).join(' ');
  } else {
    for (let i = 0; i <= 60; i++) {
      const t = (i / 60) * D;
      d += `${i === 0 ? 'M' : 'L'} ${px(t)} ${py(displacementAt(graph, t))} `;
    }
  }

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={{ height }}>
      {width > 0 && (
        <Svg width={width} height={height}>
          <Line x1={pl} y1={py(0)} x2={width - pr} y2={py(0)} stroke={colors.axis} strokeWidth={1.5} />
          <Line x1={pl} y1={top - 4} x2={pl} y2={bottom} stroke={colors.axis} strokeWidth={1.5} />
          <Path d={d} stroke={color} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.18} />
          <Path d={d} stroke={color} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <SvgText x={pl - 6} y={top + 4} {...font} fill={colors.inkMuted} textAnchor="end">
            {kind === 'vt' ? 'v' : 's'}
          </SvgText>
          <SvgText x={width - pr} y={Math.min(py(0) + 16, height - 4)} {...font} fill={colors.inkMuted} textAnchor="end">
            t
          </SvgText>
        </Svg>
      )}
    </View>
  );
}
