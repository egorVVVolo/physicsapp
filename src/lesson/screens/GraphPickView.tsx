// Graph pick: three candidate graphs, one at a time on the full sheet (never several small ones).
// Segments "A · B · C" above the sheet choose which graph is shown, and that is the answer; a swipe left or right
// across the sheet moves to the next or previous graph. Check as in a choice question; once answered the sheet shows
// the right graph. An optional scene of the motion sits above, as a small still sheet.
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';
import type { GraphPickScreen } from '@/content/types';
import { Sheet } from '@/figures/Sheet';
import { outcomeOf, STORY_TRIES, type Outcome, type Phase } from '@/session/logic';
import { useTheme } from '@/theme/ThemeContext';
import { font, LIP, radius, touch } from '@/theme/tokens';
import { feedback } from '@/ui/feedback';
import { useRightSound } from '../puzzle';
import { Pop, Shake } from '@/ui/motion';
import { MainButton, Mark, VerdictSheet, type Verdict } from '@/ui/parts';
import { Frame } from '../Frame';
import { Instruction, Prompt } from '../text';

type Props = { screen: GraphPickScreen; figN: number; phase: Phase; onOutcome: (o: Outcome) => void; onWrong: (id: string) => void; onNext: () => void };
type Status = 'answering' | 'retry' | 'right' | 'revealed';

/** A swipe this far (pt) across the sheet moves to the next graph. */
const SWIPE = 40;

export function GraphPickView({ screen, figN, phase, onOutcome, onWrong, onNext }: Props) {
  const playRight = useRightSound(screen.id);
  const tries = phase === 'check' ? 1 : STORY_TRIES;
  const ids: string[] = screen.graphs.map((g) => g.id);
  const right = screen.graphs.find((g) => g.correct)!;
  const [sel, setSel] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>('answering');
  const locked = status === 'right' || status === 'revealed';
  const shownId = locked ? right.id : (sel ?? ids[0]);
  const shown = screen.graphs.find((g) => g.id === shownId)!;

  const choose = (id: string) => {
    if (status !== 'answering' || id === sel) return;
    feedback.pick();
    setSel(id);
  };
  const step = (dir: 1 | -1) => {
    const at = ids.indexOf(shownId);
    choose(ids[Math.min(ids.length - 1, Math.max(0, at + dir))]); // at either end a swipe picks the graph in view
  };
  const swipe = Gesture.Pan()
    .enabled(status === 'answering')
    .activeOffsetX([-15, 15])
    .failOffsetY([-12, 12])
    .onEnd((e) => {
      'worklet';
      if (e.translationX <= -SWIPE) scheduleOnRN(step, 1);
      else if (e.translationX >= SWIPE) scheduleOnRN(step, -1);
    });

  const check = () => {
    if (!sel) return;
    if (sel === right.id) {
      playRight();
      onOutcome(outcomeOf(wrong.length, phase));
      setStatus('right');
      return;
    }
    feedback.wrong();
    onWrong(sel);
    const missed = [...wrong, sel];
    setWrong(missed);
    if (missed.length >= tries) {
      onOutcome(outcomeOf(missed.length, phase));
      setStatus('revealed');
    } else setStatus('retry');
  };

  let verdict: Verdict | null = null;
  let button = { label: 'Continue', onPress: onNext };
  if (status === 'right') verdict = { tone: 'ok', title: 'Correct!', why: screen.why };
  if (status === 'retry') {
    verdict = { tone: 'bad', title: 'Not quite', text: screen.graphs.find((g) => g.id === sel)?.hint ?? 'Look again and try once more.' };
    button = {
      label: 'Try again',
      onPress: () => {
        setSel(null);
        setStatus('answering');
      },
    };
  }
  if (status === 'revealed') verdict = { tone: 'bad', title: 'Not quite', text: `It is graph ${right.id}.`, why: screen.why };

  const segState = (id: string): SegState => {
    if (locked && id === right.id) return 'right';
    if ((status === 'retry' || locked) && id === sel && id !== right.id) return 'wrong';
    if (wrong.includes(id)) return 'dim';
    return id === sel ? 'selected' : id === shownId && !locked ? 'viewing' : 'idle';
  };

  return (
    <Frame
      fig={
        <View style={styles.figs}>
          {screen.scene && <Sheet fig={screen.scene} n={figN} compact />}
          <View style={styles.segments} accessibilityRole="radiogroup" accessibilityLabel="Graphs">
            {ids.map((id) => (
              <Segment key={id} id={id} state={segState(id)} disabled={status !== 'answering' || wrong.includes(id)} onPress={() => choose(id)} />
            ))}
          </View>
          <GestureDetector gesture={swipe}>
            <View collapsable={false}>
              <Sheet fig={shown.fig} n={screen.scene ? figN + 1 : figN} />
            </View>
          </GestureDetector>
        </View>
      }
      figFirst
      footer={<MainButton label="Check" onPress={check} disabled={!sel || status !== 'answering'} />}
      sheet={verdict ? <VerdictSheet verdict={verdict} button={button} /> : null}
    >
      <Prompt>{screen.prompt}</Prompt>
      <Instruction>Tap A, B or C, or swipe across the graph. Then Check.</Instruction>
    </Frame>
  );
}

type SegState = 'idle' | 'viewing' | 'selected' | 'right' | 'wrong' | 'dim';

/** One of the three segments: the graph's letter. Blue lip when chosen; green or red only after Check, with a mark. */
function Segment({ id, state, disabled, onPress }: { id: string; state: SegState; disabled: boolean; onPress: () => void }) {
  const { palette: p } = useTheme();
  const border = state === 'selected' ? p.select : state === 'right' ? p.ok : state === 'wrong' ? p.bad : state === 'viewing' ? p.lineStrong : p.line;
  const bg = state === 'selected' ? p.selectBg : state === 'right' ? p.okBg : state === 'wrong' ? p.badBg : p.page;
  const color = state === 'right' ? p.okText : state === 'wrong' ? p.badText : state === 'dim' ? p.faint : p.ink;
  const said = state === 'right' ? ', correct' : state === 'wrong' ? ', incorrect' : '';
  return (
    <Shake trigger={state === 'wrong'} style={styles.segWrap}>
      <Pop trigger={state === 'right'} style={styles.segWrap}>
        <Pressable
          accessibilityRole="radio"
          accessibilityState={{ checked: state === 'selected', disabled }}
          accessibilityLabel={`Graph ${id}${said}`}
          disabled={disabled}
          onPress={onPress}
          style={[styles.seg, { borderColor: border, backgroundColor: bg, borderBottomWidth: state === 'selected' ? 2 + LIP : 2 }]}
        >
          <Text style={[styles.segText, { color }]}>Graph {id}</Text>
        </Pressable>
        {(state === 'right' || state === 'wrong') && (
          <View style={styles.mark} pointerEvents="none">
            <Mark kind={state === 'right' ? 'ok' : 'bad'} color={state === 'right' ? p.ok : p.bad} size={14} />
          </View>
        )}
      </Pop>
    </Shake>
  );
}

const styles = StyleSheet.create({
  figs: { gap: 12 },
  segments: { flexDirection: 'row', gap: 8 },
  segWrap: { flex: 1 },
  seg: { minHeight: touch, borderWidth: 2, borderRadius: radius.m, alignItems: 'center', justifyContent: 'center' },
  segText: { fontFamily: font.bodyMedium, fontSize: 16 },
  mark: { position: 'absolute', top: -7, right: -7 },
});
