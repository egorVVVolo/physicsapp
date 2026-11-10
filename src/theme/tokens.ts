// Design tokens. One theme: a dark stage for the scene, a light sheet for the controls.
// Colours carry meaning (velocity cyan, acceleration coral, right green, wrong rose); everything else is neutral.
// "*Text" colours are the darker twins used for text on the light sheet (≥ 4.5:1, checked by tokens.test.ts).

export type Palette = {
  // the stage (scene + question)
  stage: string;
  stageGround: string;
  stageGroundLine: string;
  stageText: string; // question text on the stage
  stageMuted: string; // dimension labels, tag text
  stageDim: string; // ghost labels, ruler
  // the sheet (controls) and neutrals
  sheet: string;
  card: string; // answer cards
  line: string; // borders on the sheet
  ink: string; // text on the sheet
  muted: string; // secondary text on the sheet
  primary: string; // the one main button
  onPrimary: string;
  disabled: string;
  onDisabled: string;
  // quantities
  vel: string; // velocity strokes on the stage
  velText: string; // velocity on the light sheet
  acc: string; // acceleration strokes on the stage
  accText: string;
  // verdicts
  ok: string;
  okBg: string;
  bad: string;
  badBg: string;
  // things in the scene
  balloon: string;
  balloonShade: string;
  kraft: string;
  kraftLight: string;
  kraftDark: string;
  sack: string;
  ghost: string;
  rope: string;
  burner: string;
  flame: string;
  flameCore: string;
};

export const palette: Palette = {
  stage: '#0E1A2B',
  stageGround: '#132338',
  stageGroundLine: '#5F7FA3',
  stageText: '#FFFFFF',
  stageMuted: '#C6D4E6',
  stageDim: '#9FB4CD',
  sheet: '#F3F5F9',
  card: '#FFFFFF',
  line: '#D5DCE6',
  ink: '#0E1A2B',
  muted: '#4A5870',
  primary: '#0E1A2B',
  onPrimary: '#FFFFFF',
  disabled: '#C9D2DE',
  onDisabled: '#445267',
  vel: '#3DC6FF',
  velText: '#0A6EA3',
  acc: '#FF7A59',
  accText: '#B8401F',
  ok: '#167A4B',
  okBg: '#DDF3E7',
  bad: '#C0263F',
  badBg: '#FBE1E5',
  balloon: '#EEF3F9',
  balloonShade: '#C5D3E4',
  kraft: '#D8A468',
  kraftLight: '#E8BE89',
  kraftDark: '#BF8449',
  sack: '#D2A66E',
  ghost: '#8FA6C2',
  rope: '#8FA4BE',
  burner: '#2A3B55',
  flame: '#FFB02E',
  flameCore: '#FFE6A3',
};

export const type = {
  title: 23,
  body: 16,
  small: 14,
  label: 13,
} as const;

export const space = { xs: 4, s: 8, m: 12, l: 16, xl: 24 } as const;
export const radius = { s: 10, m: 14, l: 16, sheet: 26 } as const;
export const touch = 44; // minimum touch target, pt
