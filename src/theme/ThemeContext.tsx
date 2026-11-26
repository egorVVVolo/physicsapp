// The theme: light, dark, or following the phone (the default). The choice is kept in prefs/v1.
// Screens take their colours from `useTheme()` and never import `palette` from tokens directly;
// level colours go through `level()` so their text and tints stay readable on the dark page.
// Figures also take their material fills (`material`) and line weights (`stroke`) from here.
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { loadPrefs, savePrefs, type Prefs } from '@/session/storage';
import { themed } from './levelColor';
import { darkMaterial, darkPalette, darkSoft, material, palette, soft, stroke, type LevelColor, type Material, type Palette, type Soft } from './tokens';

export type ThemeMode = Prefs['mode'];
type Theme = {
  palette: Palette;
  material: Material;
  /** Figure style 3: the white sheet, its grid, and soft bodies with an edge of the same hue. */
  soft: Soft;
  stroke: typeof stroke;
  dark: boolean;
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  level: (c: LevelColor) => LevelColor;
  /**
   * Figure style 2.0, while it is being rolled out (V2 tasks C2–C8): `pick(now, before)` gives the new look, or the old
   * one on the "before / after" page (`classic`). Removed once every level has the new style.
   */
  classic: boolean;
  pick: <T>(now: T, before: T) => T;
};

const now = <T,>(n: T) => n;
const before = <T,>(_n: T, b: T) => b;

const light: Theme = { palette, material, soft, stroke, dark: false, mode: 'system', setMode: () => {}, level: (c) => c, classic: false, pick: now };
const ThemeCtx = createContext<Theme>(light);

export function useTheme(): Theme {
  return useContext(ThemeCtx);
}

function build(dark: boolean, mode: ThemeMode, setMode: (m: ThemeMode) => void, classic: boolean): Theme {
  return {
    palette: dark ? darkPalette : palette,
    material: dark ? darkMaterial : material,
    soft: dark ? darkSoft : soft,
    stroke,
    dark,
    mode,
    setMode,
    level: (c) => themed(c, dark),
    classic,
    pick: classic ? before : now,
  };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const scheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');
  useEffect(() => {
    loadPrefs().then((p) => setModeState(p.mode));
  }, []);
  const dark = mode === 'dark' || (mode === 'system' && scheme === 'dark');
  const value = useMemo<Theme>(
    () =>
      build(dark, mode, (m) => {
        setModeState(m);
        savePrefs({ mode: m });
      }, false),
    [dark, mode],
  );
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

/** For check pages only: the part inside is drawn in the given theme, and in the old figure style when `classic`. */
export function ThemeOverride({ dark, classic = false, children }: { dark: boolean; classic?: boolean; children: ReactNode }) {
  const outer = useTheme();
  const value = useMemo(() => build(dark, outer.mode, outer.setMode, classic), [dark, classic, outer.mode, outer.setMode]);
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

/** Inside a style-3 sheet "paper" is the sheet's white, so label patches and fills match it. */
export function CleanTheme({ children }: { children: ReactNode }) {
  const outer = useTheme();
  const value = useMemo(() => ({ ...outer, palette: { ...outer.palette, paper: outer.soft.paper, paperLine: outer.soft.grid } }), [outer]);
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}
