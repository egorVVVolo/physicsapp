// Explore: drag the slider, the figure follows the model at once; then a light question with inline
// feedback ("That's right."). Not counted in the honest tally: it is part of learning, not a test.
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ExploreScreen } from '@/content/types';
import { fixed, signed } from '@/physics/format';
import { Sheet } from '@/figures/Sheet';
import { useTheme } from '@/theme/ThemeContext';
import { font } from '@/theme/tokens';
import { Mark, MainButton, OptionCard, OptionList } from '@/ui/parts';
import { Slider } from '@/ui/Slider';
import { feedback } from '@/ui/feedback';
import { Frame } from '../Frame';
import { Instruction, Prompt } from '../text';

export function ExploreView({ screen, figN, onNext }: { screen: ExploreScreen; figN: number; onNext: () => void }) {
  const { palette: p } = useTheme();
  const sl = screen.slider;
  const [value, setValue] = useState(sl.start ?? (screen.fig.kind === 'lift' ? screen.fig.a : sl.min));
  const [moved, setMoved] = useState(false);
  const [sel, setSel] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string[]>([]);
  const q = screen.question;
  const solved = sel !== null && q.options.find((o) => o.id === sel)?.correct === true;
  const hint = sel && !solved ? q.options.find((o) => o.id === sel)?.hint : null;

  return (
    <Frame fig={<Sheet fig={screen.fig} n={figN} live={value} />} footer={<MainButton label="Continue" onPress={onNext} disabled={!solved} />}>
      <Prompt>{screen.instruction}</Prompt>
      <Slider
        value={value}
        min={sl.min}
        max={sl.max}
        step={sl.step}
        tick={sl.tick}
        label={sl.label}
        format={(v) => `${sl.symbol} = ${sl.signed ? signed(v, sl.dp) : fixed(v, sl.dp)}${sl.unit === '°' ? '' : ' '}${sl.unit}`}
        formatEnd={(v) => (sl.signed ? signed(v, 0) : sl.unit === '°' ? `${fixed(v, 0)}°` : fixed(v, 1))}
        onChange={(v) => {
          feedback.step((v - sl.min) / (sl.max - sl.min));
          setValue(v);
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
                  if (o.correct) feedback.right();
                  else {
                    feedback.wrong();
                    setWrong((w) => [...w, o.id]);
                  }
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
