// A graded question: answer cards (choice) or tap targets on the figure (tapFig).
// Check → green sheet with Why? and Continue, or red: a hint and Try again (story),
// and after the last allowed miss the right answer is shown with Why? (honest "revealed").
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Fig, Option, Question } from '@/content/types';
import { Sheet } from '@/figures/Sheet';
import { revealed } from '@/session/reveal';
import { shuffled } from '@/session/shuffle';
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
  /** Every wrong Check, with the option picked. */
  onWrong: (optionId: string) => void;
  onNext: () => void;
};

type Status = 'answering' | 'retry' | 'right' | 'revealed';

export function QuestionView({ screen, figN, phase, earlierPick, onOutcome, onWrong, onNext }: Props) {
  const { palette: p } = useTheme();
  const [sel, setSel] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string[]>([]); // ids missed so far
  const [status, setStatus] = useState<Status>('answering');
  const right = useMemo(() => screen.options.find((o) => o.correct)!, [screen]);
  // Choice cards in a fixed per-screen order; tapFig options are places on the figure, so they keep theirs.
  const shown = useMemo(() => (screen.kind === 'choice' ? shuffled(screen.options, screen.id) : screen.options), [screen]);
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
    onWrong(sel);
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
          <Text style={[styles.earlierText, { color: p.muted }]}>You said earlier: {midSentence(earlierPick.label)}</Text>
        </View>
      )}
      {screen.kind === 'tapFig' && <Instruction>{screen.instruction}</Instruction>}
      {screen.kind === 'choice' ? (
        <OptionList>
          {shown.map((o) => (
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
    (fig?.kind === 'resolve' && fig.answer === 'afterCheck') ||
    (fig?.kind === 'crate' && ((fig.ask ?? []).some((a) => a.answer === 'afterCheck') || fig.fbdAfterCheck === true || fig.accel === 'afterCheck')) ||
    (fig?.kind === 'pulley' && (fig.play === 'afterCheck' || fig.tension === 'afterCheck' || fig.accel === 'afterCheck')) ||
    (fig?.kind === 'fall' && (fig.askD === 'afterCheck' || fig.speeds === 'afterCheck')) ||
    (fig?.kind === 'ladder' && fig.askF === 'afterCheck') ||
    (fig?.kind === 'wall' && (fig.p === 'afterCheck' || fig.ledger === 'afterCheck')) ||
    (fig?.kind === 'bodies' && (fig.p === 'afterCheck' || fig.total === 'afterCheck')) ||
    (fig?.kind === 'collide' && (fig.play === 'afterCheck' || fig.ledger === 'afterCheck')) ||
    (fig?.kind === 'spanner' && (fig.perp === 'afterCheck' || fig.moment === 'afterCheck')) ||
    (fig?.kind === 'pole' && fig.moment === 'afterCheck') ||
    (fig?.kind === 'bar' && fig.moments === 'afterCheck') ||
    (fig?.kind === 'beam' && fig.answer === 'afterCheck') ||
    (fig?.kind === 'broom' && fig.pieces === 'afterCheck') ||
    (fig?.kind === 'platform' && fig.work === 'afterCheck') ||
    (fig?.kind === 'ramp' && fig.push === 'afterCheck') ||
    (fig?.kind === 'kinetic' && (fig.square === 'afterCheck' || fig.energy === 'afterCheck')) ||
    (fig?.kind === 'cliff' && fig.landing === 'afterCheck') ||
    (fig?.kind === 'slide' && (fig.heat === 'afterCheck' || fig.friction === 'afterCheck')) ||
    (fig?.kind === 'ride' && fig.power === 'afterCheck') ||
    (fig?.kind === 'winch' && (fig.useful === 'afterCheck' || fig.efficiency === 'afterCheck')) ||
    (fig?.kind === 'tank' && (fig.drop === 'afterCheck' || fig.pushed === 'afterCheck')) ||
    (fig?.kind === 'dunk' && (fig.reading === 'afterCheck' || fig.overflow === 'afterCheck')) ||
    (fig?.kind === 'tube' && (fig.play === 'afterCheck' || fig.ask === 'afterCheck')) ||
    (fig?.kind === 'material' && fig.unload === 'afterCheck') ||
    (fig?.kind === 'launcher' && (fig.ask === 'afterCheck' || fig.speed === 'afterCheck')) ||
    (fig?.kind === 'wire' && (fig.ask?.hide === 'afterCheck' || fig.stretch === 'afterCheck')) ||
    (fig?.kind === 'spring' && (fig.ask?.hide === 'afterCheck' || fig.springs.some((s) => s.hung === 'afterCheck' || s.pull === 'afterCheck'))) ||
    (fig?.kind === 'bench' && (fig.play === 'afterCheck' || fig.range === 'afterCheck')) ||
    (fig?.kind === 'kick' && (fig.play === 'afterCheck' || fig.path === 'afterCheck' || fig.range === 'afterCheck' || fig.height === 'afterCheck' || fig.topV === 'afterCheck'))
  );
}

/** The people in the lessons' stories: an option that starts with one keeps its capital ("Omar: his pull…"). */
const NAMES = new Set(['Mia', 'Leo', 'Ana', 'Ben', 'Zoe', 'Kai', 'Rose', 'Nadia', 'Omar', 'Ella']);

/** An option label continued after "You said earlier:": lower-case first letter, except for "I" and names ("Mia's"). */
function midSentence(label: string): string {
  const firstWord = label.split(' ')[0];
  if (/^I('|$)/.test(firstWord) || /^[A-Z][a-z]*'s\b/.test(firstWord) || NAMES.has(firstWord.replace(/[:,]$/, ''))) return label;
  return label.charAt(0).toLowerCase() + label.slice(1);
}


const styles = StyleSheet.create({
  earlier: { borderRadius: radius.s, paddingHorizontal: 14, paddingVertical: 10, alignSelf: 'flex-start', marginTop: -6 },
  earlierText: { fontFamily: font.bodyMedium, fontSize: 15 },
  pickedLine: { fontFamily: font.bodyMedium, fontSize: 16, textAlign: 'center' },
});
