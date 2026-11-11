import { palette, stage, type Palette } from './tokens';

/**
 * One theme for the whole app. Kept as a hook so screens do not import tokens directly.
 * `palette` is for the light page; `stage` is for anything drawn on the dark-blue scene.
 */
export function useTheme(): { palette: Palette; stage: Palette } {
  return { palette, stage };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
