// The drawing sheet: every figure sits on pale drafting paper with a FIG number and its given values.
// It sizes the SVG to the available width and lays tap targets (if any) over the drawing.
import { useContext, useEffect, useState } from 'react';
import { AppState, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import type { Fig } from '@/content/types';
import { CleanTheme, useTheme } from '@/theme/ThemeContext';
import { font, motion, radius } from '@/theme/tokens';
import { useReducedMotionPref } from '@/ui/parts';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { fixed } from '@/physics/format';
import { PuzzleContext } from '@/lesson/puzzle';
import { SheetClean, SheetMinText, SheetScale, TINY } from './draw';
import { LIFT_VB, LiftFigure, liftMoves, liftParams, liftShiftX, liftTargets, ShaftMarks } from './LiftFigure';
import { LIFT_PAIR_VB, LiftPairFigure } from './LiftPairFigure';
import { SCALES_VB, ScalesFigure } from './ScalesFigure';
import { PAIRS_MAX_H, PAIRS_VB, PairsFigure, pairsTargets } from './PairsFigure';
import { LessonFigs, SharedSheet, SheetReplay, SheetVisible, useDrawIn, useFirstShow, useTween } from './anim';
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
import { FALL_VT_VB, FallVtFigure } from './FallVtGraph';
import { PLOT_VB, PlotFigure } from './PlotFigure';
import { WALL_VB, WallFigure, wallParams, wallPlays } from './WallFigure';
import { BODIES_VB, BodiesFigure } from './BodiesFigure';
import { COLLIDE_VB, CollideFigure, collideParams, collidePlays } from './CollideFigure';
import { SPANNER_VB, SpannerFigure, spannerParams, spannerPlays } from './SpannerFigure';
import { POLE_VB, PoleFigure, poleParams, poleTargets } from './PoleFigure';
import { BAR_VB, BarFigure, barParams, barPlays } from './BarFigure';
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
import { MATERIAL_VB, MaterialFigure, materialParams, materialPlays, materialTargets } from './MaterialFigure';
import { LAUNCHER_VB, LauncherFigure, launcherParams, launcherPlays } from './LauncherFigure';
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
  'ladder', 'particle', 'pulley', 'liftPair', 'scales', 'pairs', 'vt', 'fall', 'fallVt', 'plot',
  // Momentum and moments (C5)
  'wall', 'bodies', 'spanner', 'pole', 'bar', 'beam', 'broom',
  // Energy (C6)
  'platform', 'ramp', 'kinetic', 'height', 'cliff', 'slide', 'ride', 'winch',
  // Fluids (C7)
  'tank', 'dunk', 'tube', 'flow',
  // Materials (C8)
  'spring', 'wire', 'material', 'launcher',
]);

/** Figures redrawn in style 3 (a white gridded sheet, soft bodies), stage by stage: docs/V4_FIGURES_TASKS.md. */
const CLEAN = new Set<Fig['kind']>(['lift', 'track', 'scales', 'pairs', 'liftPair', 'vt', 'graph', 'equations', 'brakeVt', 'throwVt', 'fallGraph', 'plot', 'road', 'chase', 'throw', 'bench', 'kick', 'vectors', 'resolve', 'sledge', 'hill', 'crate', 'ladder', 'particle', 'pulley', 'fall', 'fallVt', 'wall', 'bodies', 'collide', 'spanner', 'pole', 'bar', 'beam', 'broom']);
/** Figures on squared paper of their own, where a square means something: they get no second grid. */
const OWN_GRID: Fig['kind'][] = ['vectors', 'resolve'];
const GRID = 34; // viewBox units between grid lines

/** The faint grid under a style-3 figure. */
function Grid({ w, h }: { w: number; h: number }) {
  const { soft } = useTheme();
  const d: string[] = [];
  for (let x = GRID / 2; x < w; x += GRID) d.push(`M${x},0 V${h}`);
  for (let y = GRID / 2; y < h; y += GRID) d.push(`M0,${y} H${w}`);
  return <Path d={d.join(' ')} stroke={soft.grid} strokeWidth={1} fill="none" />;
}

/** Moving figures with no clip to start again: endless flows, or a load that only settles. */
const NO_REPLAY: Fig['kind'][] = ['lift', 'liftPair', 'flow', 'ride', 'spring'];

