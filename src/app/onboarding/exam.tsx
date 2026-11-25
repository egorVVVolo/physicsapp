// "When is your Unit 1 exam?": the three next sessions from today and "Not sure yet". Home counts the days to it.
// From onboarding, Continue goes straight into the first lesson; from Settings (?from=settings) it goes back.
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CONTENT_MAX } from '@/lesson/Frame';
import { nextSessions } from '@/session/exam';
import { readyRefs } from '@/session/progress';
import { loadProfile, saveProfile } from '@/session/storage';
import { useTheme } from '@/theme/ThemeContext';
import { font } from '@/theme/tokens';
import { feedback } from '@/ui/feedback';
import { MainButton, OptionCard, OptionList } from '@/ui/parts';

const NOT_SURE = 'not-sure';

export default function ExamDate() {
  const { from } = useLocalSearchParams<{ from?: string }>();
  const { palette: p } = useTheme();
  const insets = useSafeAreaInsets();
  const sessions = nextSessions(new Date());
  const [pick, setPick] = useState<string | null>(null);
  useEffect(() => {
    loadProfile().then((pr) => pr.exam && setPick(pr.exam));
  }, []);

  const done = async () => {
    await saveProfile({ onboarded: true, exam: pick === NOT_SURE ? null : pick });
    if (from === 'settings') router.canGoBack() ? router.back() : router.replace('/me');
    else {
      // onboarding is over: the tabs become the bottom of the stack, and the first lesson opens over them (× → Home)
      if (router.canDismiss()) router.dismissAll();
      router.replace('/');
      router.push(`/lesson/${readyRefs[0].r.id}`);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: p.page, paddingTop: insets.top + 40, paddingBottom: insets.bottom + 16 }]}>
      <View style={[styles.column, { gap: 20 }]}>
        <Text accessibilityRole="header" style={[styles.title, { color: p.ink }]}>
          When is your Unit 1 exam?
        </Text>
        <Text style={[styles.line, { color: p.muted }]}>We count the days for you. You can change it later in Settings.</Text>
        <OptionList>
          {[...sessions.map((s) => ({ id: s.key, label: s.name })), { id: NOT_SURE, label: 'Not sure yet' }].map((o) => (
            <OptionCard
              key={o.id}
              label={o.label}
              state={pick === o.id ? 'selected' : 'idle'}
              onPress={() => {
                feedback.pick();
                setPick(o.id);
              }}
            />
          ))}
        </OptionList>
      </View>
      <View style={styles.column}>
        <MainButton label="Continue" onPress={done} disabled={!pick} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 20, justifyContent: 'space-between' },
  column: { width: '100%', maxWidth: CONTENT_MAX, alignSelf: 'center' },
  title: { fontFamily: font.display, fontSize: 30, lineHeight: 36 },
  line: { fontFamily: font.body, fontSize: 16, lineHeight: 23 },
});
