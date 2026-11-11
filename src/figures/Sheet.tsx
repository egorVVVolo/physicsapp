// The drawing sheet: every figure sits on pale drafting paper with a FIG number and its given values.
// It sizes the SVG to the available width and lays tap targets (if any) over the drawing.
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg from 'react-native-svg';
import type { Fig } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { font, radius } from '@/theme/tokens';
import { LIFT_VB, LiftFigure, liftParams, liftTargets } from './LiftFigure';
import { PAIRS_VB, PairsFigure, pairsTargets } from './PairsFigure';
import { VT_VB, VtFigure, vtTargets } from './VtFigure';

export type TapTarget = { id: string; x: number; y: number; w: number; h: number; label: string };
export type TapProps = {
  selected: string | null;
  marks?: Record<string, 'right' | 'wrong'>;
  disabled?: boolean;
  onTap: (id: string) => void;
};

type Props = {
  fig: Fig;
  n: number; // the FIG number on the sheet
  /** Live acceleration of a lift figure (the explore slider); defaults to the figure's own value. */
  a?: number;
  tap?: TapProps;
  maxHeight?: number;
};

export function Sheet({ fig, n, a, tap, maxHeight }: Props) {
  const { palette: p } = useTheme();
  const [width, setWidth] = useState(0);
  const vb = fig.kind === 'lift' ? LIFT_VB : fig.kind === 'pairs' ? PAIRS_VB : VT_VB;
  const aNow = fig.kind === 'lift' ? (a ?? fig.a) : 0;
  let w = width;
  let h = (width * vb.h) / vb.w;
  if (maxHeight && h > maxHeight) {
    h = maxHeight;
    w = (h * vb.w) / vb.h;
  }
  const scale = w / vb.w;
  const targets = !tap ? [] : fig.kind === 'lift' ? liftTargets(fig) : fig.kind === 'pairs' ? pairsTargets() : vtTargets(fig);
  const params = fig.kind === 'lift' ? liftParams(fig, aNow) : fig.kind === 'pairs' ? `m = ${fig.m} kg` : 'lift trip, upward';

  return (
    <View style={[styles.sheet, { backgroundColor: p.paper, borderColor: p.paperLine }]}>
      <View style={styles.head}>
        <Text style={[styles.fig, { color: p.label }]}>FIG. {n}</Text>
        <Text style={[styles.params, { color: p.label }]} numberOfLines={1}>
          {params}
        </Text>
      </View>
      <View style={styles.body} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        {width > 0 && (
          <View style={{ width: w, height: h, alignSelf: 'center' }}>
            <Svg width={w} height={h} viewBox={`0 0 ${vb.w} ${vb.h}`}>
              {fig.kind === 'lift' && <LiftFigure fig={fig} a={aNow} tap={tap} />}
              {fig.kind === 'pairs' && <PairsFigure tap={tap} />}
              {fig.kind === 'vt' && <VtFigure fig={fig} tap={tap} />}
            </Svg>
            {targets.map((t) => (
              <Pressable
                key={t.id}
                accessibilityRole="radio"
                accessibilityLabel={t.label + (tap?.marks?.[t.id] === 'right' ? ', correct' : tap?.marks?.[t.id] === 'wrong' ? ', incorrect' : '')}
                accessibilityState={{ checked: tap?.selected === t.id, disabled: tap?.disabled }}
                disabled={tap?.disabled}
                onPress={() => tap?.onTap(t.id)}
                style={{ position: 'absolute', left: t.x * scale, top: t.y * scale, width: Math.max(44, t.w * scale), height: Math.max(44, t.h * scale) }}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: { borderWidth: 1, borderRadius: radius.m, paddingTop: 10, paddingBottom: 8, paddingHorizontal: 10, alignSelf: 'stretch' },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, paddingHorizontal: 4 },
  fig: { fontFamily: font.monoBold, fontSize: 11, letterSpacing: 1 },
  params: { fontFamily: font.mono, fontSize: 11, flexShrink: 1 },
  body: { alignSelf: 'stretch', marginTop: 4 },
});
