// The drawing sheet: every figure sits on pale drafting paper with a FIG number and its given values.
// It sizes the SVG to the available width and lays tap targets (if any) over the drawing.
import { useContext, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import type { Fig } from '@/content/types';
import { useTheme } from '@/theme/ThemeContext';
import { font, motion, radius } from '@/theme/tokens';
import { useReducedMotionPref } from '@/ui/parts';
import { fixed } from '@/physics/format';
import { SheetScale } from './draw';
import { LIFT_VB, LiftFigure, liftMoves, liftParams, liftShiftX, liftTargets, ShaftMarks } from './LiftFigure';
import { LIFT_PAIR_VB, LiftPairFigure } from './LiftPairFigure';
import { SCALES_VB, ScalesFigure } from './ScalesFigure';
import { PAIRS_MAX_H, PAIRS_VB, PairsFigure, pairsTargets } from './PairsFigure';
import { LessonFigs, SharedSheet, useDrawIn, useFirstShow, useTween } from './anim';
import { VT_VB, VtFigure, vtTargets } from './VtFigure';
import { THROW_VB, ThrowFigure, throwParams, throwPlays, throwTargets } from './ThrowFigure';
import { FALL_VB, FallGraphFigure, THROW_VT_VB, ThrowVtFigure } from './ThrowGraphs';
import { ROAD_VB, RoadFigure, roadParams, roadPlays } from './RoadFigure';
import { BRAKE_VT_VB, BrakeVtFigure } from './BrakeGraph';
import { EQUATIONS_VB, EquationsFigure, equationsTargets } from './EquationsFigure';
import { GRAPH_VB, GraphFigure, graphTargets } from './GraphFigure';
import { CHASE_VB, ChaseFigure, chaseParams, chasePlays } from './ChaseFigure';
import { TRACK_VB, TrackFigure, trackParams, trackPlays } from './TrackFigure';
import { VECTORS_VB, VectorsFigure } from './VectorsFigure';
import { HILL_VB, HillFigure, hillParams, SLEDGE_VB, SledgeFigure, sledgeParams, sledgeTargets } from './SledgeFigure';
import { RESOLVE_VB, ResolveFigure } from './ResolveFigure';
import { BENCH_VB, BenchFigure, benchParams, benchPlays } from './BenchFigure';
import { KICK_VB, KickFigure, kickParams, kickPlays } from './KickFigure';
import { CRATE_VB, CrateFigure, crateParams, cratePlays, cratePlaysLive } from './CrateFigure';
import { LADDER_VB, LadderFigure, ladderParams, ladderTargets } from './LadderFigure';
import { PARTICLE_VB, ParticleFigure } from './ParticleFigure';
import { PULLEY_VB, PulleyFigure, pulleyParams, pulleyPlays } from './PulleyFigure';
import { AIR_FALL_VB, FallFigure, fallParams, fallPlays } from './FallFigure';
import { WALL_VB, WallFigure, wallParams, wallPlays } from './WallFigure';
import { BODIES_VB, BodiesFigure } from './BodiesFigure';
import { COLLIDE_VB, CollideFigure, collideParams, collidePlays } from './CollideFigure';
import { SPANNER_VB, SpannerFigure, spannerParams } from './SpannerFigure';
import { POLE_VB, PoleFigure, poleParams, poleTargets } from './PoleFigure';
import { BAR_VB, BarFigure, barParams } from './BarFigure';
import { BEAM_VB, BeamFigure, beamTargets } from './BeamFigure';
import { BROOM_VB, BroomFigure, broomParams } from './BroomFigure';
import { PLATFORM_VB, PlatformFigure, platformParams, platformPlays } from './PlatformFigure';
import { RAMP_VB, RampFigure, rampParams } from './RampFigure';
import { CLIFF_VB, CliffFigure, cliffParams, cliffPlays } from './CliffFigure';
import { SLIDE_VB, SlideFigure, slideParams, slidePlays } from './SlideFigure';
import { RIDE_VB, RideFigure, rideParams, ridePlays } from './RideFigure';
import { WINCH_VB, WinchFigure, winchParams, winchPlays } from './WinchFigure';
import { TANK_VB, TankFigure, tankParams, tankPlays } from './TankFigure';
import { DUNK_VB, DunkFigure, dunkParams } from './DunkFigure';
import { TUBE_VB, TubeFigure, tubeParams, tubePlays } from './TubeFigure';
import { FLOW_VB, FlowFigure, flowParams, flowTargets } from './FlowFigure';
import { SPRING_VB, SpringFigure, springParams, springTargets } from './SpringFigure';
import { WIRE_VB, WireFigure, wireParams } from './WireFigure';
import { MATERIAL_VB, MaterialFigure, materialParams, materialTargets } from './MaterialFigure';
import { LAUNCHER_VB, LauncherFigure, launcherParams } from './LauncherFigure';
import { HEIGHT_VB, HeightFigure, heightParams, KINETIC_VB, KineticFigure, kineticParams, kineticPlays } from './EnergyFigure';

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
  /** The explore slider: a lift's acceleration (defaults to the figure's own a), the time since a throw or since the brakes came on, or a rope's angle. */
  live?: number;
  tap?: TapProps;
  /** Replaces the values in the header (for a figure outside a lesson screen). */
  caption?: string;
  /** A smaller, still copy of a figure already seen (a text screen carrying the last figure): no pen, no motion, no taps. */
  compact?: boolean;
  /** Full size but still: no pen, no motion, no taps (check pages that compare drawings). */
  still?: boolean;
};

