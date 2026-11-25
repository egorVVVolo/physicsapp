// The map of one course (/learn?level=<id> opens it at that level). Levels follow the WPH11 specification; each lesson is a puck on a path.
// The level plate stays pinned and changes as you scroll; the card at the bottom starts the picked
// lesson; a round button brings you back to the next lesson when it has scrolled away.
// Coming back from a lesson just finished: its puck pops its check and a ball rolls to the next lesson.
import { useCallback, useEffect, useMemo, useRef, useState, type ComponentRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { uiIcon } from '@/art/uiIcons';
import { levelObject, object } from '@/art/objects';
import { course } from '@/content/course';
import { lessons } from '@/content/lessons';
import type { Level } from '@/content/types';
import type { PuckState } from '@/figures/Puck';
import { CONTENT_MAX } from '@/lesson/Frame';
import { Dock } from '@/map/Dock';
import { MomentumChip, MomentumSheet } from '@/map/Momentum';
import { LevelPlate } from '@/map/LevelPlate';
import { PuckRow } from '@/map/PuckRow';
import { RollingBall, type Point } from '@/map/RollingBall';
import { LEVEL_OBJECT, labelX, levelAt, puckX, puckY, rowLayout } from '@/map/layout';
import { loadProgress, loadStreak } from '@/session/storage';
import { emptyStreak, type Streak } from '@/session/streak';
import { useTheme } from '@/theme/ThemeContext';
import { font, levelColors, reward, soonGrey, soonReward } from '@/theme/tokens';
import { Art } from '@/ui/Art';
import { feedback } from '@/ui/feedback';

type Status = 'new' | 'started' | 'done';
const PAD_TOP = 4;
/** Space at the top of a level section: none for the first (the plate names it), a divider for the rest. */
const headOf = (li: number) => (li === 0 ? 12 : 96);
const allRefs = course.levels.flatMap((l) => l.lessons.map((r) => ({ r, level: l.id })));

/** `onBack` returns to the list of courses. */
export function CourseMap({ onBack }: { onBack: () => void }) {
  const { palette: p } = useTheme();
  const insets = useSafeAreaInsets();
  const [status, setStatus] = useState<Record<string, Status>>({});
  const ready = useMemo(() => allRefs.filter((x) => x.r.ready), []);
  /** The next lesson to do: the first ready one not finished yet. */
  const nextId = ready.find((x) => status[x.r.id] !== 'done')?.r.id ?? '';
  const [picked, setPicked] = useState<string>(ready[0]?.r.id ?? allRefs[0].r.id);
  /** Picked a puck since the map came into view: then the card shows that lesson even when all are done. */
  const [touched, setTouched] = useState(false);
  const allDone = ready.length > 0 && ready.every((x) => status[x.r.id] === 'done') && !touched;
  const reduced = useReducedMotion();
  /** Status as it was the last time the map was shown: tells which lesson has just been finished. */
  const prevStatus = useRef<Record<string, Status> | null>(null);
  const [popId, setPopId] = useState(''); // the lesson just finished: its puck pops its check
  const [arriving, setArriving] = useState(''); // the next lesson, waiting for the ball to reach it
  const [arrived, setArrived] = useState(''); // the next lesson, just opened by the ball
  const [roll, setRoll] = useState<{ from: string; to: string } | null>(null); // lesson ids
  const [streak, setStreak] = useState<Streak>(emptyStreak);
  const [momentumOpen, setMomentumOpen] = useState(false);

  const [width, setWidth] = useState(0);
  const [viewH, setViewH] = useState(0);
  const [dockH, setDockH] = useState(170); // height of the bottom card
  const [plateIdx, setPlateIdx] = useState(0);
  const [away, setAway] = useState<0 | 1 | -1>(0); // next lesson is off screen: above (-1) or below (1)
  const sectionY = useRef<number[]>([]);
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const scrollY = useRef(0);
  const savedY = useRef(0);
  const placed = useRef(false);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      setTouched(false);
      setPopId('');
      setArrived('');
      loadStreak().then((s) => alive && setStreak(s));
      Promise.all(
        ready.map(async ({ r }) => {
          const saved = await loadProgress(lessons[r.id]);
          return [r.id, !saved ? 'new' : saved.state.finished ? 'done' : 'started'] as const;
        }),
      ).then((pairs) => {
        if (!alive) return;
        const now: Record<string, Status> = Object.fromEntries(pairs);
        const before = prevStatus.current;
        prevStatus.current = now;
        setStatus(now);
        // back from a lesson: the web hid the map (display: none) and reset its scroll, so put it back
        if (placed.current) {
          scroll.current?.scrollTo({ y: savedY.current, animated: false });
          scrollY.current = savedY.current;
        }
        const just = before && ready.find((x) => before[x.r.id] !== 'done' && now[x.r.id] === 'done');
        if (!just) return;
        setPopId(just.r.id);
        const to = ready.find((x) => now[x.r.id] !== 'done')?.r.id;
        if (!to) return;
        if (reduced) setPicked(to);
        else setArriving(to);
      });
      return () => {
        alive = false;
        savedY.current = scrollY.current;
      };
    }, [ready, reduced]),
  );

  /** Where a lesson's puck face is inside the list of levels, or undefined until its level is laid out. */
  const puckAt = (id: string): Point | undefined => {
    const li = course.levels.findIndex((l) => l.lessons.some((r) => r.id === id));
    const top = sectionY.current[li];
    if (li < 0 || top === undefined) return undefined;
    const level = course.levels[li];
    const i = level.lessons.findIndex((r) => r.id === id);
    const rows = rowLayout(level.lessons.length, level.lessons.findIndex((r) => r.id === nextId));
    return { x: puckX(width, i), y: top + headOf(li) + puckY(rows.tops[i], rows.heights[i]) };
  };

  /** A lesson was just finished and the next one waits: after a beat, scroll to it if needed, then roll the ball. */
  useEffect(() => {
    if (!arriving) return;
    let roll: ReturnType<typeof setTimeout> | undefined;
    const beat = setTimeout(() => {
      const target = puckContentY(arriving);
      const off = target !== undefined && viewH > 0 && (target < scrollY.current + 30 || target > scrollY.current + viewH - dockH + 10);
      if (off) bringBack(true);
      roll = setTimeout(() => {
        if (puckAt(popId) && puckAt(arriving)) setRoll({ from: popId, to: arriving });
        else onArrive();
      }, off ? 450 : 0);
    }, 260);
    return () => {
      clearTimeout(beat);
      if (roll) clearTimeout(roll);
    };
  }, [arriving]);

  const onArrive = () => {
    feedback.unlock();
    setArrived(arriving);
    setPicked(arriving);
    setArriving('');
    setTimeout(() => setRoll(null), 200);
  };

  /** Content y of a lesson's puck centre, or undefined until its level is laid out. */
  const puckContentY = (id: string): number | undefined => {
    const at = puckAt(id);
    return at && PAD_TOP + at.y;
  };

  const update = (y: number) => {
    scrollY.current = y;
    const tops = course.levels.map((_, i) => PAD_TOP + (sectionY.current[i] ?? Infinity));
    const idx = levelAt(y + 40, tops);
    if (idx !== plateIdx) setPlateIdx(idx);
    const target = puckContentY(nextId || picked);
    if (target === undefined || !viewH) return;
    const side = target < y + 30 ? -1 : target > y + viewH - dockH + 10 ? 1 : 0;
    if (side !== away) setAway(side);
  };

  const bringBack = (animated: boolean) => {
    const target = puckContentY(nextId || picked);
    if (target === undefined || !viewH) return;
    const y = Math.max(0, target - (viewH - dockH) * 0.45);
    scroll.current?.scrollTo({ y, animated });
    if (!animated) update(y);
  };

  /** Once every level has a position and the status is known, open the map at the next lesson. */
  const loaded = Object.keys(status).length > 0 || ready.length === 0;
  useEffect(() => {
    if (placed.current || !viewH || !loaded || sectionY.current.filter((v) => v !== undefined).length < course.levels.length) return;
    placed.current = true;
    setTimeout(() => bringBack(false), 0);
  });
  // opened from Home's course bars: /learn?level=forces scrolls to that level once the map is laid out
  const { level: askLevel } = useLocalSearchParams<{ level?: string }>();
  useEffect(() => {
    if (!askLevel || !placed.current) return;
    const li = course.levels.findIndex((l) => l.id === askLevel);
    const top = sectionY.current[li];
    if (li < 0 || top === undefined) return;
    const y = Math.max(0, PAD_TOP + top + (li === 0 ? 0 : headOf(li) - 70));
    router.setParams({ level: undefined });
    // after the first placement (which opens the map at the next lesson) has run
    setTimeout(() => {
      scroll.current?.scrollTo({ y, animated: !reduced });
      update(y);
    }, 40);
  });
  const onSectionLayout = (li: number, y: number, h: number) => {
    if (h === 0) return; // hidden (the web hides the map while a lesson is open): keep the last real layout
    sectionY.current[li] = y;
    if (!placed.current) setLaidOut((n) => n + 1);
  };
  const [, setLaidOut] = useState(0);

  // the ball's ends, measured on every render so a late layout (width, section tops) cannot leave it stale
  const rollFrom = roll && puckAt(roll.from);
  const rollTo = roll && puckAt(roll.to);
  const doneCount = Object.values(status).filter((s) => s === 'done').length;
  const plateLevel = course.levels[plateIdx];
  const pickedRef = allRefs.find((x) => x.r.id === picked) ?? allRefs[0];
  let order = 0;

  return (
    <View style={{ flex: 1, backgroundColor: p.page, paddingTop: insets.top }}>
      {/* top bar: the course mark, the tools, and an honest count of finished lessons (the course name heads the map) */}
      <View style={styles.column}>
        <View style={styles.topBar}>
          <Pressable accessibilityRole="button" accessibilityLabel="Back to all courses" onPress={onBack} hitSlop={8} style={({ pressed }) => [styles.courses, { opacity: pressed ? 0.6 : 1 }]}>
            <Art xml={uiIcon('back')} width={22} color={p.ink} />
            <Text style={[styles.coursesText, { color: p.ink }]}>Courses</Text>
          </Pressable>
          <View style={{ flex: 1 }} />
          <MomentumChip streak={streak} onPress={() => setMomentumOpen(true)} />
          <View style={[styles.count, { borderColor: p.chipLine, backgroundColor: p.page }]} accessibilityLabel={`${doneCount} of ${allRefs.length} lessons done`}>
            <Text style={[styles.countText, { color: p.ink }]}>
              {doneCount}/{allRefs.length}
            </Text>
          </View>
        </View>
        <View style={styles.plateWrap}>
          <LevelPlate
            index={plateIdx}
            title={plateLevel.title}
            color={levelColors[plateLevel.id]}
            total={plateLevel.lessons.length}
            done={plateLevel.lessons.filter((r) => status[r.id] === 'done').length}
          />
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <ScrollView
          ref={scroll}
          onLayout={(e) => e.nativeEvent.layout.height > 0 && setViewH(e.nativeEvent.layout.height)}
          onScroll={(e: NativeSyntheticEvent<NativeScrollEvent>) => update(e.nativeEvent.contentOffset.y)}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingTop: PAD_TOP, paddingHorizontal: 20, paddingBottom: dockH + 40 }}
        >
          <View style={styles.list} onLayout={(e) => e.nativeEvent.layout.width > 0 && setWidth(e.nativeEvent.layout.width)}>
            <View style={styles.courseHead}>
              <Text accessibilityRole="header" style={[styles.courseTitle, { color: p.ink }]}>
                {course.title}
              </Text>
              <Text style={[styles.courseSub, { color: p.muted }]}>Edexcel IAL Unit 1 (WPH11)</Text>
            </View>
            {width > 0 &&
              course.levels.map((level, li) => (
                <LevelSection
                  key={level.id}
                  level={level}
                  li={li}
                  width={width}
                  status={status}
                  picked={picked}
                  nextId={nextId}
                  arriving={arriving}
                  popIds={[popId, arrived]}
                  firstOrder={(order += level.lessons.length) - level.lessons.length}
                  onPick={(id) => {
                    setPicked(id);
                    setTouched(true);
                  }}
                  onLayoutY={(y, h) => onSectionLayout(li, y, h)}
                />
              ))}
            {rollFrom && rollTo && <RollingBall from={rollFrom} to={rollTo} onArrive={onArrive} />}
          </View>
        </ScrollView>
        {/* soft edge under the pinned plate */}
        <View pointerEvents="none" style={[styles.topFade, { backgroundColor: p.page }]} />

        <Dock
          r={pickedRef.r}
          color={levelColors[pickedRef.level]}
          status={status[pickedRef.r.id] ?? 'new'}
          allDone={allDone}
          bottomInset={0}
          onHeight={(h) => h > 0 && setDockH(h)}
          onStart={() => router.push(`/lesson/${pickedRef.r.id}`)}
        />
        <BackButton side={away} bottom={dockH + 12} onPress={() => bringBack(true)} />
      </View>
      {momentumOpen && <MomentumSheet streak={streak} onClose={() => setMomentumOpen(false)} />}
    </View>
  );
}

