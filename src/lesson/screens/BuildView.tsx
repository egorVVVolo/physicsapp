// Build the solution: (optionally) pick the equation, then put the values into its boxes; the app does the arithmetic.
// Check marks each wrong box (it shakes, the first wrong chip's hint shows); Try again empties only the wrong boxes.
// Right: the result counts up under the equation, then the green sheet with Why?.
// Tries: two in the story, one in the Skill check, for the equation and for the boxes each; after the last miss of a stage
// its answer is put in (honest "revealed"). Right after any miss counts as "assisted".
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { BuildScreen } from '@/content/types';
import { Sheet } from '@/figures/Sheet';
import { fixed, sig } from '@/physics/format';
import { allFilled, checkBuild, emptyBox, emptyFilled, fillBox, firstHint, parseEquation, solvedFilled, type Filled } from '@/session/build';
import { outcomeOf, STORY_TRIES, type Outcome, type Phase } from '@/session/logic';
import { revealed } from '@/session/reveal';
import { shuffled } from '@/session/shuffle';
import { useTheme } from '@/theme/ThemeContext';
import { font, LIP, motion, radius, touch } from '@/theme/tokens';
import { feedback } from '@/ui/feedback';
import { useRightSound } from '../puzzle';
import { Shake, useReducedMotionPref } from '@/ui/motion';
import { MainButton, Mark, OptionCard, OptionList, VerdictSheet, type CardState, type Verdict } from '@/ui/parts';
import { Frame } from '../Frame';
import { Instruction, Prompt } from '../text';

type Props = {
  screen: BuildScreen;
  figN: number;
  phase: Phase;
  onOutcome: (o: Outcome) => void;
  /** Every wrong Check: the wrong equation, or each wrong chip. */
  onWrong: (id: string) => void;
  onNext: () => void;
};

type Status = 'answering' | 'retry' | 'right' | 'revealed';

/** The result as written: "600 J" (sig figs, a non-breaking space before the unit). */
export function resultText(r: BuildScreen['result']): string {
  return `${sig(r.value, r.sf ?? 3)} ${r.unit}`;
}

