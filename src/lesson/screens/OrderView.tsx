// Order: tap the statements into numbered rows, in the right sequence. Tapping a filled row sends its statement back.
// Check: the first wrong row and every row after it turn red and shake, with the hint; Try again sends only those back.
// Right: the rows turn green one by one from the top, then the sheet. Tries: two in the story, one in the Skill check.
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { OrderScreen } from '@/content/types';
import { Sheet } from '@/figures/Sheet';
import { outcomeOf, STORY_TRIES, type Outcome, type Phase } from '@/session/logic';
import { firstWrongRow } from '@/session/order';
import { revealed } from '@/session/reveal';
import { shuffled } from '@/session/shuffle';
import { useTheme } from '@/theme/ThemeContext';
import { font, LIP, motion, radius, touch } from '@/theme/tokens';
import { feedback } from '@/ui/feedback';
import { Rise, Shake, useReducedMotionPref } from '@/ui/motion';
import { MainButton, Mark, VerdictSheet, type Verdict } from '@/ui/parts';
import { Frame } from '../Frame';
import { Instruction, Prompt } from '../text';

type Props = { screen: OrderScreen; figN: number; phase: Phase; onOutcome: (o: Outcome) => void; onWrong: (id: string) => void; onNext: () => void };
type Status = 'answering' | 'retry' | 'right' | 'revealed';

export function OrderView({ screen, figN, phase, onOutcome, onWrong, onNext }: Props) {
  const reduced = useReducedMotionPref();
  const tries = phase === 'check' ? 1 : STORY_TRIES;
  const pool = useMemo(() => shuffled(screen.steps, screen.id), [screen]);
  const n = screen.steps.length;
  const [rows, setRows] = useState<(string | null)[]>(() => screen.steps.map(() => null));
  const [status, setStatus] = useState<Status>('answering');
  const [misses, setMisses] = useState(0);
  const [wrongFrom, setWrongFrom] = useState(-1);
  const locked = status === 'right' || status === 'revealed';
  // after the rows have turned green one by one, the sheet comes up
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    if (!locked) return;
    const id = setTimeout(() => setSettled(true), reduced ? 0 : n * motion.stagger + motion.base);
    return () => clearTimeout(id);
  }, [locked, reduced, n]);

  const text = (id: string | null) => screen.steps.find((s) => s.id === id)?.text ?? '';
  const placed = new Set(rows.filter((r): r is string => r !== null));

  const tapCard = (id: string) => {
    if (status !== 'answering') return;
    const at = rows.indexOf(null);
    if (at < 0) return;
    feedback.pick();
    setRows(rows.map((r, i) => (i === at ? id : r)));
  };
  const tapRow = (i: number) => {
    if (status !== 'answering' || rows[i] === null) return;
    feedback.pick();
    setRows(rows.map((r, j) => (j === i ? null : r)));
  };

  const check = () => {
    const k = firstWrongRow(screen, rows);
    if (k < 0) {
      feedback.right();
      onOutcome(outcomeOf(misses, phase));
      setStatus('right');
      return;
    }
    feedback.wrong();
    onWrong(rows[k]!);
    const m = misses + 1;
    setMisses(m);
    setWrongFrom(k);
    if (m >= tries) {
      onOutcome(outcomeOf(m, phase));
      setStatus('revealed');
    } else setStatus('retry');
  };

  let verdict: Verdict | null = null;
  let button = { label: 'Continue', onPress: onNext };
  if (status === 'retry') {
    verdict = { tone: 'bad', title: 'Not quite', text: screen.hint };
    button = {
      label: 'Try again',
      onPress: () => {
        setRows(rows.map((r, i) => (i >= wrongFrom ? null : r)));
        setWrongFrom(-1);
        setStatus('answering');
      },
    };
  } else if (settled && status === 'right') verdict = { tone: 'ok', title: 'Correct!', why: screen.why };
  else if (settled && status === 'revealed') verdict = { tone: 'bad', title: 'Not quite', text: 'Here is the right order.', why: screen.why };

  // once revealed, the rows show the right order
  const shownRows = status === 'revealed' && settled ? screen.steps.map((s) => s.id) : rows;
  const rowState = (i: number): RowState => {
    if (status === 'right') return 'right';
    if (status === 'revealed') return settled ? (i >= wrongFrom ? 'shown' : 'right') : i >= wrongFrom ? 'wrong' : 'filled';
    if (status === 'retry' && wrongFrom >= 0 && i >= wrongFrom) return 'wrong';
    return rows[i] === null ? 'empty' : 'filled';
  };

  return (
    <Frame
      fig={screen.fig && <Sheet fig={locked ? revealed(screen.fig) : screen.fig} n={figN} />}
      footer={<MainButton label="Check" onPress={check} disabled={rows.includes(null) || status !== 'answering'} />}
      sheet={verdict ? <VerdictSheet verdict={verdict} button={button} /> : null}
    >
      <Prompt>{screen.prompt}</Prompt>
      <Instruction>Tap the statements in order. Tap a row to send it back.</Instruction>
      <View style={styles.rows}>
        {shownRows.map((id, i) => (
          <Row key={i} n={i + 1} text={id ? text(id) : null} itemKey={id ?? ''} state={rowState(i)} greenDelay={reduced ? 0 : i * motion.stagger} disabled={status !== 'answering'} onPress={() => tapRow(i)} />
        ))}
      </View>
      {!locked && (
        <View style={styles.pool}>
          {pool
            .filter((s) => !placed.has(s.id))
            .map((s) => (
              <StatementCard key={s.id} text={s.text} disabled={status !== 'answering'} onPress={() => tapCard(s.id)} />
            ))}
        </View>
      )}
    </Frame>
  );
}

