import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import {
  IBMPlexSans_400Regular,
  IBMPlexSans_500Medium,
  IBMPlexSans_600SemiBold,
  IBMPlexSans_600SemiBold_Italic,
  IBMPlexSans_700Bold,
} from '@expo-google-fonts/ibm-plex-sans';
import { IBMPlexMono_500Medium, IBMPlexMono_600SemiBold } from '@expo-google-fonts/ibm-plex-mono';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '@/theme/ThemeContext';
import { loadPrefs } from '@/session/storage';
import { feedback } from '@/ui/feedback';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // the names here are the font families used in tokens.ts (`font`)
  const [loaded, error] = useFonts({
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    IBMPlexSans_400Regular,
    IBMPlexSans_500Medium,
    IBMPlexSans_600SemiBold,
    IBMPlexSans_600SemiBold_Italic,
    IBMPlexSans_700Bold,
    IBMPlexMono_500Medium,
    IBMPlexMono_600SemiBold,
  });
  const ready = loaded || error !== null; // if a font fails, show the app in the system font rather than nothing

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <Screens />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/** The status bar and the screens' background follow the theme. */
function Screens() {
  const { palette: p, dark } = useTheme();
  // sound and vibration as the learner left them in Settings
  useEffect(() => {
    loadPrefs().then((prefs) => {
      feedback.setSound(prefs.sound);
      feedback.setHaptics(prefs.haptics);
    });
  }, []);
  return (
    <>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: p.page } }}>
        <Stack.Screen name="(tabs)" />
        {/* a lesson rises over the map like a card and drops back down; no swipe-to-leave, only × (it asks first) */}
        <Stack.Screen name="lesson/[id]" options={{ animation: 'slide_from_bottom', gestureEnabled: false }} />
        <Stack.Screen name="practice/[mode]" options={{ animation: 'slide_from_bottom', gestureEnabled: false }} />
      </Stack>
    </>
  );
}
