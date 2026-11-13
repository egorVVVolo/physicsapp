// The drawing sheet: every figure sits on pale drafting paper with a FIG number and its given values.
// It sizes the SVG to the available width and lays tap targets (if any) over the drawing.
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import type { Fig } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { font, radius } from '@/theme/tokens';
import { useReducedMotionPref } from '@/ui/parts';
import { LIFT_VB, LiftFigure, liftMoves, liftParams, liftTargets, ShaftMarks } from './LiftFigure';
import { LIFT_PAIR_VB, LiftPairFigure } from './LiftPairFigure';
import { SCALES_VB, ScalesFigure } from './ScalesFigure';
import { PAIRS_MAX_H, PAIRS_VB, PairsFigure, pairsTargets } from './PairsFigure';
import { useFirstShow } from './anim';
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
  /** Replaces the values in the header (for a figure outside a lesson screen). */
  caption?: string;
};

/** Every figure is drawn at the same size on every screen, so the drawing never jumps between screens. */
const MAX_H = 270;

export function Sheet({ fig, n, a, tap, caption }: Props) {
  const { palette: p } = useTheme();
  const [width, setWidth] = useState(0);
  const [playing, setPlaying] = useState(true);
  const reduced = useReducedMotionPref();
  // the first figure of each kind in a lesson draws itself (so far: the scales)
  const drawIn = useFirstShow(fig.kind);
  const vb = { lift: LIFT_VB, pairs: PAIRS_VB, vt: VT_VB, scales: SCALES_VB, liftPair: LIFT_PAIR_VB }[fig.kind];
  const aNow = fig.kind === 'lift' ? (a ?? fig.a) : 0;
  let w = width;
  let h = (width * vb.h) / vb.w;
  const maxH = fig.kind === 'pairs' ? PAIRS_MAX_H : MAX_H;
  if (h > maxH) {
    h = maxH;
    w = (h * vb.w) / vb.h;
  }
  const scale = w / vb.w;
  const animates = !reduced && ((fig.kind === 'lift' && liftMoves(fig, aNow)) || fig.kind === 'scales');
  const run = playing && !reduced;
  const targets = !tap ? [] : fig.kind === 'lift' ? liftTargets(fig) : fig.kind === 'pairs' ? pairsTargets() : fig.kind === 'vt' ? vtTargets(fig) : [];
  const params = caption ?? (fig.kind === 'lift' ? liftParams(fig, aNow, a !== undefined) : fig.kind === 'vt' ? 'lift trip, upward' : `m = ${fig.m} kg`);

  return (
    <View style={[styles.sheet, { backgroundColor: p.paper, borderColor: p.paperLine }]}>
      <View style={styles.head}>
        <Text style={[styles.fig, { color: p.label }]}>FIG. {n}</Text>
        <Text style={[styles.params, { color: p.label }]} numberOfLines={1}>
          {params}
        </Text>
        {animates && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={playing ? 'Pause the animation' : 'Play the animation'}
            onPress={() => setPlaying((x) => !x)}
            hitSlop={12}
            style={[styles.play, { borderColor: p.paperLine }]}
          >
            <Svg width={12} height={12} viewBox="0 0 12 12">
              {playing ? (
                <>
                  <Rect x={2} y={1.5} width={3} height={9} rx={0.8} fill={p.label} />
                  <Rect x={7} y={1.5} width={3} height={9} rx={0.8} fill={p.label} />
                </>
              ) : (
                <Path d="M3,1.5 L10.5,6 L3,10.5 Z" fill={p.label} />
              )}
            </Svg>
          </Pressable>
        )}
      </View>
      <View style={styles.body} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        {width > 0 && (
          <View style={{ width: w, height: h, alignSelf: 'center' }}>
            <Svg width={w} height={h} viewBox={`0 0 ${vb.w} ${vb.h}`}>
              {fig.kind === 'lift' && <LiftFigure fig={fig} a={aNow} tap={tap} />}
              {fig.kind === 'scales' && <ScalesFigure fig={fig} playing={run} drawIn={drawIn} />}
              {fig.kind === 'liftPair' && <LiftPairFigure fig={fig} playing={!reduced} />}
              {fig.kind === 'pairs' && <PairsFigure fig={fig} tap={tap} />}
              {fig.kind === 'vt' && <VtFigure fig={fig} tap={tap} />}
            </Svg>
            {fig.kind === 'lift' && <ShaftMarks fig={fig} a={aNow} scale={scale} playing={run} />}
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
  params: { fontFamily: font.mono, fontSize: 11, flex: 1, textAlign: 'right' },
  body: { alignSelf: 'stretch', marginTop: 4 },
  play: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginVertical: -6 },
});
