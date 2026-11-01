// Design tokens. Colours carry meaning and are the same in every lesson.
export const colors = {
  background: '#FAFAF7',
  surface: '#FFFFFF',
  ink: '#14181F',
  inkMuted: '#4A5361',
  line: '#D9DCE1',
  velocity: '#1F5BFF', // motion / velocity
  acceleration: '#E8503A', // acceleration / force
  correct: '#0E8A5F',
  incorrect: '#C42B2B',
} as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 40 } as const;

export const radius = { sm: 8, md: 14, lg: 22 } as const;

export const minTouchTarget = 44;
