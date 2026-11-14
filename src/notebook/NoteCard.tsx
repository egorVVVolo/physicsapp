// One card of the Notebook: the formula of a finished lesson on the face, the idea in words on the back.
// A tap turns it over (rotateY 0 → 180° in 500 ms); with reduced motion it simply changes sides.
// The back shows from 90° on, so the turn works the same on every platform, with or without backface culling.
// "Replay lesson" sits outside the turning card, so a screen reader reaches it as its own button.
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { uiIcon } from '@/art/uiIcons';
import { LessonTile } from '@/figures/LessonIcon';
import { useTheme } from '@/theme/ThemeContext';
import { font, type LevelColor } from '@/theme/tokens';
import { Art } from '@/ui/Art';
import { feedback } from '@/ui/feedback';
import { useReducedMotionPref } from '@/ui/motion';

const BORDER = 2;
const LIP = 4; // the darker bottom edge the card stands on
const REPLAY_H = 44;

type Props = {
  lessonId: string;
  levelId: string;
  title: string;
  card: { formula: string; idea: string };
  color: LevelColor;
  onReplay: () => void;
  onFlip?: () => void;
};

export function NoteCard({ lessonId, levelId, title, card, color, onReplay, onFlip }: Props) {
  const { palette: p } = useTheme();
  const reduced = useReducedMotionPref();
  const [flipped, setFlipped] = useState(false);
  const [backH, setBackH] = useState(0); // height of the back's words, so the card is tall enough for both sides
  const rot = useSharedValue(0);

  const turn = () => {
    const next = !flipped;
    setFlipped(next);
    feedback.pick();
    onFlip?.();
    const to = next ? 180 : 0;
    rot.set(reduced ? to : withTiming(to, { duration: 500, easing: Easing.inOut(Easing.cubic) }));
  };

  const front = useAnimatedStyle(() => ({ opacity: rot.get() < 90 ? 1 : 0, transform: [{ perspective: 900 }, { rotateY: `${rot.get()}deg` }] }));
  const back = useAnimatedStyle(() => ({ opacity: rot.get() >= 90 ? 1 : 0, transform: [{ perspective: 900 }, { rotateY: `${rot.get() - 180}deg` }] }));
  const replay = useAnimatedStyle(() => ({ opacity: Math.min(1, Math.max(0, (rot.get() - 150) / 30)) }));

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={flipped ? card.idea : `${card.formula}. ${title}`}
        accessibilityHint="Turns the card over"
        onPress={turn}
      >
        <Animated.View style={[styles.side, { backgroundColor: p.page, borderColor: p.line, minHeight: backH }, front]}>
          <View style={[styles.strip, { backgroundColor: color.main }]} />
          <View style={styles.faceRow}>
            <LessonTile lessonId={lessonId} levelId={levelId} color={color} size={56} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.formula, { color: p.ink }]} maxFontSizeMultiplier={1.3}>
                {card.formula}
              </Text>
              <Text style={[styles.title, { color: p.muted }]} maxFontSizeMultiplier={1.3}>
                {title}
              </Text>
            </View>
          </View>
        </Animated.View>
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.side, { backgroundColor: color.soft, borderColor: color.main }, back]}>
          <View onLayout={(e) => setBackH(e.nativeEvent.layout.height + BORDER + LIP)}>
            <Text style={[styles.idea, { color: p.ink }]} maxFontSizeMultiplier={1.3}>
              {card.idea}
            </Text>
            <View style={{ height: REPLAY_H }} />
          </View>
        </Animated.View>
      </Pressable>
      {flipped && (
        <Animated.View style={[styles.replayWrap, replay]}>
          <Pressable accessibilityRole="button" accessibilityLabel={`Replay ${title}`} onPress={onReplay} hitSlop={6} style={styles.replay}>
            <Art xml={uiIcon('replay')} width={20} color={color.text} />
            <Text style={[styles.replayText, { color: color.text }]} maxFontSizeMultiplier={1.3}>
              Replay lesson
            </Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  side: { borderRadius: 16, borderWidth: BORDER, borderBottomWidth: LIP, overflow: 'hidden', backfaceVisibility: 'hidden' },
  strip: { height: 8 },
  faceRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 16 },
  formula: { fontFamily: font.display, fontSize: 21, lineHeight: 26 },
  title: { fontFamily: font.bodyMedium, fontSize: 14, lineHeight: 19, marginTop: 4 },
  idea: { fontFamily: font.body, fontSize: 16, lineHeight: 22, paddingHorizontal: 16, paddingTop: 16 },
  replayWrap: { position: 'absolute', left: 8, bottom: LIP + 8 },
  replay: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: REPLAY_H, paddingHorizontal: 8 },
  replayText: { fontFamily: font.bodySemi, fontSize: 16 },
});