/** Every figure is drawn at the same size on every screen, so the drawing never jumps between screens. */
const MAX_H = 270;
/** Style-3 figures are drawn larger: up to this height, and never more than a share of the screen's height. */
const CLEAN_MAX_H = 372;
const CLEAN_MIN_H = 270;
const CLEAN_SHARE = 0.42;
/** A compact sheet is at most this share of the full height. */
const COMPACT = 0.6;
/** The figures that draw themselves the first time their kind appears in a lesson. */
const DRAWS_ITSELF: Fig['kind'][] = ['scales', 'lift', 'pairs', 'throw', 'throwVt', 'fallGraph', 'road', 'brakeVt', 'equations', 'graph', 'chase', 'track', 'vectors', 'sledge', 'hill', 'resolve', 'bench', 'kick', 'crate', 'ladder', 'particle', 'pulley', 'fall', 'fallVt', 'plot', 'wall', 'bodies', 'collide', 'spanner', 'pole', 'bar', 'beam', 'broom', 'platform', 'ramp', 'kinetic', 'height', 'cliff', 'slide', 'ride', 'winch', 'tank', 'dunk', 'tube', 'flow', 'spring', 'wire', 'material', 'launcher'];

/** False while the app is in the background: nothing on a sheet animates then. */
function useAppActive(): boolean {
  const [active, setActive] = useState(AppState.currentState !== 'background');
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => setActive(state === 'active'));
    return () => sub.remove();
  }, []);
  return active;
}

export function Sheet(props: Props) {
  // a style-3 sheet is white: everything on it that paints "paper" must paint that white
  return CLEAN.has(props.fig.kind) ? (
    <CleanTheme>
      <Drawing {...props} />
    </CleanTheme>
  ) : (
    <Drawing {...props} />
  );
}

