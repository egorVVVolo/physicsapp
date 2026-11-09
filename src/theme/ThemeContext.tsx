import { createContext, useContext, useState, type ReactNode } from 'react';
import { palettes, type Palette, type PaletteId } from './tokens';

type ThemeValue = { palette: Palette; paletteId: PaletteId; setPaletteId: (id: PaletteId) => void };

const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [paletteId, setPaletteId] = useState<PaletteId>('A');
  return (
    <ThemeContext.Provider value={{ palette: palettes[paletteId], paletteId, setPaletteId }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used inside ThemeProvider');
  return value;
}
