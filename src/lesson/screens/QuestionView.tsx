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
          <Text style={[styles.earlierText, { color: p.muted }]}>You said earlier: {midSentence(earlierPick.label)}</Text>
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
    (fig?.kind === 'bench' && (fig.play === 'afterCheck' || fig.range === 'afterCheck')) ||
    (fig?.kind === 'kick' && (fig.play === 'afterCheck' || fig.path === 'afterCheck' || fig.range === 'afterCheck' || fig.height === 'afterCheck' || fig.topV === 'afterCheck'))
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
  // the free-body diagram appears, or the force it asked for grows to its real size
  if (fig.kind === 'crate') return { ...fig, fbdAfterCheck: undefined, ask: fig.ask?.filter((a) => a.answer !== 'afterCheck'), accel: fig.accel === 'afterCheck' ? 'shown' : fig.accel };
  // the drag grows to its real size, the steady speed of each stack is written in
  if (fig.kind === 'fall') return { ...fig, askD: fig.askD === 'afterCheck' ? undefined : fig.askD, speeds: fig.speeds === 'afterCheck' ? 'shown' : fig.speeds };
  // the lab plays on from rest, and the tension or acceleration it asked for is written in
  if (fig.kind === 'pulley')
    return {
      ...fig,
      play: fig.play === 'afterCheck' ? true : fig.play,
      at: fig.play === 'afterCheck' ? undefined : fig.at,
      tension: fig.tension === 'afterCheck' ? 'shown' : fig.tension,
      accel: fig.accel === 'afterCheck' ? 'shown' : fig.accel,
    };
  if (fig.kind === 'ladder') return { ...fig, askF: fig.askF === 'afterCheck' ? undefined : fig.askF };
  // the momentum arrows grow to their size, the momentum line fills in, the total is written
  if (fig.kind === 'wall') return { ...fig, p: fig.p === 'afterCheck' ? 'shown' : fig.p, ledger: fig.ledger === 'afterCheck' ? 'shown' : fig.ledger };
  if (fig.kind === 'bodies') return { ...fig, p: fig.p === 'afterCheck' ? 'shown' : fig.p, total: fig.total === 'afterCheck' ? 'shown' : fig.total };
  // the collision plays through, and the momentum line fills in: the total before and after
  if (fig.kind === 'collide') return { ...fig, play: fig.play === 'afterCheck' ? true : fig.play, ledger: fig.ledger === 'afterCheck' ? 'shown' : fig.ledger };
  // the perpendicular distance appears, and the moment is written by its turning arc
  if (fig.kind === 'spanner') return { ...fig, perp: fig.perp === 'afterCheck' ? 'shown' : fig.perp, moment: fig.moment === 'afterCheck' ? 'shown' : fig.moment };
  if (fig.kind === 'pole') return { ...fig, moment: fig.moment === 'afterCheck' ? 'shown' : fig.moment };
  if (fig.kind === 'bar') return { ...fig, moments: fig.moments === 'afterCheck' ? 'shown' : fig.moments };
  // the asked distance, weight or push gets its size, and the totals of the moments appear
  if (fig.kind === 'beam') return { ...fig, answer: fig.answer === 'afterCheck' ? 'shown' : fig.answer };
  // each piece's weight grows to its size
  if (fig.kind === 'broom') return { ...fig, pieces: fig.pieces === 'afterCheck' ? 'shown' : fig.pieces };
  // the work each hand's force does is written in
  if (fig.kind === 'platform') return { ...fig, work: fig.work === 'afterCheck' ? 'shown' : fig.work };
  // the push along the ramp grows to its size, and the work up the ramp is written in
  if (fig.kind === 'ramp') return { ...fig, push: fig.push === 'afterCheck' ? 'shown' : fig.push };
  // the falls play (slowed down, with strobe copies) and the landing distance is written in
  if (fig.kind === 'bench') return { ...fig, play: fig.play === 'afterCheck' ? true : fig.play, at: fig.play === 'afterCheck' ? undefined : fig.at, range: fig.range === 'afterCheck' ? 'shown' : fig.range };
  // the flights play, the paths appear and every "?" gets its size
  if (fig.kind === 'kick') {
    const after = <T,>(x: T | 'afterCheck', to: T): T => (x === 'afterCheck' ? to : x);
    return {
      ...fig,
      play: after(fig.play, true),
      path: fig.path && after(fig.path, 'shown'),
      range: fig.range && after(fig.range, 'shown'),
      height: fig.height && after(fig.height, 'shown'),
      topV: fig.topV && after(fig.topV, 'shown'),
    };
  }
  if (fig.kind !== 'lift') return fig;
  return { ...fig, unknownN: undefined, reading: fig.reading === 'afterCheck' ? 'shown' : fig.reading };
}

/** The people in the lessons' stories: an option that starts with one keeps its capital ("Omar: his pull…"). */
const NAMES = new Set(['Mia', 'Leo', 'Ana', 'Ben', 'Zoe', 'Kai', 'Rose', 'Nadia', 'Omar', 'Ella']);

/** An option label continued after "You said earlier:": lower-case first letter, except for "I" and names ("Mia's"). */
function midSentence(label: string): string {
  const firstWord = label.split(' ')[0];
  if (/^I('|$)/.test(firstWord) || /^[A-Z][a-z]*'s\b/.test(firstWord) || NAMES.has(firstWord.replace(/[:,]$/, ''))) return label;
  return label.charAt(0).toLowerCase() + label.slice(1);
}

const shownAfter = (label: PartLabel | undefined): PartLabel | undefined => (label === 'afterCheck' ? 'shown' : label);

const styles = StyleSheet.create({
  earlier: { borderRadius: radius.s, paddingHorizontal: 14, paddingVertical: 10, alignSelf: 'flex-start', marginTop: -6 },
  earlierText: { fontFamily: font.bodyMedium, fontSize: 15 },
  pickedLine: { fontFamily: font.bodyMedium, fontSize: 16, textAlign: 'center' },
});
