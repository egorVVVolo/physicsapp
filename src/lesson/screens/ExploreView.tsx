// Explore: drag the slider, the figure follows the model at once; then a light question with inline
// feedback ("That's right."). Not counted in the honest tally: it is part of learning, not a test.
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ExploreScreen } from '@/content/types';
import { signed } from '@/physics/format';
import { Sheet } from '@/figures/Sheet';
import { useTheme } from '@/theme/ThemeContext';
import { font } from '@/theme/tokens';
import { Mark, MainButton, OptionCard, OptionList } from '@/ui/parts';
import { Slider } from '@/ui/Slider';
import { Frame } from '../Frame';
import { Instruction, Prompt } from '../text';

export function ExploreView({ screen, figN, onNext }: { screen: ExploreScreen; figN: number; onNext: () => void }) {
  const { palette: p } = useTheme();
  const [a, setA] = useState(screen.fig.a);
  const [moved, setMoved] = useState(false);
  const [sel, setSel] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string[]>([]);
  const q = screen.question;
  const solved = sel !== null && q.options.find((o) => o.id === sel)?.correct === true;
  const hint = sel && !solved ? q.options.find((o) => o.id === sel)?.hint : null;

  return (
    <Frame footer={<MainButton label="Continue" onPress={onNext} disabled={!solved} />}>
      <Prompt>{screen.instruction}</Prompt>
      <Sheet fig={screen.fig} n={figN} a={a} />
      <Slider
        value={a}
        min={screen.slider.min}
        max={screen.slider.max}
        step={screen.slider.step}
        tick={screen.slider.tick}
        label={screen.slider.label}
        format={(v) => `a = ${signed(v, 1)} ${screen.slider.unit}`}
        formatEnd={(v) => signed(v, 0)}
        onChange={(v) => {
          setA(v);
          setMoved(true);
        }}
      />
      {moved && (
        <View style={{ gap: 14 }}>
          <Prompt>{q.prompt}</Prompt>
          <Instruction>Tap an answer. You can keep moving the slider.</Instruction>
          <OptionList>
            {q.options.map((o) => (
              <OptionCard
                key={o.id}
                label={o.label}
                state={solved && o.id === sel ? 'right' : wrong.includes(o.id) ? (o.id === sel ? 'wrong' : 'dim') : solved ? 'dim' : 'idle'}
                disabled={solved || wrong.includes(o.id)}
                onPress={() => {
                  setSel(o.id);
                  if (!o.correct) setWrong((w) => [...w, o.id]);
                }}
              />
            ))}
          </OptionList>
          {solved && (
            <View style={styles.inline}>
              <Mark kind="ok" color={p.ok} size={18} />
              <Text style={[styles.inlineText, { color: p.okText }]}>{q.right}</Text>
            </View>
          )}
          {hint && <Text style={[styles.inlineText, { color: p.badText }]}>{hint}</Text>}
        </View>
      )}
    </Frame>
  );
}

const styles = StyleSheet.create({
  inline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  inlineText: { fontFamily: font.bodyMedium, fontSize: 17, lineHeight: 24 },
});
