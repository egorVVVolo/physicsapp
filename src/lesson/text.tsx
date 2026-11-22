// Text styles of the lesson: reading text is large and calm, titles are Space Grotesk.
import { StyleSheet, Text, View, type TextProps } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { font, radius } from '@/theme/tokens';
import { splitFormula } from './formula';

export { splitFormula };

export function Title({ children }: { children: string }) {
  const { palette: p } = useTheme();
  return <Text accessibilityRole="header" style={[t.title, { color: p.ink }]}>{children}</Text>;
}

/** Reading text. Words wrapped in **double stars** are the key words of the screen and are set in bold. */
export function Body({ children, style, ...rest }: TextProps & { children: string }) {
  const { palette: p } = useTheme();
  return (
    <Text {...rest} style={[t.body, { color: p.ink }, style]}>
      {children.split('**').map((part, i) => (i % 2 === 1 ? <Text key={i} style={t.key}>{part}</Text> : part))}
    </Text>
  );
}

/** The question itself: the first thing to read on a question screen. */
export function Prompt({ children }: { children: string }) {
  const { palette: p } = useTheme();
  return <Text accessibilityRole="header" style={[t.prompt, { color: p.ink }]}>{children}</Text>;
}

/** How to answer ("Tap …", "Drag …"): one quiet line. */
export function Instruction({ children }: { children: string }) {
  const { palette: p } = useTheme();
  return <Text style={[t.instruction, { color: p.muted }]}>{children}</Text>;
}

/** A definition worth keeping, as a callout on a drawing: drafting paper, a line-art bar on the left, a DEFINITION label.
 * A formula at the start of the text gets a line of its own. */
export function TermCard({ term, text }: { term: string; text: string }) {
  const { palette: p } = useTheme();
  const { formula, rest } = splitFormula(text);
  return (
    <View style={[t.card, { backgroundColor: p.paper, borderLeftColor: p.draw }]}>
      <Text style={[t.cardLabel, { color: p.label }]}>DEFINITION</Text>
      <Text style={[t.term, { color: p.ink }]}>{term}</Text>
      {formula && <Text style={[t.formula, { color: p.ink }]}>{formula}</Text>}
      {rest !== '' && <Text style={[t.cardText, { color: p.ink }]}>{rest}</Text>}
    </View>
  );
}

const t = StyleSheet.create({
  title: { fontFamily: font.display, fontSize: 32, lineHeight: 38, letterSpacing: -0.4 },
  body: { fontFamily: font.body, fontSize: 19, lineHeight: 29 },
  prompt: { fontFamily: font.displaySemi, fontSize: 21, lineHeight: 28, letterSpacing: -0.1 },
  key: { fontFamily: font.bodyBold },
  instruction: { fontFamily: font.bodyMedium, fontSize: 15, lineHeight: 21, marginTop: -8 },
  card: { borderLeftWidth: 3, borderTopRightRadius: radius.m, borderBottomRightRadius: radius.m, paddingHorizontal: 18, paddingVertical: 14, gap: 6 },
  cardLabel: { fontFamily: font.mono, fontSize: 11, letterSpacing: 1.2 },
  term: { fontFamily: font.display, fontSize: 20, lineHeight: 26 },
  formula: { fontFamily: font.display, fontSize: 22, lineHeight: 30 },
  cardText: { fontFamily: font.body, fontSize: 15, lineHeight: 22 },
});
