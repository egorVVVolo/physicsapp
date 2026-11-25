// Sort: tap an item (it turns blue), then the bin it belongs in. Tapping an item in a bin sends it back down.
// Check when every item is placed. Wrong: the wrong items turn red and shake, with the hint of the first one;
// Try again sends only those back. Right: the bins get their ticks one after another, then the sheet.
// Tries: two in the story, one in the Skill check; after the last miss the items move to their right bins.
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { SortScreen } from '@/content/types';
import { Sheet } from '@/figures/Sheet';
import { outcomeOf, STORY_TRIES, type Outcome, type Phase } from '@/session/logic';
import { revealed } from '@/session/reveal';
import { shuffled } from '@/session/shuffle';
import { solvedPlaced, wrongItems, type Placed } from '@/session/sort';
import { useTheme } from '@/theme/ThemeContext';
import { font, LIP, motion, radius, touch } from '@/theme/tokens';
import { feedback } from '@/ui/feedback';
import { useRightSound } from '../puzzle';
import { Pop, Rise, Shake, useReducedMotionPref } from '@/ui/motion';
import { MainButton, Mark, VerdictSheet, type Verdict } from '@/ui/parts';
import { Frame } from '../Frame';
import { Instruction, Prompt } from '../text';

type Props = { screen: SortScreen; figN: number; phase: Phase; onOutcome: (o: Outcome) => void; onWrong: (id: string) => void; onNext: () => void };
type Status = 'answering' | 'retry' | 'right' | 'revealed';
type ItemState = 'placed' | 'wrong' | 'right' | 'shown';

/** How long the red, shaking items stay before the answer is shown (ms). */
const SHOW_WRONG = 700;

export function SortView({ screen, figN, phase, onOutcome, onWrong, onNext }: Props) {
  const playRight = useRightSound(screen.id);
  const { palette: p } = useTheme();
  const reduced = useReducedMotionPref();
  const tries = phase === 'check' ? 1 : STORY_TRIES;
  const pool = useMemo(() => shuffled(screen.items, screen.id), [screen]);
  const [placed, setPlaced] = useState<Placed>(() => Object.fromEntries(screen.items.map((it) => [it.id, null])));
  const [sel, setSel] = useState<string | null>(null);
  const [order, setOrder] = useState<string[]>([]); // items in the order they were put in: a new one goes to the bottom of its bin
  const [status, setStatus] = useState<Status>('answering');
  const [misses, setMisses] = useState(0);
  const [wrong, setWrong] = useState<string[]>([]);
  const locked = status === 'right' || status === 'revealed';
  const nBins = screen.bins.length;

  // right: the bins tick one after another, then the sheet; revealed: the red items move to their bins, then the sheet
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    if (!locked) return;
    const wait = reduced ? 0 : status === 'right' ? nBins * motion.base + motion.base : SHOW_WRONG;
    const id = setTimeout(() => setSettled(true), wait);
    return () => clearTimeout(id);
  }, [locked, reduced, status, nBins]);

  const allPlaced = screen.items.every((it) => placed[it.id] !== null);

  const tapPoolItem = (id: string) => {
    if (status !== 'answering') return;
    feedback.pick();
    setSel(sel === id ? null : id);
  };
  const tapBin = (bin: string) => {
    if (status !== 'answering' || !sel) return;
    feedback.pick();
    setPlaced({ ...placed, [sel]: bin });
    setOrder([...order.filter((x) => x !== sel), sel]);
    setSel(null);
  };
  const tapPlaced = (id: string) => {
    if (status !== 'answering') return;
    feedback.pick();
    setPlaced({ ...placed, [id]: null });
  };

  const check = () => {
    const w = wrongItems(screen, placed);
    if (w.length === 0) {
      playRight();
      onOutcome(outcomeOf(misses, phase));
      setStatus('right');
      return;
    }
    feedback.wrong();
    w.forEach(onWrong);
    const m = misses + 1;
    setMisses(m);
    setWrong(w);
    if (m >= tries) {
      onOutcome(outcomeOf(m, phase));
      setStatus('revealed');
    } else setStatus('retry');
  };

  const firstWrong = screen.items.find((it) => it.id === wrong[0]);
  let verdict: Verdict | null = null;
  let button = { label: 'Continue', onPress: onNext };
  if (status === 'retry') {
    verdict = { tone: 'bad', title: 'Not quite', text: firstWrong?.hint ?? `${wrong.length === 1 ? 'One item is' : `${wrong.length} items are`} in the wrong place.` };
    button = {
      label: 'Try again',
      onPress: () => {
        setPlaced(Object.fromEntries(screen.items.map((it) => [it.id, wrong.includes(it.id) ? null : placed[it.id]])));
        setWrong([]);
        setStatus('answering');
      },
    };
  } else if (settled && status === 'right') verdict = { tone: 'ok', title: 'Correct!', why: screen.why };
  else if (settled && status === 'revealed') verdict = { tone: 'bad', title: 'Not quite', text: 'Here is where each one goes.', why: screen.why };

  // once revealed and settled, every item sits in its right bin
  const shown = status === 'revealed' && settled ? solvedPlaced(screen) : placed;
  const stateOf = (id: string): ItemState => {
    if (status === 'right') return 'right';
    if (status === 'revealed') return settled ? (wrong.includes(id) ? 'shown' : 'right') : wrong.includes(id) ? 'wrong' : 'placed';
    if (status === 'retry' && wrong.includes(id)) return 'wrong';
    return 'placed';
  };

  return (
    <Frame
      fig={screen.fig && <Sheet fig={locked ? revealed(screen.fig) : screen.fig} n={figN} />}
      footer={<MainButton label="Check" onPress={check} disabled={!allPlaced || status !== 'answering'} />}
      sheet={verdict ? <VerdictSheet verdict={verdict} button={button} /> : null}
    >
      <Prompt>{screen.prompt}</Prompt>
      <Instruction>Tap an item, then the box it belongs in.</Instruction>
      <View style={styles.bins}>
        {screen.bins.map((bin, b) => (
          <Bin
            key={bin.id}
            label={bin.label}
            target={sel !== null && status === 'answering'}
            tick={status === 'right'}
            tickDelay={reduced ? 0 : (b + 1) * motion.base}
            disabled={status !== 'answering' || sel === null}
            onPress={() => tapBin(bin.id)}
          >
            {pool
              .filter((it) => shown[it.id] === bin.id)
              .sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id))
              .map((it) => (
                <PlacedItem key={it.id} label={it.label} state={stateOf(it.id)} disabled={status !== 'answering'} onPress={() => tapPlaced(it.id)} />
              ))}
          </Bin>
        ))}
      </View>
      {!locked && (
        <View style={styles.pool}>
          {pool
            .filter((it) => placed[it.id] === null)
            .map((it) => {
              const on = sel === it.id;
              return (
                <Pressable
                  key={it.id}
                  accessibilityRole="button"
                  accessibilityLabel={it.label}
                  accessibilityState={{ selected: on, disabled: status !== 'answering' }}
                  disabled={status !== 'answering'}
                  onPress={() => tapPoolItem(it.id)}
                  style={({ pressed }) => [
                    styles.chip,
                    { borderColor: on ? p.select : p.line, backgroundColor: on || pressed ? p.selectBg : p.page, borderBottomWidth: 2 + LIP },
                  ]}
                >
                  <Text style={[styles.chipText, { color: p.ink }]} maxFontSizeMultiplier={1.3}>
                    {it.label}
                  </Text>
                </Pressable>
              );
            })}
        </View>
      )}
    </Frame>
  );
}