export function BuildView({ screen, figN, phase, onOutcome, onWrong, onNext }: Props) {
  const playRight = useRightSound(screen.id);
  const { palette: p } = useTheme();
  const reduced = useReducedMotionPref();
  const tries = phase === 'check' ? 1 : STORY_TRIES;
  const options = useMemo(() => (screen.choose ? shuffled(screen.choose.options, screen.id) : []), [screen]);
  const rightEq = screen.choose?.options.find((o) => o.correct);

  const [stage, setStage] = useState<'choose' | 'fill'>(screen.choose ? 'choose' : 'fill');
  const [eqMisses, setEqMisses] = useState(0); // wrong Checks of the equation
  const [boxMisses, setBoxMisses] = useState(0); // wrong Checks of the boxes
  const [decided, setDecided] = useState(false); // the outcome is recorded (it is the first one that counts)
  // choose stage
  const [pick, setPick] = useState<string | null>(null);
  const [wrongEqs, setWrongEqs] = useState<string[]>([]);
  const [eqStatus, setEqStatus] = useState<'answering' | 'retry' | 'revealed'>('answering');
  // fill stage
  const [filled, setFilled] = useState<Filled>(() => emptyFilled(screen));
  const [active, setActive] = useState<string | null>(null); // a box tapped first: the next chip goes there
  const [status, setStatus] = useState<Status>('answering');
  const [wrongBoxes, setWrongBoxes] = useState<string[]>([]);
  const locked = status === 'right' || status === 'revealed';

  // the result counts up from 0 once the boxes are right (or the solution is shown), then the sheet comes up
  const count = useCountUp(locked, reduced);

  const record = (n: number) => {
    if (decided) return;
    setDecided(true);
    onOutcome(outcomeOf(n, phase));
  };

  const checkEquation = () => {
    if (!pick || !rightEq) return;
    if (pick === rightEq.id) {
      feedback.right();
      setStage('fill');
      return;
    }
    feedback.wrong();
    onWrong(pick);
    const n = eqMisses + 1;
    setEqMisses(n);
    setWrongEqs([...wrongEqs, pick]);
    if (n >= tries) {
      record(n); // revealed: the right equation is put in, the boxes are still the learner's to fill
      setEqStatus('revealed');
    } else setEqStatus('retry');
  };

  const checkBoxes = () => {
    const res = checkBuild(screen, filled);
    if (res.ok) {
      playRight();
      record(Math.min(1, eqMisses + boxMisses)); // right after a miss: assisted
      setStatus('right');
      return;
    }
    feedback.wrong();
    res.wrongBoxes.forEach((b) => onWrong(filled[b]!));
    const n = boxMisses + 1;
    setBoxMisses(n);
    setWrongBoxes(res.wrongBoxes);
    if (!decided && n >= tries) {
      record(n);
      setFilled(solvedFilled(screen));
      setStatus('revealed');
    } else setStatus('retry');
  };

  const tapChip = (chipId: string) => {
    if (status !== 'answering') return;
    feedback.pick();
    setFilled(fillBox(filled, chipId, active));
    setActive(null);
  };
  const tapBox = (box: string) => {
    if (status !== 'answering') return;
    feedback.pick();
    if (filled[box] !== null) {
      setFilled(emptyBox(filled, box));
      setActive(box);
    } else setActive(active === box ? null : box);
  };

  // ── verdict ──
  let verdict: Verdict | null = null;
  let button = { label: 'Continue', onPress: onNext };
  const result = `${screen.result.symbol} = ${resultText(screen.result)}`;
  if (stage === 'choose' && eqStatus === 'retry') {
    verdict = { tone: 'bad', title: 'Not quite', text: screen.choose?.options.find((o) => o.id === pick)?.hint ?? 'Look again and try once more.' };
    button = {
      label: 'Try again',
      onPress: () => {
        setPick(null);
        setEqStatus('answering');
      },
    };
  } else if (stage === 'choose' && eqStatus === 'revealed') {
    verdict = { tone: 'bad', title: 'Not quite', text: `The equation is ${rightEq?.label}. Now put the values in.` };
    button = { label: 'Continue', onPress: () => setStage('fill') };
  } else if (status === 'retry') {
    verdict = { tone: 'bad', title: 'Not quite', text: firstHint(screen, filled) ?? 'Look at the marked boxes again.' };
    button = {
      label: 'Try again',
      onPress: () => {
        let f = filled;
        for (const b of wrongBoxes) f = emptyBox(f, b);
        setFilled(f);
        setWrongBoxes([]);
        setStatus('answering');
      },
    };
  } else if (count >= 1 && status === 'right') verdict = { tone: 'ok', title: 'Correct!', why: screen.why };
  else if (count >= 1 && status === 'revealed') verdict = { tone: 'bad', title: 'Not quite', text: `The answer is ${result}.`, why: screen.why };

  const eqState = (id: string): CardState => {
    if (eqStatus === 'revealed' && id === rightEq?.id) return 'right';
    if (wrongEqs.includes(id)) return id === pick && eqStatus !== 'answering' ? 'wrong' : 'dim';
    if (eqStatus === 'revealed') return 'dim';
    return pick === id ? 'selected' : 'idle';
  };

  const boxState = (b: string): BoxState => {
    if (locked) return status === 'revealed' && wrongBoxes.includes(b) ? 'shown' : 'right';
    if (wrongBoxes.includes(b)) return 'wrong';
    if (active === b) return 'active';
    return filled[b] === null ? 'empty' : 'filled';
  };
  const used = new Set(Object.values(filled).filter((c): c is string => c !== null));

  const footer =
    stage === 'choose' ? (
      <MainButton label="Check" onPress={checkEquation} disabled={!pick || eqStatus !== 'answering'} />
    ) : (
      <MainButton label="Check" onPress={checkBoxes} disabled={!allFilled(filled) || status !== 'answering'} />
    );

  return (
    <Frame
      fig={screen.fig && <Sheet fig={locked ? revealed(screen.fig) : screen.fig} n={figN} />}
      footer={footer}
      sheet={verdict ? <VerdictSheet verdict={verdict} button={button} /> : null}
    >
      <Prompt>{screen.prompt}</Prompt>
      {stage === 'choose' && screen.choose ? (
        <View style={styles.block}>
          <Text style={[styles.sub, { color: p.ink }]}>{screen.choose.prompt}</Text>
          <OptionList>
            {options.map((o) => (
              <OptionCard
                key={o.id}
                label={o.label}
                state={eqState(o.id)}
                disabled={eqStatus !== 'answering' || wrongEqs.includes(o.id)}
                onPress={() => {
                  feedback.pick();
                  setPick(o.id);
                }}
              />
            ))}
          </OptionList>
        </View>
      ) : null}
      {stage === 'fill' ? <Instruction>Tap a value to put it in the next empty box. Tap a box to empty it.</Instruction> : null}
      {stage === 'fill' ? (
        <EquationBoard build={screen} filled={filled} boxState={boxState} disabled={status !== 'answering'} onTapBox={tapBox} count={locked ? count : null} />
      ) : null}
      {stage === 'fill' ? <ChipRow chips={screen.chips} used={used} dim={locked} disabled={status !== 'answering'} onTap={tapChip} /> : null}
    </Frame>
  );
}

