// Exam-style card: an "EXAM-STYLE" label, the context, the figure, then the parts one under another, each with its
// letter, its command word in bold and its marks on the right. Only the current part is open; answered parts fold
// into one line with their marks ("2/2"). Every part has one try. A wrong answer shows the right one and scores
// 0 (a build part keeps a mark for each right box), then the next part opens. Each part is its own question.
import { useMemo, useState, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { BuildScreen, ExamCardScreen, ExamPart } from '@/content/types';
import { Sheet } from '@/figures/Sheet';
import { allFilled, checkBuild, emptyBox, fillBox, solvedFilled, type Filled } from '@/session/build';
import type { Outcome } from '@/session/logic';
import { firstWrongRow } from '@/session/order';
import { revealed } from '@/session/reveal';
import { shuffled } from '@/session/shuffle';
import { useTheme } from '@/theme/ThemeContext';
import { font, motion, radius } from '@/theme/tokens';
import { feedback } from '@/ui/feedback';
import { useReducedMotionPref } from '@/ui/motion';
import { MainButton, Mark, OptionCard, OptionList, VerdictSheet, type CardState, type Verdict } from '@/ui/parts';
import { Frame } from '../Frame';
import { Instruction } from '../text';
import { ChipRow, EquationBoard, useCountUp, type BoxState } from './BuildView';
import { Row, StatementCard, type RowState } from './OrderView';

type Props = {
  screen: ExamCardScreen;
  figN: number;
  /** A part is answered: its outcome and its marks [got, of]. */
  onPart: (partId: string, o: Outcome, marks: [number, number]) => void;
  onWrong: (partId: string, id: string) => void;
  onNext: () => void;
};

/** What a checked part scored, and what went wrong (for showing the right answer). */
type Checked = { got: number; ok: boolean; wrongBoxes: string[]; wrongFrom: number };

const LETTERS = 'abcdef';

/** A build part as a build step, for the pure build functions. */
const asBuild = (part: Extract<ExamPart, { kind: 'build' }>): BuildScreen => ({ ...part.build, id: part.id, kind: 'build', prompt: part.text, why: part.why });

/** Marks for a build part: one lost for each wrong box, never below zero. */
export const buildMarks = (marks: number, wrongBoxes: number) => Math.max(0, marks - wrongBoxes);

export function ExamCardView({ screen, figN, onPart, onWrong, onNext }: Props) {
  const { palette: p } = useTheme();
  const reduced = useReducedMotionPref();
  const [at, setAt] = useState(0);
  const [scores, setScores] = useState<number[]>([]); // marks got in each answered part
  const part = screen.parts[at];
  const last = at === screen.parts.length - 1;

  // the open part's answer (reset when the next part opens)
  const [pick, setPick] = useState<string | null>(null);
  const [filled, setFilled] = useState<Filled>(() => emptyOf(part));
  const [active, setActive] = useState<string | null>(null);
  const [rows, setRows] = useState<(string | null)[]>(() => (part.kind === 'order' ? part.steps.map(() => null) : []));
  const [checked, setChecked] = useState<Checked | null>(null);
  const count = useCountUp(part.kind === 'build' && checked !== null, reduced);

  const options = useMemo(() => (part.kind === 'choice' ? shuffled(part.options, `${screen.id}.${part.id}`) : []), [part, screen.id]);
  const pool = useMemo(() => (part.kind === 'order' ? shuffled(part.steps, `${screen.id}.${part.id}`) : []), [part, screen.id]);

  const ready = part.kind === 'choice' ? pick !== null : part.kind === 'build' ? allFilled(filled) : !rows.includes(null);

  const check = () => {
    const key = part.id;
    let c: Checked;
    if (part.kind === 'choice') {
      const ok = part.options.find((o) => o.id === pick)?.correct === true;
      if (!ok && pick) onWrong(key, pick);
      c = { got: ok ? part.marks : 0, ok, wrongBoxes: [], wrongFrom: -1 };
    } else if (part.kind === 'build') {
      const b = asBuild(part);
      const res = checkBuild(b, filled);
      res.wrongBoxes.forEach((box) => onWrong(key, filled[box]!));
      if (!res.ok) setFilled(solvedFilled(b));
      c = { got: buildMarks(part.marks, res.wrongBoxes.length), ok: res.ok, wrongBoxes: res.wrongBoxes, wrongFrom: -1 };
    } else {
      const k = firstWrongRow({ id: key, kind: 'order', prompt: '', steps: part.steps, hint: '', why: '' }, rows);
      if (k >= 0) onWrong(key, rows[k]!);
      c = { got: k < 0 ? part.marks : 0, ok: k < 0, wrongBoxes: [], wrongFrom: k };
    }
    if (c.ok) feedback.right();
    else feedback.wrong();
    onPart(key, c.ok ? 'independent' : 'revealed', [c.got, part.marks]);
    setChecked(c);
  };

  const nextPart = () => {
    const nextAt = at + 1;
    const np = screen.parts[nextAt];
    setScores([...scores, checked?.got ?? 0]);
    setAt(nextAt);
    setPick(null);
    setFilled(emptyOf(np));
    setActive(null);
    setRows(np.kind === 'order' ? np.steps.map(() => null) : []);
    setChecked(null);
  };

  // the build part's result counts up before its sheet comes up
  const settled = checked !== null && (part.kind !== 'build' || count >= 1);
  let verdict: Verdict | null = null;
  if (settled && checked) {
    const marks = `${checked.got}/${part.marks} ${part.marks === 1 ? 'mark' : 'marks'}.`;
    const answer = part.kind === 'choice' && !checked.ok ? ` The answer is: ${part.options.find((o) => o.correct)?.label}.` : '';
    verdict = { tone: checked.ok ? 'ok' : 'bad', title: checked.ok ? 'Correct!' : 'Not quite', text: marks + answer, why: part.why };
  }

  // ── the open part's body ──
  let body: ReactNode = null;
  if (part.kind === 'choice') {
    const right = part.options.find((o) => o.correct)?.id;
    const stateOf = (id: string): CardState => (checked ? (id === right ? 'right' : id === pick ? 'wrong' : 'dim') : pick === id ? 'selected' : 'idle');
    body = (
      <OptionList>
        {options.map((o) => (
          <OptionCard
            key={o.id}
            label={o.label}
            state={stateOf(o.id)}
            disabled={checked !== null}
            onPress={() => {
              feedback.pick();
              setPick(o.id);
            }}
          />
        ))}
      </OptionList>
    );
  } else if (part.kind === 'build') {
    const boxState = (b: string): BoxState => {
      if (checked) return checked.wrongBoxes.includes(b) ? 'shown' : 'right';
      if (active === b) return 'active';
      return filled[b] === null ? 'empty' : 'filled';
    };
    const used = new Set(Object.values(filled).filter((x): x is string => x !== null));
    body = (
      <View style={styles.body}>
        <EquationBoard
          build={part.build}
          filled={filled}
          boxState={boxState}
          disabled={checked !== null}
          onTapBox={(b) => {
            feedback.pick();
            if (filled[b] !== null) {
              setFilled(emptyBox(filled, b));
              setActive(b);
            } else setActive(active === b ? null : b);
          }}
          count={checked ? count : null}
        />
        <ChipRow
          chips={part.build.chips}
          used={used}
          dim={checked !== null}
          disabled={checked !== null}
          onTap={(chip) => {
            feedback.pick();
            setFilled(fillBox(filled, chip, active));
            setActive(null);
          }}
        />
      </View>
    );
  } else {
    const shownRows = checked && !checked.ok ? part.steps.map((s) => s.id) : rows;
    const rowState = (i: number): RowState => (checked ? (checked.ok || i < checked.wrongFrom ? 'right' : 'shown') : rows[i] === null ? 'empty' : 'filled');
    const placed = new Set(rows.filter((r): r is string => r !== null));
    const text = (id: string | null) => part.steps.find((s) => s.id === id)?.text ?? '';
    body = (
      <View style={styles.body}>
        {shownRows.map((id, i) => (
          <Row
            key={i}
            n={i + 1}
            text={id ? text(id) : null}
            itemKey={id ?? ''}
            state={rowState(i)}
            greenDelay={reduced ? 0 : i * motion.stagger}
            disabled={checked !== null}
            onPress={() => {
              feedback.pick();
              setRows(rows.map((r, j) => (j === i ? null : r)));
            }}
          />
        ))}
        {!checked &&
          pool
            .filter((s) => !placed.has(s.id))
            .map((s) => (
              <StatementCard
                key={s.id}
                text={s.text}
                disabled={false}
                onPress={() => {
                  const k = rows.indexOf(null);
                  if (k < 0) return;
                  feedback.pick();
                  setRows(rows.map((r, j) => (j === k ? s.id : r)));
                }}
              />
            ))}
      </View>
    );
  }

  const instruction = part.kind === 'choice' ? 'Tap an answer, then Check. One try.' : part.kind === 'build' ? 'Tap a value to put it in the next empty box. One try.' : 'Tap the statements in order. One try.';
  const total = screen.parts.reduce((n, x) => n + x.marks, 0);

  return (
    <Frame
      fig={screen.fig && <Sheet fig={checked && last ? revealed(screen.fig) : screen.fig} n={figN} />}
      footer={<MainButton label="Check" onPress={check} disabled={!ready || checked !== null} />}
      sheet={verdict ? <VerdictSheet verdict={verdict} button={last ? { label: 'Continue', onPress: onNext } : { label: 'Next part', onPress: nextPart }} /> : null}
      follow={at}
    >
      <View style={styles.head}>
        <Text style={[styles.tag, { color: p.muted, borderColor: p.lineStrong }]}>EXAM-STYLE</Text>
        <Text style={[styles.total, { color: p.faint }]}>{`${total} marks`}</Text>
      </View>
      <Text style={[styles.context, { color: p.ink }]} maxFontSizeMultiplier={1.3}>
        {screen.context}
      </Text>
      {screen.parts.slice(0, at).map((x, i) => (
        <FoldedPart key={x.id} letter={LETTERS[i]} part={x} got={scores[i]} />
      ))}
      <View style={styles.open}>
        <PartHead letter={LETTERS[at]} part={part} />
        <Instruction>{instruction}</Instruction>
        {body}
      </View>
    </Frame>
  );
}

function emptyOf(part: ExamPart): Filled {
  return part.kind === 'build' ? Object.fromEntries(Object.keys(part.build.boxes).map((b) => [b, null])) : {};
}

/** "(b) Calculate the work done by the pull.   [2]" */
function PartHead({ letter, part }: { letter: string; part: ExamPart }) {
  const { palette: p } = useTheme();
  return (
    <View style={styles.partHead} accessible accessibilityLabel={`Part ${letter}. ${part.command} ${part.text} ${part.marks} ${part.marks === 1 ? 'mark' : 'marks'}.`}>
      <Text style={[styles.partText, { color: p.ink }]} maxFontSizeMultiplier={1.3}>
        <Text style={styles.bold}>{`(${letter}) `}</Text>
        <Text style={styles.bold}>{part.command}</Text>
        {` ${part.text}`}
      </Text>
      <Text style={[styles.marks, { color: p.muted }]}>{`[${part.marks}]`}</Text>
    </View>
  );
}

/** An answered part, folded into one line with what it scored. */
function FoldedPart({ letter, part, got }: { letter: string; part: ExamPart; got: number }) {
  const { palette: p } = useTheme();
  const full = got === part.marks;
  return (
    <View style={[styles.folded, { borderColor: p.line }]} accessible accessibilityLabel={`Part ${letter}: ${got} of ${part.marks} marks.`}>
      <Text style={[styles.foldedText, { color: p.muted }]} numberOfLines={1}>
        <Text style={styles.bold}>{`(${letter}) ${part.command}`}</Text>
        {` ${part.text}`}
      </Text>
      <Mark kind={full ? 'ok' : 'bad'} color={full ? p.ok : p.bad} size={14} />
      <Text style={[styles.score, { color: full ? p.okText : p.badText }]}>{`${got}/${part.marks}`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tag: { fontFamily: font.mono, fontSize: 12, letterSpacing: 1.4, borderWidth: 1, borderRadius: radius.s, paddingHorizontal: 8, paddingVertical: 3 },
  total: { fontFamily: font.mono, fontSize: 12 },
  context: { fontFamily: font.body, fontSize: 16, lineHeight: 24 },
  open: { gap: 12 },
  body: { gap: 10 },
  partHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  partText: { flex: 1, fontFamily: font.body, fontSize: 17, lineHeight: 25 },
  bold: { fontFamily: font.bodyBold },
  marks: { fontFamily: font.mono, fontSize: 14, paddingTop: 3 },
  folded: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44, borderTopWidth: 1, borderBottomWidth: 1, paddingVertical: 8 },
  foldedText: { flex: 1, fontFamily: font.body, fontSize: 15 },
  score: { fontFamily: font.monoBold, fontSize: 14 },
});