function LevelSection({ level, li, width, status, picked, nextId, arriving, popIds, firstOrder, onPick, onLayoutY }: {
  level: Level;
  li: number;
  width: number;
  status: Record<string, Status>;
  picked: string;
  nextId: string;
  /** The next lesson while the ball is still rolling to it: shown as open until it arrives. */
  arriving: string;
  popIds: string[];
  firstOrder: number;
  onPick: (id: string) => void;
  onLayoutY: (y: number, h: number) => void;
}) {
  const { palette: p, level: themedLevel } = useTheme();
  const c = levelColors[level.id];
  const rows = rowLayout(level.lessons.length, level.lessons.findIndex((r) => r.id === nextId));
  const points = level.lessons.map((_, i) => ({ x: puckX(width, i), y: puckY(rows.tops[i], rows.heights[i]) }));
  const stateOf = (id: string, ready: boolean): PuckState =>
    !ready ? 'soon' : status[id] === 'done' ? 'done' : id === nextId && id !== arriving ? 'current' : 'open';
  /** The level's object is earned once every built lesson in it is done; until then it is grey. */
  const built = level.lessons.filter((r) => r.ready);
  const earned = built.length > 0 && built.every((r) => status[r.id] === 'done');

  return (
    <View onLayout={(e) => onLayoutY(e.nativeEvent.layout.y, e.nativeEvent.layout.height)}>
      {li > 0 && (
        <View style={styles.divider}>
          <View style={[styles.rule, { backgroundColor: p.line }]} />
          <View style={styles.dividerText}>
            <Text style={[styles.dividerNo, { color: themedLevel(c).text }]}>LEVEL {li + 1}</Text>
            <Text style={[styles.dividerTitle, { color: p.ink }]}>{level.title}</Text>
          </View>
          <View style={[styles.rule, { backgroundColor: p.line }]} />
        </View>
      )}
      <View style={{ height: rows.total, marginTop: li === 0 ? 12 : 0 }}>
        {level.lessons.map((r, i) => (
          <View key={r.id} style={{ position: 'absolute', left: 0, right: 0, top: rows.tops[i], height: rows.heights[i] }} pointerEvents="box-none">
            <PuckRow
              r={r}
              levelId={level.id}
              color={c}
              state={stateOf(r.id, r.ready)}
              picked={picked === r.id}
              next={nextId === r.id && r.id !== arriving}
              pop={popIds.includes(r.id)}
              cx={points[i].x}
              cy={points[i].y - rows.tops[i]}
              labelLeft={labelX(width)}
              order={firstOrder + i}
              onPick={() => onPick(r.id)}
            />
          </View>
        ))}
        <View
          accessible
          accessibilityRole="image"
          accessibilityLabel={earned ? 'Level reward: earned' : 'Level reward: locked'}
          style={[styles.levelObject, { top: rows.objectTop }]}
        >
          <Art xml={object(levelObject[level.id], earned ? c : soonGrey, earned ? reward : soonReward)} width={LEVEL_OBJECT} />
        </View>
      </View>
    </View>
  );
}

