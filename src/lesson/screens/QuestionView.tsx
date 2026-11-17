// A graded question: answer cards (choice) or tap targets on the figure (tapFig).
// Check → green sheet with Why? and Continue, or red: a hint and Try again (story),
// and after the last allowed miss the right answer is shown with Why? (honest "revealed").
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Fig, Option, PartLabel, Question } from '@/content/types';
import { Sheet } from '@/figures/Sheet';
import { outcomeOf, STORY_TRIES, type Outcome, type Phase } from '@/session/logic';
import { useTheme } from '@/theme/ThemeContext';
import { font, radius } from '@/theme/tokens';
import { MainButton, OptionCard, OptionList, VerdictSheet, type CardState, type Verdict } from '@/ui/parts';
import { feedback } from '@/ui/feedback';
import { Frame } from '../Frame';
import { Instruction, Prompt } from '../text';

type Props = {
  screen: Question;
  figN: number;
  phase: Phase;
  /** For a revisit: what the learner predicted earlier. */
  earlierPick?: Option;
  onOutcome: (o: Outcome) => void;
  onNext: () => void;
};

type Status = 'answering' | 'retry' | 'right' | 'revealed';

export function QuestionView({ screen, figN, phase, earlierPick, onOutcome, onNext }: Props) {
  const { palette: p } = useTheme();
  const [sel, setSel] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string[]>([]); // ids missed so far
  const [status, setStatus] = useState<Status>('answering');
  const right = useMemo(() => screen.options.find((o) => o.correct)!, [screen]);
  const tries = phase === 'check' ? 1 : STORY_TRIES;
  const locked = status === 'right' || status === 'revealed';

  const check = () => {
    if (!sel) return;
    if (sel === right.id) {
      feedback.right();
      onOutcome(outcomeOf(wrong.length, phase));
      setStatus('right');
      return;
    }
    feedback.wrong();
    const missed = [...wrong, sel];
    setWrong(missed);
    if (missed.length >= tries) {
      onOutcome(outcomeOf(missed.length, phase));
      setStatus('revealed');
    } else setStatus('retry');
  };

  const stateOf = (id: string): CardState => {
    if (locked && id === right.id) return 'right';
    if (wrong.includes(id)) return status === 'retry' && id === sel ? 'wrong' : locked && id === sel ? 'wrong' : 'dim';
    if (locked) return 'dim';
    return sel === id ? 'selected' : 'idle';
  };

  let verdict: Verdict | null = null;
  if (status === 'right') verdict = { tone: 'ok', title: 'Correct!', why: screen.why };
  if (status === 'retry') verdict = { tone: 'bad', title: 'Not quite', text: screen.options.find((o) => o.id === sel)?.hint ?? 'Look again and try once more.' };
  if (status === 'revealed') verdict = { tone: 'bad', title: 'Not quite', text: `The answer is: ${right.label}.`, why: screen.why };

  const sheetButton =
    status === 'retry'
      ? {
          label: 'Try again',
          onPress: () => {
            setSel(null);
            setStatus('answering');
          },
        }
      : { label: 'Continue', onPress: onNext };

  const tapMarks: Record<string, 'right' | 'wrong'> = {};
  if (screen.kind === 'tapFig') {
    if (locked) tapMarks[right.id] = 'right';
    if ((status === 'retry' || status === 'revealed') && sel && sel !== right.id) tapMarks[sel] = 'wrong';
  }
  const picked = screen.options.find((o) => o.id === sel);
  const fig = screen.fig && (
    <Sheet
      fig={locked ? revealed(screen.fig) : screen.fig}
      n={figN}
      tap={
        screen.kind === 'tapFig'
          ? {
              selected: sel,
              marks: tapMarks,
              disabled: status !== 'answering',
              onTap: (id) => {
                if (wrong.includes(id)) return;
                feedback.pick();
                setSel(id);
              },
            }
          : undefined
      }
    />
  );

  return (
    <Frame
      fig={fig}
      figFirst={revealsAfterCheck(screen.fig)}
      footer={<MainButton label="Check" onPress={check} disabled={!sel || status !== 'answering'} />}
      sheet={verdict ? <VerdictSheet verdict={verdict} button={sheetButton} /> : null}
    >
      <Prompt>{screen.prompt}</Prompt>
      {earlierPick && (
        <View style={[styles.earlier, { backgroundColor: p.paper }]}>
          <Text style={[styles.earlierText, { color: p.muted }]}>You said earlier: {earlierPick.label.charAt(0).toLowerCase() + earlierPick.label.slice(1)}</Text>
        </View>
      )}
      {screen.kind === 'tapFig' && <Instruction>{screen.instruction}</Instruction>}
      {screen.kind === 'choice' ? (
        <OptionList>
          {screen.options.map((o) => (
            <OptionCard
              key={o.id}
              label={o.label}
              state={stateOf(o.id)}
              disabled={status !== 'answering' || wrong.includes(o.id)}
              onPress={() => {
                feedback.pick();
                setSel(o.id);
              }}
            />
          ))}
        </OptionList>
      ) : (
        <Text style={[styles.pickedLine, { color: picked ? p.ink : p.faint }]}>{picked ? `Your answer: ${picked.label}` : 'Nothing picked yet'}</Text>
      )}
    </Frame>
  );
}