/** Counts from 0 to 1 over `motion.celebrate` once `on` (eased out); at once with reduced motion. */
export function useCountUp(on: boolean, reduced: boolean): number {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!on) return setCount(0);
    if (reduced) return setCount(1);
    const start = Date.now();
    const id = setInterval(() => {
      const k = Math.min(1, (Date.now() - start) / motion.celebrate);
      setCount(1 - (1 - k) ** 3);
      if (k >= 1) clearInterval(id);
    }, 30);
    return () => clearInterval(id);
  }, [on, reduced]);
  return count;
}

type BuildParts = Pick<BuildScreen, 'equation' | 'chips' | 'result'>;

/**
 * The equation on drawing paper with its boxes, and once `count` is given, the result counting up under it.
 * The fill stage of a build step, and the body of a build part of an exam-style card.
 */
export function EquationBoard({ build, filled, boxState, disabled, onTapBox, count }: { build: BuildParts; filled: Filled; boxState: (box: string) => BoxState; disabled: boolean; onTapBox: (box: string) => void; count: number | null }) {
  const { palette: p } = useTheme();
  const pieces = useMemo(() => parseEquation(build.equation), [build.equation]);
  const label = (chipId: string | null) => build.chips.find((c) => c.id === chipId)?.label ?? null;
  const r = build.result;
  const dp = (sig(r.value, r.sf ?? 3).split('.')[1] ?? '').length;
  const result = `${r.symbol} = ${resultText(r)}`;
  return (
    <View style={[styles.sheet, { backgroundColor: p.paper, borderColor: p.paperLine }]}>
      <View style={styles.equation}>
        {lineItems(pieces).map((item, i) => {
          const box = item.box;
          return (
            <View key={i} style={styles.glue}>
              {item.text !== undefined && <Text style={[styles.eqText, { color: p.ink }]}>{item.text}</Text>}
              {box !== undefined && <Box name={box} label={label(filled[box])} state={boxState(box)} disabled={disabled} onPress={() => onTapBox(box)} />}
              {item.after !== undefined && <Text style={[styles.eqText, { color: p.ink }]}>{item.after}</Text>}
            </View>
          );
        })}
      </View>
      {count !== null && (
        <Text style={[styles.result, { color: p.ink }]} accessibilityLabel={result} accessibilityLiveRegion="polite">
          {`${r.symbol} = ${count >= 1 ? sig(r.value, r.sf ?? 3) : fixed(r.value * count, dp)} ${r.unit}`}
        </Text>
      )}
    </View>
  );
}

/** The values to place, in a wrapping row. */
export function ChipRow({ chips, used, dim, disabled, onTap }: { chips: BuildScreen['chips']; used: Set<string>; dim: boolean; disabled: boolean; onTap: (chipId: string) => void }) {
  return (
    <View style={styles.chips} accessibilityLabel="Values">
      {chips.map((c) => (
        <ChipCard key={c.id} label={c.label} used={used.has(c.id)} dim={dim} disabled={disabled || used.has(c.id)} onPress={() => onTap(c.id)} />
      ))}
    </View>
  );
}

/**
 * What wraps as one unit on the equation's line: a word of text, or a box with what is written right against it: a bracket
 * or a function name before it ("cos", "√(", "(") and a power or bracket after it ("²)"). Those never part at a line end.
 */
