// Text styles of the lesson: reading text is large and calm, titles are Space Grotesk.
import { StyleSheet, Text, View, type TextProps } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { font } from '@/theme/tokens';

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

/** A definition or formula worth keeping: a framed card on drafting paper. */
export function TermCard({ term, text }: { term: string; text: string }) {
  const { palette: p } = useTheme();
  return (
    <View style={[t.card, { borderColor: p.paperLine, backgroundColor: p.paper }]}>
      <Text style={[t.term, { color: p.ink }]}>{term}</Text>
      <Text style={[t.cardText, { color: p.ink }]}>{text}</Text>
    </View>
  );
}

const t = StyleSheet.create({
  title: { fontFamily: font.display, fontSize: 32, lineHeight: 38, letterSpacing: -0.4 },
  body: { fontFamily: font.body, fontSize: 19, lineHeight: 29 },
  prompt: { fontFamily: font.displaySemi, fontSize: 21, lineHeight: 28, letterSpacing: -0.1 },
  key: { fontFamily: font.bodyBold },
  instruction: { fontFamily: font.bodyMedium, fontSize: 15, lineHeight: 21, marginTop: -8 },
  card: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 18, paddingVertical: 16, gap: 6 },
  term: { fontFamily: font.display, fontSize: 19 },
  cardText: { fontFamily: font.body, fontSize: 17, lineHeight: 25 },
});