/** True when the figure shows something new once answered (a flight that plays, the number on the scales): keep it in view. */
function revealsAfterCheck(fig: Fig | undefined): boolean {
  return (
    (fig?.kind === 'throw' && fig.play === 'afterCheck') ||
    (fig?.kind === 'lift' && fig.reading === 'afterCheck') ||
    (fig?.kind === 'road' && fig.play === 'afterCheck') ||
    (fig?.kind === 'equations' && fig.leftOut === 'afterCheck') ||
    (fig?.kind === 'graph' && (fig.areas ?? []).some((area) => area.value === 'afterCheck')) ||
    (fig?.kind === 'track' && fig.disp === 'afterCheck') ||
    (fig?.kind === 'vectors' && (fig.resultant === 'afterCheck' || fig.angle === 'afterCheck')) ||
    (fig?.kind === 'sledge' && (fig.forward === 'afterCheck' || fig.up === 'afterCheck')) ||
    (fig?.kind === 'hill' && (fig.along === 'afterCheck' || fig.into === 'afterCheck')) ||
    (fig?.kind === 'resolve' && fig.answer === 'afterCheck')
  );
}

/** After the answer the figure shows what the question hid: the real N arrow, the number on the scales, the braking played. */
function revealed(fig: Fig): Fig {
  if (fig.kind === 'throw') return { ...fig, unknownV: undefined, play: fig.play === 'afterCheck' ? true : fig.play };
  // the braking plays, and the marker on the road shows the speed it asked for
  if (fig.kind === 'road') return { ...fig, play: fig.play === 'afterCheck' ? true : fig.play, ask: fig.ask && { ...fig.ask, shown: true } };
  // every equation shows the quantity it leaves out
  if (fig.kind === 'equations') return { ...fig, leftOut: 'shown' };
  // the size of each area is written in
  if (fig.kind === 'graph') return { ...fig, areas: fig.areas?.map((area) => ({ ...area, value: 'shown' as const })) };
  if (fig.kind === 'track') return { ...fig, disp: fig.disp === 'afterCheck' ? 'shown' : fig.disp };
  if (fig.kind === 'vectors') return { ...fig, resultant: fig.resultant === 'afterCheck' ? 'shown' : fig.resultant, angle: fig.angle === 'afterCheck' ? 'shown' : fig.angle };
  // the size of the component the question asked for is written in
  if (fig.kind === 'sledge') return { ...fig, forward: shownAfter(fig.forward), up: shownAfter(fig.up) };
  if (fig.kind === 'hill') return { ...fig, along: shownAfter(fig.along), into: shownAfter(fig.into) };
  if (fig.kind === 'resolve') return { ...fig, answer: fig.answer === 'afterCheck' ? 'shown' : fig.answer };
  if (fig.kind !== 'lift') return fig;
  return { ...fig, unknownN: undefined, reading: fig.reading === 'afterCheck' ? 'shown' : fig.reading };
}

const shownAfter = (label: PartLabel | undefined): PartLabel | undefined => (label === 'afterCheck' ? 'shown' : label);

const styles = StyleSheet.create({
  earlier: { borderRadius: radius.s, paddingHorizontal: 14, paddingVertical: 10, alignSelf: 'flex-start', marginTop: -6 },
  earlierText: { fontFamily: font.bodyMedium, fontSize: 15 },
  pickedLine: { fontFamily: font.bodyMedium, fontSize: 16, textAlign: 'center' },
});
