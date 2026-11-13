// Screens without a graded answer: intro, text, prediction and the Skill check splash.
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { IntroScreen, PredictScreen, TextScreen } from '@/content/types';
import { Sheet } from '@/figures/Sheet';
import { font, motion, type LevelColor } from '@/theme/tokens';
import { CloseIcon, MainButton, OptionCard, OptionList } from '@/ui/parts';
import { Rise, useReducedMotionPref } from '@/ui/motion';
import { feedback } from '@/ui/feedback';
import { CONTENT_MAX, Frame } from '../Frame';
import { Body, Prompt, TermCard, Title } from '../text';

export function IntroView({ screen, figN, onNext }: { screen: IntroScreen; figN: number; onNext: () => void }) {
  return (
    <Frame footer={<MainButton label="Start" onPress={onNext} />}>
      <Sheet fig={screen.fig} n={figN} />
      <Title>{screen.title}</Title>
      <Body>{screen.body}</Body>
    </Frame>
  );
}

export function TextView({ screen, figN, onNext }: { screen: TextScreen; figN: number; onNext: () => void }) {
  return (
    <Frame footer={<MainButton label="Continue" onPress={onNext} />}>
      {screen.fig && <Sheet fig={screen.fig} n={figN} />}
      {screen.body.map((para, i) => (
        <Body key={i}>{para}</Body>
      ))}
      {screen.card && <TermCard term={screen.card.term} text={screen.card.text} />}
    </Frame>
  );
}

/** A prediction: any pick is fine. Once picked, the button says what comes next ("Let's find out").
 * The pick is kept and shown again when the story comes back to it. */
export function PredictView({ screen, figN, picked, onPick, onNext }: { screen: PredictScreen; figN: number; picked?: string; onPick: (id: string) => void; onNext: () => void }) {
  const [sel, setSel] = useState<string | null>(picked ?? null);
  return (
    <Frame footer={<MainButton label={sel ? screen.after : 'Continue'} onPress={onNext} disabled={!sel} />}>
      <Prompt>{screen.prompt}</Prompt>
      {screen.fig && <Sheet fig={screen.fig} n={figN} />}
      <OptionList grid>
        {screen.options.map((o) => (
          <View key={o.id} style={styles.half}>
            <OptionCard
              compact
              label={o.label}
              state={sel === o.id ? 'selected' : 'idle'}
              onPress={() => {
                feedback.pick();
                setSel(o.id);
                onPick(o.id);
              }}
            />
          </View>
        ))}
      </OptionList>
    </Frame>
  );
}

const FLOOD_EASE = Easing.inOut(Easing.cubic);
const RING_FALL = 180; // each ring drops in, one after another
const BUTTON_H = 54 + 4; // MainButton height with its lip

/**
 * The Skill check begins: the level colour floods the whole player from the button,
 * then the title, the rule and one ring per question appear, and a white Start button.
 */
export function CheckIntroView({ count, color, onNext, onClose }: { count: number; color: LevelColor; onNext: () => void; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const reduced = useReducedMotionPref();
  const R = 1.2 * height;
  // the circle grows from the centre of the button at the bottom
  const fromBottom = insets.bottom + 16 + BUTTON_H / 2;
  const after = reduced ? 0 : motion.scene; // the content waits for the flood
  const ringsAt = after + 420;

  const k = useSharedValue(0);
  useEffect(() => {
    feedback.flood();
  }, []);
  useEffect(() => {
    k.set(reduced ? 1 : withTiming(1, { duration: motion.scene, easing: FLOOD_EASE }));
  }, [k, reduced]);
  // one rising tick per ring as it lands
  useEffect(() => {
    if (reduced) return;
    const timers = Array.from({ length: count }, (_, i) => setTimeout(() => feedback.step(i / count), ringsAt + i * RING_FALL));
    return () => timers.forEach(clearTimeout);
  }, [count, reduced, ringsAt]);
  const flood = useAnimatedStyle(() => ({ transform: [{ scale: k.get() }] }));

  return (
    <View style={styles.splash}>
      <Animated.View style={[styles.flood, { width: 2 * R, height: 2 * R, borderRadius: R, marginLeft: -R, bottom: fromBottom - R, backgroundColor: color.main }, flood]} />
      <Pressable accessibilityRole="button" accessibilityLabel="Close the lesson" onPress={onClose} hitSlop={8} style={[styles.splashClose, { top: insets.top + 6 }]}>
        <CloseIcon color="#FFFFFF" size={20} />
      </Pressable>
      <View style={styles.splashBody}>
        <Rise delay={after}>
          <Text style={styles.splashTitle} accessibilityRole="header">
            Skill check
          </Text>
        </Rise>
        <Rise delay={after + 70}>
          <Text style={styles.splashLead}>{`${count} questions. One try each.`}</Text>
        </Rise>
        <View style={styles.rings} accessible accessibilityLabel={`${count} questions`}>
          {Array.from({ length: count }, (_, i) => (
            <Ring key={i} delay={ringsAt + i * RING_FALL} />
          ))}
        </View>
      </View>
      <Rise delay={ringsAt + count * RING_FALL + 80} style={[styles.splashFooter, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.splashColumn}>
          <MainButton label="Start" tone="white" onPress={onNext} />
        </View>
      </Rise>
    </View>
  );
}

/** One white ring for one question: drops 16 pt into place. */
function Ring({ delay }: { delay: number }) {
  const reduced = useReducedMotionPref();
  const k = useSharedValue(0);
  useEffect(() => {
    k.set(reduced ? 1 : withDelay(delay, withTiming(1, { duration: RING_FALL, easing: Easing.out(Easing.cubic) })));
  }, [k, delay, reduced]);
  const style = useAnimatedStyle(() => ({ opacity: k.get(), transform: [{ translateY: (k.get() - 1) * 16 }] }));
  return <Animated.View style={[styles.ring, style]} />;
}

const styles = StyleSheet.create({
  half: { flexBasis: '47%', flexGrow: 1 },
  splash: { flex: 1, overflow: 'hidden' },
  flood: { position: 'absolute', left: '50%' },
  splashClose: { position: 'absolute', left: 12, width: 44, height: 44, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  splashBody: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 24 },
  splashTitle: { fontFamily: font.display, fontSize: 30, lineHeight: 33, color: '#FFFFFF', textAlign: 'center' },
  splashLead: { fontFamily: font.body, fontSize: 16, lineHeight: 24, color: '#FFFFFF', textAlign: 'center' },
  rings: { flexDirection: 'row', gap: 12, marginTop: 18 },
  ring: { width: 16, height: 16, borderRadius: 8, borderWidth: 2.5, borderColor: '#FFFFFF' },
  splashFooter: { paddingHorizontal: 20, paddingTop: 8 },
  splashColumn: { width: '100%', maxWidth: CONTENT_MAX, alignSelf: 'center' },
});