/** A bin: a dashed column with a caps label; blue while an item waits to be put somewhere; ticked when sorted right. */
function Bin({ label, target, tick, tickDelay, disabled, onPress, children }: { label: string; target: boolean; tick: boolean; tickDelay: number; disabled: boolean; onPress: () => void; children: ReactNode }) {
  const { palette: p } = useTheme();
  const [ticked, setTicked] = useState(false);
  useEffect(() => {
    if (!tick) return setTicked(false);
    const id = setTimeout(() => setTicked(true), tickDelay);
    return () => clearTimeout(id);
  }, [tick, tickDelay]);
  const border = ticked ? p.ok : target ? p.select : p.lineStrong;
  // the bin's face is one button under the items (a button may not hold the items' own buttons)
  return (
    <View style={[styles.bin, { borderColor: border, backgroundColor: ticked ? p.okBg : target ? p.selectBg : p.page, borderStyle: ticked ? 'solid' : 'dashed' }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${target ? 'Put it in: ' : ''}${label}${ticked ? ', correct' : ''}`}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.binHead} pointerEvents="none">
        <Text style={[styles.binLabel, { color: ticked ? p.okText : p.muted }]} maxFontSizeMultiplier={1.3}>
          {label.toUpperCase()}
        </Text>
        {ticked && (
          <Pop trigger>
            <Mark kind="ok" color={p.ok} size={14} />
          </Pop>
        )}
      </View>
      <View style={styles.binItems} pointerEvents="box-none">
        {children}
      </View>
    </View>
  );
}

/** An item inside a bin: tap to send it back. Red and shaking when wrong; green once right. */
function PlacedItem({ label, state, disabled, onPress }: { label: string; state: ItemState; disabled: boolean; onPress: () => void }) {
  const { palette: p } = useTheme();
  const bad = state === 'wrong';
  const ok = state === 'right' || state === 'shown';
  const said = bad ? ', incorrect' : ok ? ', correct' : '';
  return (
    <Rise>
      <Shake trigger={bad}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${label}${said}${disabled ? '' : ', tap to send back'}`}
          disabled={disabled}
          onPress={onPress}
          style={[styles.placed, { borderColor: bad ? p.bad : ok ? p.ok : p.line, backgroundColor: bad ? p.badBg : ok ? p.okBg : p.page }]}
        >
          <Text style={[styles.placedText, { color: bad ? p.badText : ok ? p.okText : p.ink }]} maxFontSizeMultiplier={1.3}>
            {label}
          </Text>
        </Pressable>
        {bad && (
          <View style={styles.mark} pointerEvents="none">
            <Mark kind="bad" color={p.bad} size={14} />
          </View>
        )}
      </Shake>
    </Rise>
  );
}

const styles = StyleSheet.create({
  bins: { flexDirection: 'row', gap: 10, alignItems: 'stretch' },
  bin: { flex: 1, minHeight: 120, borderWidth: 2, borderRadius: radius.m, padding: 8, gap: 8 },
  binHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 22 },
  binLabel: { fontFamily: font.mono, fontSize: 12, letterSpacing: 1.2, textAlign: 'center' },
  binItems: { gap: 8 },
  placed: { minHeight: touch, borderWidth: 2, borderRadius: radius.s, paddingHorizontal: 10, paddingVertical: 8, justifyContent: 'center' },
  placedText: { fontFamily: font.bodyMedium, fontSize: 15, lineHeight: 20 },
  mark: { position: 'absolute', top: -7, right: -7 },
  pool: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: 4 },
  chip: { minHeight: touch + 6, borderWidth: 2, borderRadius: radius.m, paddingHorizontal: 14, paddingVertical: 10, justifyContent: 'center', maxWidth: '100%' },
  chipText: { fontFamily: font.bodyMedium, fontSize: 16, lineHeight: 21 },
});
