// Screens without a graded answer: intro, text, prediction and the Skill check splash.
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { IntroScreen, PredictScreen, TextScreen } from '@/content/types';
import { Sheet } from '@/figures/Sheet';
import { Puck } from '@/figures/Puck';
import { useTheme } from '@/theme/ThemeContext';
import { font, levelColors } from '@/theme/tokens';
import { MainButton, OptionCard, OptionList } from '@/ui/parts';
import { Frame } from '../Frame';
import { Body, Prompt, TermCard, Title } from '../text';

export function IntroView({ screen, figN, onNext }: { screen: IntroScreen; figN: number; onNext: () => void }) {
  return (
    <Frame footer={<MainButton label="Start" onPress={onNext} />}>
      <Sheet fig={screen.fig} n={figN} maxHeight={300} />
      <Title>{screen.title}</Title>
      <Body>{screen.body}</Body>
    </Frame>
  );
}

export function TextView({ screen, figN, onNext }: { screen: TextScreen; figN: number; onNext: () => void }) {
  return (
    <Frame center={!screen.fig} footer={<MainButton label="Continue" onPress={onNext} />}>
      {screen.fig && <Sheet fig={screen.fig} n={figN} />}
      {screen.body.map((para, i) => (
        <Body key={i}>{para}</Body>
      ))}
      {screen.card && <TermCard term={screen.card.term} text={screen.card.text} />}
    </Frame>
  );
}

/** A prediction: any pick is fine. The pick is kept and shown again when the story comes back to it. */
export function PredictView({ screen, figN, picked, onPick, onNext }: { screen: PredictScreen; figN: number; picked?: string; onPick: (id: string) => void; onNext: () => void }) {
  const { palette: p } = useTheme();
  const [sel, setSel] = useState<string | null>(picked ?? null);
  return (
    <Frame footer={<MainButton label="Continue" onPress={onNext} disabled={!sel} />}>
      <Prompt>{screen.prompt}</Prompt>
      {screen.fig && <Sheet fig={screen.fig} n={figN} maxHeight={240} />}
      <OptionList grid>
        {screen.options.map((o) => (
          <View key={o.id} style={styles.half}>
            <OptionCard
              compact
              label={o.label}
              state={sel === o.id ? 'selected' : 'idle'}
              onPress={() => {
                setSel(o.id);
                onPick(o.id);
              }}
            />
          </View>
        ))}
      </OptionList>
      {sel && <Text style={[styles.after, { color: p.muted }]}>{screen.after}</Text>}
    </Frame>
  );
}

export function CheckIntroView({ count, onNext }: { count: number; onNext: () => void }) {
  const { palette: p } = useTheme();
  return (
    <Frame center footer={<MainButton label="Start the Skill check" onPress={onNext} />}>
      <View style={{ alignItems: 'center', gap: 18 }}>
        <Puck size={150} state="current" color={levelColors.forces} />
        <Title>Skill check</Title>
        <Text style={[styles.lead, { color: p.muted }]}>
          {count} exam-style questions. One try each, no hints. The reasons come after each answer.
        </Text>
      </View>
    </Frame>
  );
}

const styles = StyleSheet.create({
  half: { flexBasis: '47%', flexGrow: 1 },
  after: { fontFamily: font.bodyMedium, fontSize: 17 },
  lead: { fontFamily: font.body, fontSize: 18, lineHeight: 27, textAlign: 'center', maxWidth: 340 },
});
