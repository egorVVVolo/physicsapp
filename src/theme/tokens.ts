// Design tokens. Dark base; colours carry meaning and are the same in every lesson.
export const colors = {
  background: '#12141A',
  surface: '#1B1F29',
  surfaceRaised: '#262B37',
  surfaceEdge: '#0C0E13', // bottom edge of raised buttons
  ink: '#F4F6FA',
  inkMuted: '#A9B1C1',
  line: '#2E3441',
  axis: '#8993A6',
  velocity: '#4C8DFF', // motion / velocity
  acceleration: '#FF7A59', // acceleration / force
  backward: '#2DD4BF', // area and motion below zero (going backwards)
  accent: '#FFC53D', // main button and progress
  accentEdge: '#C9921A',
  onAccent: '#14181F',
  correct: '#34D399',
  correctEdge: '#1E9C70',
  correctBg: '#0E3A2B',
  incorrect: '#FF6B6B',
  incorrectBg: '#3F1A1F',
} as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 40 } as const;

export const radius = { sm: 8, md: 14, lg: 22 } as const;

export const minTouchTarget = 44;
