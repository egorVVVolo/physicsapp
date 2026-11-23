// Worked example: the steps of a solution appear one at a time with "Next step"; opened steps stay.
// A step's maths sits on its own line. Optionally the learner picks the final line themselves
// (not counted, like a predict: once picked the right line is shown). Then Continue.
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { WorkedScreen } from '@/content/types';
import { Sheet } from '@/figures/Sheet';
import { shuffled } from '@/session/shuffle';
import { useTheme } from '@/theme/ThemeContext';
import { font, radius } from '@/theme/tokens';
import { feedback } from '@/ui/feedback';
import { Rise } from '@/ui/motion';
import { MainButton, Mark, OptionCard, OptionList, type CardState } from '@/ui/parts';
import { Frame } from '../Frame';
import { Instruction, Prompt, Title } from '../text';

export function WorkedView({ screen, figN, onNext }: { screen: WorkedScreen; figN: number; onNext: () => void }) {
  const { palette: p } = useTheme();
  const [open, setOpen] = useState(1); // steps shown so far
  const [pick, setPick] = useState<string | null>(null);
  const options = useMemo(() => (screen.last ? shuffled(screen.last.options, screen.id) : []), [screen]);
  const allOpen = open >= screen.steps.length;
  const asking = allOpen && !!screen.last;
  const right = screen.last?.options.find((o) => o.correct);

  const stateOf = (id: string): CardState => {
    if (!pick) return 'idle';
    if (id === right?.id) return 'right';
    return id === pick ? 'wrong' : 'dim';
  };

  const button = !allOpen
    ? { label: 'Next step', onPress: () => setOpen(open + 1), disabled: false }
    : { label: 'Continue', onPress: onNext, disabled: asking && !pick };

  return (
    <Frame fig={screen.fig && <Sheet fig={screen.fig} n={figN} />} footer={<MainButton label={button.label} onPress={button.onPress} disabled={button.disabled} />} follow={open + (pick ? 1 : 0)}>
      <Title>{screen.title}</Title>
      <View style={[styles.page, { borderColor: p.paperLine, backgroundColor: p.paper }]}>
        {screen.steps.slice(0, open).map((s, i) => (
          <Rise key={i}>
            <View style={styles.step} accessible accessibilityLabel={`Step ${i + 1}: ${s.text}${s.math ? ` ${s.math}` : ''}`}>
              <Text style={[styles.no, { color: p.faint }]}>{i + 1}</Text>
              <View style={styles.stepBody}>
                <Text style={[styles.text, { color: p.ink }]} maxFontSizeMultiplier={1.3}>
                  {s.text}
                </Text>
                {s.math && (
                  <Text style={[styles.math, { color: p.ink }]} maxFontSizeMultiplier={1.3}>
                    {s.math}
                  </Text>
                )}
              </View>
            </View>
          </Rise>
        ))}
      </View>
      {asking && screen.last && (
        <Rise style={styles.ask}>
          <Prompt>{screen.last.prompt}</Prompt>
          <Instruction>Tap the line you would write. It is not marked.</Instruction>
          <OptionList>
            {options.map((o) => (
              <OptionCard
                key={o.id}
                label={o.label}
                state={stateOf(o.id)}
                disabled={!!pick}
                onPress={() => {
                  feedback.pick();
                  setPick(o.id);
                }}
              />
            ))}
          </OptionList>
          {pick && (
            <View style={styles.inline}>
              <Mark kind={pick === right?.id ? 'ok' : 'bad'} color={pick === right?.id ? p.ok : p.bad} size={18} />
              <Text style={[styles.inlineText, { color: pick === right?.id ? p.okText : p.badText }]}>
                {pick === right?.id ? 'That is the line.' : `The line is: ${right?.label}`}
              </Text>
            </View>
          )}
        </Rise>
      )}
    </Frame>
  );
}

const styles = StyleSheet.create({
  page: { borderWidth: 1, borderRadius: radius.m, paddingHorizontal: 12, paddingVertical: 14, gap: 16 },
  step: { flexDirection: 'row', gap: 12 },
  no: { fontFamily: font.mono, fontSize: 13, width: 14, textAlign: 'right', paddingTop: 3 },
  stepBody: { flex: 1, gap: 6 },
  text: { fontFamily: font.body, fontSize: 16, lineHeight: 23 },
  math: { fontFamily: font.displaySemi, fontSize: 20, lineHeight: 27 },
  ask: { gap: 14 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  inlineText: { fontFamily: font.bodyMedium, fontSize: 17, lineHeight: 24, flex: 1 },
});