export type RowState = 'empty' | 'filled' | 'wrong' | 'right' | 'shown';

/** A numbered row: dashed while empty; red and shaking when wrong; green, one row after another, when right. */
export function Row({ n, text, itemKey, state, greenDelay, disabled, onPress }: { n: number; text: string | null; itemKey: string; state: RowState; greenDelay: number; disabled: boolean; onPress: () => void }) {
  const { palette: p } = useTheme();
  // green comes a little later for each row down the list
  const [green, setGreen] = useState(false);
  useEffect(() => {
    if (state !== 'right' && state !== 'shown') return setGreen(false);
    const id = setTimeout(() => setGreen(true), greenDelay);
    return () => clearTimeout(id);
  }, [state, greenDelay]);
  const ok = green && (state === 'right' || state === 'shown');
  const bad = state === 'wrong';
  const border = ok ? p.ok : bad ? p.bad : state === 'empty' ? p.lineStrong : p.line;
  const bg = ok ? p.okBg : bad ? p.badBg : p.page;
  const color = ok ? p.okText : bad ? p.badText : p.ink;
  const said = bad ? ', incorrect' : ok ? ', correct' : '';
  return (
    <View style={styles.rowWrap}>
      <Text style={[styles.num, { color: p.faint }]}>{n}</Text>
      <Shake trigger={bad} style={{ flex: 1 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Row ${n}: ${text ?? 'empty'}${said}`}
          disabled={disabled || text === null}
          onPress={onPress}
          style={[styles.row, { borderColor: border, backgroundColor: bg, borderStyle: state === 'empty' ? 'dashed' : 'solid' }]}
        >
          {text !== null && (
            <Rise key={itemKey}>
              <Text style={[styles.rowText, { color }]} maxFontSizeMultiplier={1.3}>
                {text}
              </Text>
            </Rise>
          )}
        </Pressable>
        {(bad || (ok && state === 'right')) && (
          <View style={styles.mark} pointerEvents="none">
            <Mark kind={ok ? 'ok' : 'bad'} color={ok ? p.ok : p.bad} size={14} />
          </View>
        )}
      </Shake>
    </View>
  );
}

/** A statement waiting to be put in a row. */
export function StatementCard({ text, disabled, onPress }: { text: string; disabled: boolean; onPress: () => void }) {
  const { palette: p } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={text}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.card, { borderColor: p.line, backgroundColor: pressed ? p.selectBg : p.page, borderBottomWidth: 2 + LIP }]}
    >
      <Text style={[styles.cardText, { color: p.ink }]} maxFontSizeMultiplier={1.3}>
        {text}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  rows: { gap: 10 },
  rowWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  num: { fontFamily: font.mono, fontSize: 14, width: 16, textAlign: 'right' },
  row: { minHeight: touch + 8, borderWidth: 2, borderRadius: radius.m, paddingHorizontal: 14, paddingVertical: 10, justifyContent: 'center' },
  rowText: { fontFamily: font.bodyMedium, fontSize: 16, lineHeight: 22 },
  mark: { position: 'absolute', top: -7, right: -7 },
  pool: { gap: 10, marginTop: 6 },
  card: { minHeight: touch + 8, borderWidth: 2, borderRadius: radius.m, paddingHorizontal: 14, paddingVertical: 10, justifyContent: 'center' },
  cardText: { fontFamily: font.bodyMedium, fontSize: 16, lineHeight: 22 },
});
