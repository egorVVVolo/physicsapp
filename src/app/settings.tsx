// Settings: sound, vibration, appearance, the phone's reduced-motion setting (shown, not changed here),
// and resetting progress (asked first in a sheet). Everything is kept on the device in prefs/v1.
// Send feedback stays hidden until there is a form to send it to.
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { uiIcon, type UiIconName } from '@/art/uiIcons';
import { CONTENT_MAX } from '@/lesson/Frame';
import { loadPrefs, loadProfile, resetProgress, savePrefs, type Prefs } from '@/session/storage';
import { sessionName } from '@/session/exam';
import { useTheme, type ThemeMode } from '@/theme/ThemeContext';
import { font, touch } from '@/theme/tokens';
import { Art } from '@/ui/Art';
import { feedback } from '@/ui/feedback';
import { useReducedMotionPref } from '@/ui/motion';
import { MainButton } from '@/ui/parts';
import { Switch } from '@/ui/Switch';

const MODES: { mode: ThemeMode; label: string }[] = [
  { mode: 'system', label: 'System' },
  { mode: 'light', label: 'Light' },
  { mode: 'dark', label: 'Dark' },
];

export default function Settings() {
  const { palette: p, mode, setMode } = useTheme();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotionPref();
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [asking, setAsking] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  useEffect(() => {
    loadPrefs().then(setPrefs);
  }, []);
  // the exam session, read again when coming back from changing it
  const [exam, setExam] = useState<string | null>(null);
  useFocusEffect(
    useCallback(() => {
      loadProfile().then((pr) => setExam(pr.exam));
    }, []),
  );

  const back = () => (router.canGoBack() ? router.back() : router.replace('/me'));
  const toggle = (key: 'sound' | 'haptics') => {
    if (!prefs) return;
    const value = !prefs[key];
    setPrefs({ ...prefs, [key]: value });
    savePrefs({ [key]: value });
    if (key === 'sound') feedback.setSound(value);
    else feedback.setHaptics(value);
    feedback.pick(); // you hear (or feel) the new setting at once
  };

  return (
    <View style={{ flex: 1, backgroundColor: p.page, paddingTop: insets.top }}>
      <View style={styles.column}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={back} hitSlop={4} style={styles.backButton}>
            <Art xml={uiIcon('back')} width={24} color={p.ink} />
          </Pressable>
          <Text accessibilityRole="header" style={[styles.heading, { color: p.ink }]}>
            Settings
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 32 }}>
        <View style={styles.list}>
          {prefs && (
            <View style={[styles.group, { borderColor: p.line }]}>
              <Row icon={prefs.sound ? 'soundOn' : 'soundOff'} label="Sound" onPress={() => toggle('sound')} switchOn={prefs.sound}>
                <Switch value={prefs.sound} />
              </Row>
              <Divider />
              <Row icon="haptics" label="Haptics" hint="Short vibrations on a phone" onPress={() => toggle('haptics')} switchOn={prefs.haptics}>
                <Switch value={prefs.haptics} />
              </Row>
            </View>
          )}

          <View style={[styles.group, { borderColor: p.line }]}>
            <View style={styles.row}>
              <Art xml={uiIcon(mode === 'dark' ? 'moon' : 'sun')} width={22} color={p.ink} />
              <Text style={[styles.label, { color: p.ink }]}>Appearance</Text>
            </View>
            <View style={styles.segments} accessibilityRole="radiogroup" accessibilityLabel="Appearance">
              {MODES.map((m) => {
                const chosen = m.mode === mode;
                return (
                  <Pressable
                    key={m.mode}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: chosen }}
                    aria-checked={chosen}
                    onPress={() => {
                      feedback.pick();
                      setMode(m.mode);
                    }}
                    style={[styles.segment, { borderColor: chosen ? p.select : p.line, backgroundColor: chosen ? p.selectBg : p.page }]}
                  >
                    <Text style={[styles.segmentText, { color: p.ink }]}>{m.label}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Divider />
            <View style={styles.row} accessible accessibilityLabel={`Reduced motion: ${reduced ? 'on' : 'off'}. Follows your phone's setting.`}>
              <Art xml={uiIcon('eye')} width={22} color={p.ink} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: p.ink }]}>Reduced motion</Text>
                <Text style={[styles.hint, { color: p.muted }]}>Follows your phone's setting</Text>
              </View>
              <Text style={[styles.value, { color: p.muted }]}>{reduced ? 'On' : 'Off'}</Text>
            </View>
          </View>

          <View style={[styles.group, { borderColor: p.line }]}>
            <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/onboarding/exam', params: { from: 'settings' } })} style={({ pressed }) => [styles.row, { opacity: pressed ? 0.6 : 1 }]}>
              <Art xml={uiIcon('info')} width={22} color={p.ink} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: p.ink }]}>Exam date</Text>
                <Text style={[styles.hint, { color: p.muted }]}>{exam ? sessionName(exam) : 'Not set'}</Text>
              </View>
              <Art xml={uiIcon('forward')} width={20} color={p.muted} />
            </Pressable>
          </View>

          <View style={[styles.group, { borderColor: p.line }]}>
            <Pressable accessibilityRole="button" onPress={() => setAsking(true)} style={({ pressed }) => [styles.row, { opacity: pressed ? 0.6 : 1 }]}>
              <Art xml={uiIcon('replay')} width={22} color={p.ink} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: p.ink }]}>Reset progress</Text>
                <Text style={[styles.hint, { color: p.muted }]}>{resetDone ? 'Done. Every lesson starts fresh.' : 'Lessons, notebook cards and momentum'}</Text>
              </View>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {asking && (
        <ResetSheet
          onKeep={() => setAsking(false)}
          onReset={async () => {
            await resetProgress();
            setAsking(false);
            setResetDone(true);
            AccessibilityInfo.announceForAccessibility('Progress reset');
          }}
        />
      )}
    </View>
  );
}