/** Round button that scrolls back to the next lesson; points the way it will scroll. */
function BackButton({ side, bottom, onPress }: { side: 0 | 1 | -1; bottom: number; onPress: () => void }) {
  const { palette: p } = useTheme();
  const reduced = useReducedMotion();
  const shown = useSharedValue(0);
  const last = useRef<1 | -1>(-1);
  if (side !== 0) last.current = side;
  useEffect(() => {
    shown.set(side === 0 ? withTiming(0, { duration: 140 }) : reduced ? 1 : withTiming(1, { duration: 220, easing: Easing.out(Easing.cubic) }));
  }, [side, reduced, shown]);
  const style = useAnimatedStyle(() => ({ opacity: shown.get(), transform: [{ scale: 0.5 + 0.5 * shown.get() }] }));
  const up = last.current === -1;
  return (
    <Animated.View style={[styles.back, { bottom }, style]} pointerEvents={side === 0 ? 'none' : 'auto'}>
      <Pressable accessibilityRole="button" accessibilityLabel="Back to your next lesson" onPress={onPress} style={[styles.backLip, { backgroundColor: p.lineStrong }]}>
        {({ pressed }) => (
          <View style={[styles.backFace, { backgroundColor: p.page, borderColor: p.line, transform: [{ translateY: pressed ? 3 : 0 }] }]}>
            <Svg width={22} height={22} viewBox="0 0 22 22">
              <Path d={up ? 'M5 14l6-6 6 6' : 'M5 8l6 6 6-6'} stroke={p.ink} strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  column: { width: '100%', maxWidth: CONTENT_MAX + 40, alignSelf: 'center', paddingHorizontal: 20 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 10, paddingBottom: 12 },
  courses: { flexDirection: 'row', alignItems: 'center', gap: 2, minHeight: 44, paddingRight: 8 },
  coursesText: { fontFamily: font.displaySemi, fontSize: 16 },
  courseHead: { alignItems: 'center', paddingTop: 10, paddingBottom: 2 },
  courseTitle: { fontFamily: font.display, fontSize: 20, lineHeight: 26, letterSpacing: -0.1, textAlign: 'center' },
  courseSub: { fontFamily: font.bodyMedium, fontSize: 14, lineHeight: 19, textAlign: 'center' },
  count: { alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderBottomWidth: 4, borderRadius: 999, paddingHorizontal: 12, minHeight: 44 },
  countText: { fontFamily: font.displaySemi, fontSize: 16 },
  plateWrap: { paddingBottom: 10, zIndex: 2 },
  list: { width: '100%', maxWidth: CONTENT_MAX, alignSelf: 'center' },
  topFade: { position: 'absolute', top: 0, left: 0, right: 0, height: 6, opacity: 0.9 },
  divider: { height: 96, flexDirection: 'row', alignItems: 'center', gap: 12 },
  rule: { flex: 1, height: 2, borderRadius: 1 },
  dividerText: { alignItems: 'center' },
  dividerNo: { fontFamily: font.displaySemi, fontSize: 14, lineHeight: 18, letterSpacing: 0.3 },
  dividerTitle: { fontFamily: font.display, fontSize: 18, lineHeight: 24 },
  levelObject: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  back: { position: 'absolute', left: 20, width: 56, height: 60 },
  backLip: { width: 56, height: 60, borderRadius: 28, paddingBottom: 4 },
  backFace: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
