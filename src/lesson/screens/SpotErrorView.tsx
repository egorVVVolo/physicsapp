// Spot the error: a worked solution as a page of an exercise book; tap the one wrong line, then Check.
// Right: the line is struck through in red and the fix slides in below it in green, marked "Fixed".
// Wrong: the hint of the line picked. Tries: two in the story, one in the Skill check; then the mistake is shown.
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { SpotErrorScreen } from '@/content/types';
import { Sheet } from '@/figures/Sheet';
import { outcomeOf, STORY_TRIES, type Outcome, type Phase } from '@/session/logic';
import { revealed } from '@/session/reveal';
import { useTheme } from '@/theme/ThemeContext';
import { font, radius, touch } from '@/theme/tokens';
import { feedback } from '@/ui/feedback';
import { useRightSound } from '../puzzle';
import { Rise, Shake } from '@/ui/motion';
import { MainButton, Mark, VerdictSheet, type Verdict } from '@/ui/parts';
import { Frame } from '../Frame';
import { Instruction, Prompt } from '../text';

type Props = { screen: SpotErrorScreen; figN: number; phase: Phase; onOutcome: (o: Outcome) => void; onWrong: (id: string) => void; onNext: () => void };
type Status = 'answering' | 'retry' | 'right' | 'revealed';

export function SpotErrorView({ screen, figN, phase, onOutcome, onWrong, onNext }: Props) {
  const playRight = useRightSound(screen.id);
  const { palette: p } = useTheme();
  const tries = phase === 'check' ? 1 : STORY_TRIES;
  const wrongLine = screen.lines.find((l) => l.wrong)!;
  const [sel, setSel] = useState<string | null>(null);
  const [missed, setMissed] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>('answering');
  const locked = status === 'right' || status === 'revealed';

  const check = () => {
    if (!sel) return;
    if (sel === wrongLine.id) {
      playRight();
      onOutcome(outcomeOf(missed.length, phase));
      setStatus('right');
      return;
    }
    feedback.wrong();
    onWrong(sel);
    const m = [...missed, sel];
    setMissed(m);
    if (m.length >= tries) {
      onOutcome(outcomeOf(m.length, phase));
      setStatus('revealed');
    } else setStatus('retry');
  };

  let verdict: Verdict | null = null;
  let button = { label: 'Continue', onPress: onNext };
  const lineNo = screen.lines.indexOf(wrongLine) + 1;
  if (status === 'retry') {
    verdict = { tone: 'bad', title: 'Not quite', text: screen.lines.find((l) => l.id === sel)?.hint ?? 'That line is right. Look again.' };
    button = {
      label: 'Try again',
      onPress: () => {
        setSel(null);
        setStatus('answering');
      },
    };
  }
  if (status === 'right') verdict = { tone: 'ok', title: 'Correct!', why: screen.why };
  if (status === 'revealed') verdict = { tone: 'bad', title: 'Not quite', text: `The mistake is in line ${lineNo}.`, why: screen.why };

  return (
    <Frame
      fig={screen.fig && <Sheet fig={locked ? revealed(screen.fig) : screen.fig} n={figN} />}
      footer={<MainButton label="Check" onPress={check} disabled={!sel || status !== 'answering'} />}
      sheet={verdict ? <VerdictSheet verdict={verdict} button={button} /> : null}
    >
      <Prompt>{screen.prompt}</Prompt>
      <Instruction>Tap the wrong line, then Check.</Instruction>
      <View style={[styles.page, { backgroundColor: p.paper, borderColor: p.paperLine }]} accessibilityRole="radiogroup">
        {screen.lines.map((line, i) => {
          const struck = locked && line.wrong;
          const picked = sel === line.id;
          const missedNow = status === 'retry' && picked;
          const tried = missed.includes(line.id) && !missedNow;
          const border = struck ? p.bad : missedNow ? p.bad : picked && status === 'answering' ? p.select : 'transparent';
          const bg = struck ? p.badBg : missedNow ? p.badBg : picked && status === 'answering' ? p.selectBg : 'transparent';
          return (
            <View key={line.id}>
              <Shake trigger={missedNow}>
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ checked: picked, disabled: status !== 'answering' || tried }}
                  accessibilityLabel={`Line ${i + 1}: ${line.text}${struck ? ', wrong' : missedNow ? ', this line is right' : ''}`}
                  disabled={status !== 'answering' || tried}
                  onPress={() => {
                    feedback.pick();
                    setSel(line.id);
                  }}
                  style={[styles.line, { borderColor: border, backgroundColor: bg }]}
                >
                  <Text style={[styles.no, { color: p.faint }]}>{i + 1}</Text>
                  <Text
                    style={[styles.text, { color: struck ? p.badText : tried ? p.faint : p.ink }, struck && { textDecorationLine: 'line-through', textDecorationColor: p.bad }]}
                    maxFontSizeMultiplier={1.3}
                  >
                    {line.text}
                  </Text>
                </Pressable>
              </Shake>
              {struck && line.fix && (
                <Rise>
                  <View style={[styles.fix, { backgroundColor: p.okBg, borderColor: p.ok }]} accessible accessibilityLabel={`Fixed: ${line.fix}`}>
                    <Mark kind="ok" color={p.ok} size={16} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.fixLabel, { color: p.okText }]}>FIXED</Text>
                      <Text style={[styles.text, { color: p.okText }]}>{line.fix}</Text>
                    </View>
                  </View>
                </Rise>
              )}
            </View>
          );
        })}
      </View>
    </Frame>
  );
}

const styles = StyleSheet.create({
  page: { borderWidth: 1, borderRadius: radius.m, padding: 8, gap: 4 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: touch, borderWidth: 2, borderRadius: radius.s, paddingHorizontal: 10, paddingVertical: 8 },
  no: { fontFamily: font.mono, fontSize: 13, width: 14, textAlign: 'right' },
  text: { fontFamily: font.body, fontSize: 16, lineHeight: 23, flex: 1 },
  fix: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4, marginLeft: 26, borderWidth: 2, borderRadius: radius.s, paddingHorizontal: 10, paddingVertical: 8 },
  fixLabel: { fontFamily: font.mono, fontSize: 11, letterSpacing: 1.2 },
});
