// The theme: light, dark, or following the phone (the default). The choice is kept in prefs/v1.
// Screens take their colours from `useTheme()` and never import `palette` from tokens directly;
// level colours go through `level()` so their text and tints stay readable on the dark page.
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { loadPrefs, savePrefs, type Prefs } from '@/session/storage';
import { themed } from './levelColor';
import { darkPalette, palette, type LevelColor, type Palette } from './tokens';

export type ThemeMode = Prefs['mode'];
type Theme = { palette: Palette; dark: boolean; mode: ThemeMode; setMode: (m: ThemeMode) => void; level: (c: LevelColor) => LevelColor };

const light: Theme = { palette, dark: false, mode: 'system', setMode: () => {}, level: (c) => c };
const ThemeCtx = createContext<Theme>(light);

export function useTheme(): Theme {
  return useContext(ThemeCtx);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const scheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');
  useEffect(() => {
    loadPrefs().then((p) => setModeState(p.mode));
  }, []);
  const dark = mode === 'dark' || (mode === 'system' && scheme === 'dark');
  const value = useMemo<Theme>(
    () => ({
      palette: dark ? darkPalette : palette,
      dark,
      mode,
      setMode: (m) => {
        setModeState(m);
        savePrefs({ mode: m });
      },
      level: (c) => themed(c, dark),
    }),
    [dark, mode],
  );
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}