/** Figures already in style 2.0 (V2 tasks C2–C8): their labels grow to stay readable on the screen. */
const STYLE_2 = new Set<Fig['kind']>([
  // the pilot (C2)
  'lift', 'crate', 'collide', 'road',
  // Motion (C3)
  'track', 'graph', 'equations', 'chase', 'brakeVt', 'throw', 'throwVt', 'fallGraph', 'sledge', 'hill', 'resolve', 'vectors', 'bench', 'kick',
  // Forces (C4)
  'ladder', 'particle', 'pulley', 'liftPair', 'scales', 'pairs', 'vt', 'fall',
  // Momentum and moments (C5)
  'wall', 'bodies', 'spanner', 'pole', 'bar', 'beam', 'broom',
  // Energy (C6)
  'platform', 'ramp', 'kinetic', 'height', 'cliff', 'slide', 'ride', 'winch',
  // Fluids (C7)
  'tank', 'dunk', 'tube', 'flow',
  // Materials (C8)
  'spring', 'wire', 'material', 'launcher',
]);

/** Every figure is drawn at the same size on every screen, so the drawing never jumps between screens. */
const MAX_H = 270;
/** A compact sheet is at most this share of the full height. */
const COMPACT = 0.6;
/** The figures that draw themselves the first time their kind appears in a lesson. */
const DRAWS_ITSELF: Fig['kind'][] = ['scales', 'lift', 'pairs', 'throw', 'throwVt', 'fallGraph', 'road', 'brakeVt', 'equations', 'graph', 'chase', 'track', 'vectors', 'sledge', 'hill', 'resolve', 'bench', 'kick', 'crate', 'ladder', 'particle', 'pulley', 'fall', 'wall', 'bodies', 'collide', 'spanner', 'pole', 'bar', 'beam', 'broom', 'platform', 'ramp', 'kinetic', 'height', 'cliff', 'slide', 'ride', 'winch', 'tank', 'dunk', 'tube', 'flow', 'spring', 'wire', 'material', 'launcher'];

