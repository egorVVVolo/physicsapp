import { palette, type Palette } from './tokens';

/** One theme for the whole app. Kept as a hook so screens do not import tokens directly (dark mode later). */
export function useTheme(): { palette: Palette } {
  return { palette };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