/** One settings row; with `switchOn` the whole row is the switch. */
function Row({ icon, label, hint, onPress, switchOn, children }: { icon: UiIconName; label: string; hint?: string; onPress: () => void; switchOn: boolean; children: ReactNode }) {
  const { palette: p } = useTheme();
  return (
    <Pressable accessibilityRole="switch" accessibilityLabel={label} accessibilityState={{ checked: switchOn }} aria-checked={switchOn} onPress={onPress} style={styles.row}>
      <Art xml={uiIcon(icon)} width={22} color={p.ink} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.label, { color: p.ink }]}>{label}</Text>
        {hint && <Text style={[styles.hint, { color: p.muted }]}>{hint}</Text>}
      </View>
      {children}
    </Pressable>
  );
}

function Divider() {
  const { palette: p } = useTheme();
  return <View style={[styles.divider, { backgroundColor: p.line }]} />;
}

const OUT = 200;

/** "Reset your progress?" Keeping it is the main button; resetting is the quiet text button. */
function ResetSheet({ onKeep, onReset }: { onKeep: () => void; onReset: () => void }) {
  const { palette: p } = useTheme();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotionPref();
  const k = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (!reduced) k.set(withTiming(1, { duration: 260, easing: Easing.out(Easing.cubic) }));
    AccessibilityInfo.announceForAccessibility('Reset your progress?');
  }, [k, reduced]);
  const close = (then: () => void) => {
    if (reduced) return then();
    k.set(withTiming(0, { duration: OUT, easing: Easing.in(Easing.cubic) }));
    setTimeout(then, OUT);
  };
  const scrim = useAnimatedStyle(() => ({ opacity: k.get() }));
  const sheet = useAnimatedStyle(() => ({ transform: [{ translateY: (1 - k.get()) * 320 }] }));
  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: p.scrim }, scrim]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => close(onKeep)} accessibilityLabel="Keep my progress" accessibilityRole="button" />
      </Animated.View>
      <Animated.View accessibilityViewIsModal style={[styles.sheet, { backgroundColor: p.page, paddingBottom: insets.bottom + 16 }, sheet]}>
        <View style={styles.sheetInner}>
          <Text style={[styles.sheetTitle, { color: p.ink }]} accessibilityRole="header">
            Reset your progress?
          </Text>
          <Text style={[styles.sheetText, { color: p.muted }]}>Every lesson, notebook card and day of momentum will be cleared. This can't be undone.</Text>
          <View style={styles.sheetButtons}>
            <MainButton label="Keep my progress" onPress={() => close(onKeep)} />
            <Pressable accessibilityRole="button" onPress={() => close(onReset)} style={({ pressed }) => [styles.quiet, { opacity: pressed ? 0.6 : 1 }]}>
              <Text style={[styles.quietText, { color: p.ink }]}>Reset</Text>
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  column: { width: '100%', maxWidth: CONTENT_MAX + 40, alignSelf: 'center', paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingTop: 8, paddingBottom: 12 },
  backButton: { width: 44, height: 44, marginLeft: -10, alignItems: 'center', justifyContent: 'center' },
  heading: { flex: 1, fontFamily: font.display, fontSize: 26, lineHeight: 32 },
  list: { width: '100%', maxWidth: CONTENT_MAX, alignSelf: 'center', gap: 16, paddingTop: 4 },
  group: { borderWidth: 2, borderRadius: 16, paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: touch + 16, paddingVertical: 10 },
  label: { flex: 1, fontFamily: font.bodySemi, fontSize: 17, lineHeight: 22 },
  hint: { fontFamily: font.body, fontSize: 14, lineHeight: 19, marginTop: 1 },
  value: { fontFamily: font.bodyMedium, fontSize: 16 },
  divider: { height: 1 },
  segments: { flexDirection: 'row', gap: 8, paddingBottom: 14 },
  segment: { flex: 1, minHeight: touch, borderWidth: 2, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  segmentText: { fontFamily: font.bodySemi, fontSize: 15 },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 24, paddingHorizontal: 20 },
  sheetInner: { width: '100%', maxWidth: CONTENT_MAX, alignSelf: 'center' },
  sheetTitle: { fontSize: 24, fontFamily: font.display },
  sheetText: { fontSize: 16, lineHeight: 23, fontFamily: font.bodyMedium, marginTop: 8 },
  sheetButtons: { marginTop: 22, gap: 6 },
  quiet: { minHeight: touch + 4, alignItems: 'center', justifyContent: 'center' },
  quietText: { fontSize: 17, fontFamily: font.displaySemi },
});