function Drawing({ fig, n, live, tap: tapIn, caption, compact = false, still: stillProp = false }: Props) {
  const still = compact || stillProp;
  const tap = still ? undefined : tapIn;
  const { palette: p, soft, classic } = useTheme();
  const screenH = useWindowDimensions().height;
  const clean = CLEAN.has(fig.kind);
  const memory = useContext(LessonFigs);
  const puzzle = useContext(PuzzleContext);
  // the screen before showed this kind of figure: the sheet is already drawn at its width and changes from `prev`
  const shared = useContext(SharedSheet);
  const prev = shared && shared.prev.kind === fig.kind ? shared.prev : undefined;
  const [width, setWidth] = useState(prev && shared ? shared.width : 0);
  const [playing, setPlaying] = useState(true);
  const [replays, setReplays] = useState(0);
  const reduced = useReducedMotionPref();
  // scrolled mostly out of view (Frame), a compact reminder, or the app in the background: loops pause, changes finish
  const appActive = useAppActive();
  const inView = useContext(SheetVisible) && !compact && appActive;
  // the first figure of each kind in a lesson draws itself; the pen starts once the sheet knows its size
  const first = useFirstShow(fig.kind);
  const clock = useDrawIn(!still && first && width > 0 && DRAWS_ITSELF.includes(fig.kind));
  const vb = { lift: LIFT_VB, pairs: PAIRS_VB, vt: VT_VB, scales: SCALES_VB, liftPair: LIFT_PAIR_VB, throw: THROW_VB, throwVt: THROW_VT_VB, fallGraph: FALL_VB, road: ROAD_VB, brakeVt: BRAKE_VT_VB, equations: EQUATIONS_VB, graph: GRAPH_VB, chase: CHASE_VB, track: TRACK_VB, vectors: VECTORS_VB, sledge: SLEDGE_VB, hill: HILL_VB, resolve: RESOLVE_VB, bench: BENCH_VB, kick: KICK_VB, crate: CRATE_VB, ladder: LADDER_VB, particle: PARTICLE_VB, pulley: PULLEY_VB, fall: AIR_FALL_VB, fallVt: FALL_VT_VB, plot: PLOT_VB, wall: WALL_VB, bodies: BODIES_VB, collide: COLLIDE_VB, spanner: SPANNER_VB, pole: POLE_VB, bar: BAR_VB, beam: BEAM_VB, broom: BROOM_VB, platform: PLATFORM_VB, ramp: RAMP_VB, kinetic: KINETIC_VB, height: HEIGHT_VB, cliff: CLIFF_VB, slide: SLIDE_VB, ride: RIDE_VB, winch: WINCH_VB, tank: TANK_VB, dunk: DUNK_VB, tube: TUBE_VB, flow: FLOW_VB, spring: SPRING_VB, wire: WIRE_VB, material: MATERIAL_VB, launcher: LAUNCHER_VB }[fig.kind];
  const aNow = fig.kind === 'lift' ? (live ?? fig.a) : 0;
  // a lift with nothing drawn beside it stands in the middle; kept from the screen before, it glides aside to make room
  const shift = useTween(fig.kind === 'lift' ? liftShiftX(fig) : 0, prev?.kind === 'lift' ? liftShiftX(prev) : undefined, motion.screen);
  // tell the lesson what is on the sheet now (the next screen may keep it)
  useEffect(() => {
    if (memory && !compact) memory.shown = fig.kind === 'lift' ? { ...fig, a: aNow } : fig;
  }, [memory, fig, aNow, compact]);
  let w = width;
  let h = (width * vb.h) / vb.w;
  const maxH = (fig.kind === 'pairs' ? PAIRS_MAX_H : clean ? Math.min(CLEAN_MAX_H, Math.max(CLEAN_MIN_H, screenH * CLEAN_SHARE)) : MAX_H) * (compact ? COMPACT : 1);
  if (h > maxH) {
    h = maxH;
    w = (h * vb.w) / vb.h;
  }
  const scale = w / vb.w;
  const animates = !reduced && ((fig.kind === 'lift' && liftMoves(fig, aNow)) || fig.kind === 'scales' || (fig.kind === 'throw' && throwPlays(fig)) || (fig.kind === 'road' && roadPlays(fig)) || (fig.kind === 'chase' && chasePlays(fig)) || (fig.kind === 'track' && trackPlays(fig) && live === undefined) || (fig.kind === 'bench' && benchPlays(fig) && live === undefined) || (fig.kind === 'kick' && kickPlays(fig) && live === undefined) || (fig.kind === 'crate' && cratePlays(fig) && (live === undefined || cratePlaysLive(fig))) || (fig.kind === 'pulley' && pulleyPlays(fig)) || (fig.kind === 'fall' && fallPlays(fig) && live === undefined) || (fig.kind === 'wall' && wallPlays(fig)) || (fig.kind === 'collide' && collidePlays(fig)) || (fig.kind === 'platform' && platformPlays(fig) && live === undefined) || (fig.kind === 'kinetic' && kineticPlays(fig)) || (fig.kind === 'cliff' && cliffPlays(fig) && live === undefined) || (fig.kind === 'slide' && slidePlays(fig) && live === undefined) || (fig.kind === 'ride' && ridePlays(fig)) || (fig.kind === 'winch' && (winchPlays(fig) || live !== undefined)) || (fig.kind === 'tank' && tankPlays(fig)) || (fig.kind === 'tube' && (tubePlays(fig) || live !== undefined)) || fig.kind === 'flow' || (fig.kind === 'spanner' && spannerPlays(fig, live)) || (fig.kind === 'bar' && barPlays(fig)) || (fig.kind === 'launcher' && launcherPlays(fig, live)) || (fig.kind === 'material' && materialPlays(fig, live)) || (fig.kind === 'spring' && live !== undefined));
  const run = playing && !reduced && !still;
  // a clip with a start (not an endless flow or a figure with its own clock) can be played again from 0
  const oncePlays = (fig.kind === 'vectors' || fig.kind === 'resolve' || fig.kind === 'broom') && fig.play === true;
  const replayable = !reduced && !still && ((animates && !NO_REPLAY.includes(fig.kind)) || oncePlays);
  const targets = !tap ? [] : fig.kind === 'lift' ? liftTargets(fig) : fig.kind === 'pairs' ? pairsTargets() : fig.kind === 'vt' ? vtTargets(fig) : fig.kind === 'throw' ? throwTargets(fig) : fig.kind === 'equations' ? equationsTargets(fig) : fig.kind === 'graph' ? graphTargets(fig) : fig.kind === 'sledge' ? sledgeTargets(fig, live) : fig.kind === 'ladder' ? ladderTargets(fig) : fig.kind === 'pole' ? poleTargets(fig) : fig.kind === 'beam' ? beamTargets(fig) : fig.kind === 'flow' ? flowTargets() : fig.kind === 'spring' ? springTargets(fig) : fig.kind === 'material' ? materialTargets(fig) : [];
  const params = caption ?? paramsOf(fig, aNow, live);

  return (
    <SheetVisible.Provider value={inView}>
    <View style={[styles.sheet, { backgroundColor: p.paper, borderColor: clean ? soft.border : p.paperLine }, clean && styles.cleanSheet, clean && !compact && styles.wideSheet]}>
      {puzzle?.solved && !compact && <PuzzleSolved color={puzzle.color} reduced={reduced} />}
      <View style={styles.head}>
        <Text style={[styles.fig, { color: p.label }]}>FIG. {n}</Text>
        <Text style={[styles.params, { color: p.label }]} numberOfLines={1}>
          {params}
        </Text>
        {replayable && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Replay"
            onPress={() => {
              setReplays((n) => n + 1);
              setPlaying(true);
            }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 6 }}
            style={[styles.play, { borderColor: p.paperLine }]}
          >
            <Svg width={14} height={14} viewBox="0 0 24 24">
              <Path d="M5.5,12 A6.5,6.5 0 1 0 8,7 M4.5,4.5 V8.5 H8.5" fill="none" stroke={p.label} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
        )}
        {animates && !still && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={playing ? 'Pause the animation' : 'Play the animation'}
            onPress={() => setPlaying((x) => !x)}
            hitSlop={{ top: 12, bottom: 12, left: replayable ? 6 : 12, right: 12 }}
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
              {clean && !OWN_GRID.includes(fig.kind) && <Grid w={vb.w} h={vb.h} />}
              <SheetClean.Provider value={clean}>
              <SheetReplay.Provider value={replays}>
              <SheetScale.Provider value={STYLE_2.has(fig.kind) && !classic && !compact ? scale : 0}>
              <SheetMinText.Provider value={compact ? TINY / scale : 0}>
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
              {fig.kind === 'fallVt' && <FallVtFigure fig={fig} clock={clock} />}
              {fig.kind === 'plot' && <PlotFigure fig={fig} clock={clock} />}
              {fig.kind === 'wall' && <WallFigure fig={fig} live={live} playing={run} clock={clock} />}
              {fig.kind === 'bodies' && <BodiesFigure fig={fig} clock={clock} />}
              {fig.kind === 'collide' && <CollideFigure fig={fig} live={live} playing={run} clock={clock} />}
              {fig.kind === 'spanner' && <SpannerFigure fig={fig} live={live} playing={run} clock={clock} />}
              {fig.kind === 'pole' && <PoleFigure fig={fig} tap={tap} clock={clock} />}
              {fig.kind === 'bar' && <BarFigure fig={fig} playing={run} clock={clock} />}
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
              {fig.kind === 'material' && <MaterialFigure fig={fig} live={live} tap={tap} playing={run} clock={clock} />}
              {fig.kind === 'launcher' && <LauncherFigure fig={fig} live={live} playing={run} clock={clock} />}
              </SheetMinText.Provider>
              </SheetScale.Provider>
              </SheetReplay.Provider>
              </SheetClean.Provider>
            </Svg>
            {fig.kind === 'lift' && !compact && <ShaftMarks fig={fig} a={aNow} scale={scale} playing={run} clock={clock} shift={shift} />}
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
    </SheetVisible.Provider>
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
    case 'fallVt':
      return fig.header;
    case 'plot':
      return fig.header;
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

/**
 * The puzzle is solved: the sheet's frame lights up in the level's colour (2 → 3 → 2 pt, once) and a chip sits on its edge.
 * With reduced motion only the chip shows.
 */
function PuzzleSolved({ color, reduced }: { color: string; reduced: boolean }) {
  const k = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (reduced) return;
    k.set(withSequence(withTiming(1, { duration: motion.celebrate * 0.35, easing: Easing.out(Easing.cubic) }), withTiming(0.4, { duration: motion.celebrate * 0.65, easing: Easing.inOut(Easing.cubic) })));
  }, [k, reduced]);
  // k: 0 nothing, 1 the flash (3 pt), 0.4 the resting frame (2 pt)
  const frame = useAnimatedStyle(() => ({ opacity: Math.min(1, k.get() * 2.5), borderWidth: 2 + (k.get() > 0.4 ? (k.get() - 0.4) / 0.6 : 0) }));
  return (
    <>
      {!reduced && <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: radius.m, borderColor: color }, frame]} />}
      <View pointerEvents="none" accessible accessibilityLabel="Puzzle solved" style={[styles.chip, { backgroundColor: color }]}>
        <Text style={styles.chipText}>PUZZLE SOLVED</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  cleanSheet: { borderRadius: 20 },
  // a full style-3 sheet reaches nearly to the edges of the phone
  wideSheet: { marginHorizontal: -12 },
  chip: { position: 'absolute', top: -11, left: 14, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, zIndex: 2 },
  chipText: { fontFamily: font.monoBold, fontSize: 11, letterSpacing: 1, color: '#FFFFFF' },
  sheet: { borderWidth: 1, borderRadius: radius.m, paddingTop: 10, paddingBottom: 8, paddingHorizontal: 10, alignSelf: 'stretch' },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, paddingHorizontal: 4 },
  fig: { fontFamily: font.monoBold, fontSize: 11, letterSpacing: 1 },
  params: { fontFamily: font.mono, fontSize: 11, flex: 1, textAlign: 'right' },
  body: { alignSelf: 'stretch', marginTop: 4 },
  play: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginVertical: -6 },
});