export function Sheet({ fig, n, live, tap: tapIn, caption, compact = false, still: stillProp = false }: Props) {
  const still = compact || stillProp;
  const tap = still ? undefined : tapIn;
  const { palette: p, classic } = useTheme();
  const memory = useContext(LessonFigs);
  // the screen before showed this kind of figure: the sheet is already drawn at its width and changes from `prev`
  const shared = useContext(SharedSheet);
  const prev = shared && shared.prev.kind === fig.kind ? shared.prev : undefined;
  const [width, setWidth] = useState(prev && shared ? shared.width : 0);
  const [playing, setPlaying] = useState(true);
  const reduced = useReducedMotionPref();
  // the first figure of each kind in a lesson draws itself; the pen starts once the sheet knows its size
  const first = useFirstShow(fig.kind);
  const clock = useDrawIn(!still && first && width > 0 && DRAWS_ITSELF.includes(fig.kind));
  const vb = { lift: LIFT_VB, pairs: PAIRS_VB, vt: VT_VB, scales: SCALES_VB, liftPair: LIFT_PAIR_VB, throw: THROW_VB, throwVt: THROW_VT_VB, fallGraph: FALL_VB, road: ROAD_VB, brakeVt: BRAKE_VT_VB, equations: EQUATIONS_VB, graph: GRAPH_VB, chase: CHASE_VB, track: TRACK_VB, vectors: VECTORS_VB, sledge: SLEDGE_VB, hill: HILL_VB, resolve: RESOLVE_VB, bench: BENCH_VB, kick: KICK_VB, crate: CRATE_VB, ladder: LADDER_VB, particle: PARTICLE_VB, pulley: PULLEY_VB, fall: AIR_FALL_VB, wall: WALL_VB, bodies: BODIES_VB, collide: COLLIDE_VB, spanner: SPANNER_VB, pole: POLE_VB, bar: BAR_VB, beam: BEAM_VB, broom: BROOM_VB, platform: PLATFORM_VB, ramp: RAMP_VB, kinetic: KINETIC_VB, height: HEIGHT_VB, cliff: CLIFF_VB, slide: SLIDE_VB, ride: RIDE_VB, winch: WINCH_VB, tank: TANK_VB, dunk: DUNK_VB, tube: TUBE_VB, flow: FLOW_VB, spring: SPRING_VB, wire: WIRE_VB, material: MATERIAL_VB, launcher: LAUNCHER_VB }[fig.kind];
  const aNow = fig.kind === 'lift' ? (live ?? fig.a) : 0;
  // a lift with nothing drawn beside it stands in the middle; kept from the screen before, it glides aside to make room
  const shift = useTween(fig.kind === 'lift' ? liftShiftX(fig) : 0, prev?.kind === 'lift' ? liftShiftX(prev) : undefined, motion.screen);
  // tell the lesson what is on the sheet now (the next screen may keep it)
  useEffect(() => {
    if (memory && !compact) memory.shown = fig.kind === 'lift' ? { ...fig, a: aNow } : fig;
  }, [memory, fig, aNow, compact]);
  let w = width;
  let h = (width * vb.h) / vb.w;
  const maxH = (fig.kind === 'pairs' ? PAIRS_MAX_H : MAX_H) * (compact ? COMPACT : 1);
  if (h > maxH) {
    h = maxH;
    w = (h * vb.w) / vb.h;
  }
  const scale = w / vb.w;
  const animates = !reduced && ((fig.kind === 'lift' && liftMoves(fig, aNow)) || fig.kind === 'scales' || (fig.kind === 'throw' && throwPlays(fig)) || (fig.kind === 'road' && roadPlays(fig)) || (fig.kind === 'chase' && chasePlays(fig)) || (fig.kind === 'track' && trackPlays(fig) && live === undefined) || (fig.kind === 'bench' && benchPlays(fig) && live === undefined) || (fig.kind === 'kick' && kickPlays(fig) && live === undefined) || (fig.kind === 'crate' && cratePlays(fig) && (live === undefined || cratePlaysLive(fig))) || (fig.kind === 'pulley' && pulleyPlays(fig)) || (fig.kind === 'fall' && fallPlays(fig) && live === undefined) || (fig.kind === 'wall' && wallPlays(fig)) || (fig.kind === 'collide' && collidePlays(fig)) || (fig.kind === 'platform' && platformPlays(fig) && live === undefined) || (fig.kind === 'kinetic' && kineticPlays(fig)) || (fig.kind === 'cliff' && cliffPlays(fig) && live === undefined) || (fig.kind === 'slide' && slidePlays(fig) && live === undefined) || (fig.kind === 'ride' && ridePlays(fig)) || (fig.kind === 'winch' && (winchPlays(fig) || live !== undefined)) || (fig.kind === 'tank' && tankPlays(fig)) || (fig.kind === 'tube' && (tubePlays(fig) || live !== undefined)) || fig.kind === 'flow' || (fig.kind === 'spring' && live !== undefined));
  const run = playing && !reduced && !still;
  const targets = !tap ? [] : fig.kind === 'lift' ? liftTargets(fig) : fig.kind === 'pairs' ? pairsTargets() : fig.kind === 'vt' ? vtTargets(fig) : fig.kind === 'throw' ? throwTargets(fig) : fig.kind === 'equations' ? equationsTargets(fig) : fig.kind === 'graph' ? graphTargets(fig) : fig.kind === 'sledge' ? sledgeTargets(fig, live) : fig.kind === 'ladder' ? ladderTargets(fig) : fig.kind === 'pole' ? poleTargets(fig) : fig.kind === 'beam' ? beamTargets(fig) : fig.kind === 'flow' ? flowTargets() : fig.kind === 'spring' ? springTargets(fig) : fig.kind === 'material' ? materialTargets(fig) : [];
  const params = caption ?? paramsOf(fig, aNow, live);

  return (
    <View style={[styles.sheet, { backgroundColor: p.paper, borderColor: p.paperLine }]}>
      <View style={styles.head}>
        <Text style={[styles.fig, { color: p.label }]}>FIG. {n}</Text>
        <Text style={[styles.params, { color: p.label }]} numberOfLines={1}>
          {params}
        </Text>
        {animates && !still && (
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
      <View
        style={styles.body}
        onLayout={(e) => {
          const wNow = e.nativeEvent.layout.width;
          setWidth(wNow);
          if (memory && wNow > 0) memory.width = wNow;
        }}
      >
        {width > 0 && (
          <View style={{ width: w, height: h, alignSelf: 'center' }}>
            <Svg width={w} height={h} viewBox={`0 0 ${vb.w} ${vb.h}`}>
              {/* labels grow to stay readable on a full sheet; a compact sheet is only a reminder and keeps the drawing's proportions */}
              <SheetScale.Provider value={STYLE_2.has(fig.kind) && !classic && !compact ? scale : 0}>
              {fig.kind === 'lift' && <LiftFigure fig={fig} a={aNow} tap={tap} clock={clock} prev={prev?.kind === 'lift' ? prev : undefined} shift={shift} />}
              {fig.kind === 'scales' && <ScalesFigure fig={fig} playing={run} clock={clock} />}
              {fig.kind === 'liftPair' && <LiftPairFigure fig={fig} playing={!reduced && !still} />}
              {fig.kind === 'pairs' && <PairsFigure fig={fig} tap={tap} clock={clock} kept={prev !== undefined} />}
              {fig.kind === 'vt' && <VtFigure fig={fig} tap={tap} />}
              {fig.kind === 'throw' && <ThrowFigure fig={fig} live={live} playing={run} tap={tap} clock={clock} />}
              {fig.kind === 'throwVt' && <ThrowVtFigure fig={fig} clock={clock} />}
              {fig.kind === 'fallGraph' && <FallGraphFigure fig={fig} clock={clock} />}
              {fig.kind === 'road' && <RoadFigure fig={fig} live={live} playing={run} clock={clock} />}
              {fig.kind === 'brakeVt' && <BrakeVtFigure fig={fig} clock={clock} />}
              {fig.kind === 'equations' && <EquationsFigure fig={fig} tap={tap} clock={clock} />}
              {fig.kind === 'graph' && <GraphFigure fig={fig} live={live} tap={tap} clock={clock} />}
              {fig.kind === 'chase' && <ChaseFigure fig={fig} playing={run} clock={clock} />}
              {fig.kind === 'track' && <TrackFigure fig={fig} live={live} playing={run} clock={clock} />}
              {fig.kind === 'vectors' && <VectorsFigure fig={fig} clock={clock} />}
              {fig.kind === 'sledge' && <SledgeFigure fig={fig} live={live} tap={tap} clock={clock} />}
              {fig.kind === 'hill' && <HillFigure fig={fig} clock={clock} />}
              {fig.kind === 'resolve' && <ResolveFigure fig={fig} clock={clock} />}
              {fig.kind === 'bench' && <BenchFigure fig={fig} live={live} playing={run} clock={clock} />}
              {fig.kind === 'kick' && <KickFigure fig={fig} live={live} playing={run} clock={clock} />}
              {fig.kind === 'crate' && <CrateFigure fig={fig} live={live} playing={run} clock={clock} prev={prev?.kind === 'crate' ? prev : undefined} />}
              {fig.kind === 'ladder' && <LadderFigure fig={fig} tap={tap} clock={clock} />}
              {fig.kind === 'particle' && <ParticleFigure fig={fig} clock={clock} />}
              {fig.kind === 'pulley' && <PulleyFigure fig={fig} live={live} playing={run} clock={clock} />}
              {fig.kind === 'fall' && <FallFigure fig={fig} live={live} playing={run} clock={clock} />}
              {fig.kind === 'wall' && <WallFigure fig={fig} live={live} playing={run} clock={clock} />}
              {fig.kind === 'bodies' && <BodiesFigure fig={fig} clock={clock} />}
              {fig.kind === 'collide' && <CollideFigure fig={fig} live={live} playing={run} clock={clock} />}
              {fig.kind === 'spanner' && <SpannerFigure fig={fig} live={live} clock={clock} />}
              {fig.kind === 'pole' && <PoleFigure fig={fig} tap={tap} clock={clock} />}
              {fig.kind === 'bar' && <BarFigure fig={fig} clock={clock} />}
              {fig.kind === 'beam' && <BeamFigure fig={fig} live={live} tap={tap} clock={clock} />}
              {fig.kind === 'broom' && <BroomFigure fig={fig} clock={clock} />}
              {fig.kind === 'platform' && <PlatformFigure fig={fig} live={live} playing={run} clock={clock} />}
              {fig.kind === 'ramp' && <RampFigure fig={fig} live={live} clock={clock} />}
              {fig.kind === 'kinetic' && <KineticFigure fig={fig} live={live} playing={run} clock={clock} />}
              {fig.kind === 'height' && <HeightFigure fig={fig} live={live} clock={clock} />}
              {fig.kind === 'cliff' && <CliffFigure fig={fig} live={live} playing={run} clock={clock} />}
              {fig.kind === 'slide' && <SlideFigure fig={fig} live={live} playing={run} clock={clock} />}
              {fig.kind === 'ride' && <RideFigure fig={fig} live={live} playing={run} clock={clock} />}
              {fig.kind === 'winch' && <WinchFigure fig={fig} live={live} playing={run} clock={clock} />}
              {fig.kind === 'tank' && <TankFigure fig={fig} live={live} playing={run} clock={clock} />}
              {fig.kind === 'dunk' && <DunkFigure fig={fig} live={live} clock={clock} />}
              {fig.kind === 'tube' && <TubeFigure fig={fig} live={live} playing={run} clock={clock} />}
              {fig.kind === 'flow' && <FlowFigure fig={fig} playing={run} tap={tap} clock={clock} />}
              {fig.kind === 'spring' && <SpringFigure fig={fig} live={live} playing={run} tap={tap} clock={clock} />}
              {fig.kind === 'wire' && <WireFigure fig={fig} live={live} clock={clock} />}
              {fig.kind === 'material' && <MaterialFigure fig={fig} live={live} tap={tap} clock={clock} />}
              {fig.kind === 'launcher' && <LauncherFigure fig={fig} live={live} clock={clock} />}
              </SheetScale.Provider>
            </Svg>
            {fig.kind === 'lift' && <ShaftMarks fig={fig} a={aNow} scale={scale} playing={run} clock={clock} shift={shift} />}
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

/** The given values in the sheet header. On an explore screen the slider's value is on the slider, so it is left out. */
function paramsOf(fig: Fig, a: number, live: number | undefined): string {
  switch (fig.kind) {
    case 'lift':
      return liftParams(fig, a, live !== undefined);
    case 'vt':
      return 'lift trip, upward';
    case 'throw':
      return throwParams(fig);
    case 'throwVt':
      return `ball A, u = +${fig.u.toFixed(1)} m s⁻¹, up is +`;
    case 'fallGraph':
      return 'dropped from rest';
    case 'road':
      return roadParams(fig);
    case 'brakeVt':
      return `a = ${fixed(fig.a, 1)} m s⁻² for both cars`;
    case 'equations':
      return 'constant acceleration';
    case 'graph':
      return fig.header;
    case 'chase':
      return chaseParams(fig);
    case 'track':
      return trackParams(fig, live);
    case 'vectors':
      return fig.header;
    case 'sledge':
      return sledgeParams(fig, live);
    case 'hill':
      return hillParams(fig);
    case 'resolve':
      return fig.header;
    case 'bench':
      return benchParams(fig, live);
    case 'kick':
      return kickParams(fig, live);
    case 'crate':
      return crateParams(fig, live);
    case 'ladder':
      return ladderParams(fig);
    case 'particle':
      return fig.header;
    case 'pulley':
      return pulleyParams(fig, live);
    case 'fall':
      return fallParams(fig, live);
    case 'wall':
      return wallParams(fig, live);
    case 'bodies':
      return fig.header;
    case 'collide':
      return collideParams(fig, live);
    case 'spanner':
      return spannerParams(fig);
    case 'pole':
      return poleParams(fig);
    case 'bar':
      return barParams(fig);
    case 'beam':
      return fig.header;
    case 'broom':
      return broomParams(fig);
    case 'platform':
      return platformParams(fig, live);
    case 'ramp':
      return rampParams(fig, live);
    case 'kinetic':
      return kineticParams(fig, live);
    case 'height':
      return heightParams(fig);
    case 'cliff':
      return cliffParams(fig, live);
    case 'slide':
      return slideParams(fig, live);
    case 'ride':
      return rideParams(fig, live);
    case 'winch':
      return winchParams(fig, live);
    case 'tank':
      return tankParams(fig, live);
    case 'dunk':
      return dunkParams(fig, live);
    case 'tube':
      return tubeParams(fig, live);
    case 'flow':
      return flowParams(fig);
    case 'spring':
      return springParams(fig);
    case 'wire':
      return wireParams(fig);
    case 'material':
      return materialParams(fig);
    case 'launcher':
      return launcherParams(fig);
    default:
      return `m = ${fig.m} kg`;
  }
}

const styles = StyleSheet.create({
  sheet: { borderWidth: 1, borderRadius: radius.m, paddingTop: 10, paddingBottom: 8, paddingHorizontal: 10, alignSelf: 'stretch' },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, paddingHorizontal: 4 },
  fig: { fontFamily: font.monoBold, fontSize: 11, letterSpacing: 1 },
  params: { fontFamily: font.mono, fontSize: 11, flex: 1, textAlign: 'right' },
  body: { alignSelf: 'stretch', marginTop: 4 },
  play: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginVertical: -6 },
});