type LineItem = { text?: string; box?: string; after?: string };
function lineItems(pieces: ReturnType<typeof parseEquation>): LineItem[] {
  const items: LineItem[] = [];
  let open = false; // the last item is a word with nothing after it, written right against the box that comes next
  for (const piece of pieces) {
    if ('text' in piece) {
      const startsSpace = /^\s/.test(piece.text);
      const endsSpace = /\s$/.test(piece.text);
      const words = piece.text.split(/\s+/).filter(Boolean);
      words.forEach((word, j) => {
        const prev = items[items.length - 1];
        if (j === 0 && !startsSpace && prev && prev.box !== undefined) prev.after = (prev.after ?? '') + word;
        else items.push({ text: word });
      });
      open = words.length > 0 && !endsSpace;
      continue;
    }
    const last = items[items.length - 1];
    const glued = last && last.box === undefined && last.text !== undefined && (open || /^(sin|cos|tan|√|ln|log)$/.test(last.text));
    if (glued) last.box = piece.box;
    else items.push({ box: piece.box });
    open = false;
  }
  return items;
}

export type BoxState = 'empty' | 'active' | 'filled' | 'wrong' | 'right' | 'shown';

/** One box of the equation: dashed while empty, blue when chosen, red and shaking after a wrong Check. */
function Box({ name, label, state, disabled, onPress }: { name: string; label: string | null; state: BoxState; disabled: boolean; onPress: () => void }) {
  const { palette: p } = useTheme();
  const border = state === 'active' ? p.select : state === 'wrong' ? p.bad : state === 'right' ? p.ok : state === 'shown' ? p.ok : state === 'filled' ? p.lineStrong : p.lineStrong;
  const bg = state === 'active' ? p.selectBg : state === 'wrong' ? p.badBg : state === 'right' || state === 'shown' ? p.okBg : p.page;
  const color = state === 'wrong' ? p.badText : state === 'right' || state === 'shown' ? p.okText : p.ink;
  const said = state === 'wrong' ? ', incorrect' : state === 'right' ? ', correct' : state === 'shown' ? ', the right value' : '';
  return (
    <Shake trigger={state === 'wrong'}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${name}: ${label ?? 'empty'}${said}`}
        accessibilityState={{ selected: state === 'active', disabled }}
        disabled={disabled}
        onPress={onPress}
        hitSlop={4}
        style={[styles.box, { borderColor: border, backgroundColor: bg, borderStyle: label === null && state !== 'active' ? 'dashed' : 'solid' }]}
      >
        <Text style={[styles.boxText, { color: label ? color : p.faint }]}>{label ?? name}</Text>
      </Pressable>
      {(state === 'wrong' || state === 'right') && (
        <View style={styles.boxMark} pointerEvents="none">
          <Mark kind={state === 'right' ? 'ok' : 'bad'} color={state === 'right' ? p.ok : p.bad} size={14} />
        </View>
      )}
    </Shake>
  );
}

/** A value to place. Once placed it leaves a dashed gap, so the row does not jump. */
function ChipCard({ label, used, dim, disabled, onPress }: { label: string; used: boolean; dim: boolean; disabled: boolean; onPress: () => void }) {
  const { palette: p } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={used ? `${label}, placed` : label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        used ? { borderColor: p.line, borderStyle: 'dashed', backgroundColor: p.page } : { borderColor: p.line, backgroundColor: pressed ? p.selectBg : p.page, borderBottomWidth: 2 + LIP },
      ]}
    >
      <Text style={[styles.chipText, { color: used || dim ? p.faint : p.ink, opacity: used ? 0.5 : 1 }]} maxFontSizeMultiplier={1.3}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  block: { gap: 12 },
  sub: { fontFamily: font.displaySemi, fontSize: 17, lineHeight: 23 },
  sheet: { borderWidth: 1, borderRadius: radius.m, paddingHorizontal: 14, paddingVertical: 18, gap: 14 },
  equation: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 8 },
  eqText: { fontFamily: font.display, fontSize: 24, lineHeight: 32 },
  glue: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  box: { minWidth: touch, minHeight: touch, borderWidth: 2, borderRadius: radius.s, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center' },
  boxText: { fontFamily: font.display, fontSize: 20 },
  boxMark: { position: 'absolute', top: -7, right: -7 },
  result: { fontFamily: font.display, fontSize: 28, lineHeight: 34, textAlign: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  chip: { minHeight: touch + 6, minWidth: 64, borderWidth: 2, borderRadius: radius.m, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  chipText: { fontFamily: font.bodyMedium, fontSize: 17 },
});
