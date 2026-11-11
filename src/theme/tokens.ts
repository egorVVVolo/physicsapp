// Design tokens, "Blueprint" look (chosen by the owner on 11 Nov 2026).
// A light page (questions' answers, buttons, verdicts) around a dark-blue stage with a fine grid
// (the scene, the question on it). Colours carry meaning: velocity blue, acceleration coral,
// right green, wrong red. The stage has its own brighter twins, because it is dark.
// "*Text" colours are the twins used for text (≥ 4.5:1, checked by tokens.test.ts).

export type Palette = {
  page: string; // background
  ink: string; // main text
  muted: string; // secondary text
  faint: string; // hints, axis numbers
  line: string; // card borders
  lineStrong: string; // stronger borders, tracks
  grid: string; // the blueprint grid lines
  // the scene
  sky: string;
  ground: string;
  groundLine: string;
  // buttons (flat)
  primary: string;
  onPrimary: string;
  disabled: string;
  onDisabled: string;
  select: string; // ring around the chosen card / handle
  selectBg: string;
  // quantities
  vel: string;
  velText: string;
  acc: string;
  accText: string;
  // verdicts
  ok: string;
  okBg: string;
  okText: string;
  bad: string;
  badBg: string;
  badText: string;
  // things in the scene
  balloon: string;
  balloonLine: string;
  balloonShade: string;
  gore: string;
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

/** The page: everything outside the dark stage. */
export const palette: Palette = {
  page: '#F5F8FC',
  ink: '#13253F',
  muted: '#4B5D75',
  faint: '#56677E',
  line: '#D5DEEA',
  lineStrong: '#B6C4D6',
  grid: 'rgba(19,37,63,0.06)',
  sky: '#0F3B73',
  ground: '#0B2F5E',
  groundLine: '#9DB7DA',
  primary: '#0F3B73',
  onPrimary: '#FFFFFF',
  disabled: '#E3E9F1',
  onDisabled: '#56677E',
  select: '#1F5FAE',
  selectBg: '#E8F0FB',
  vel: '#1479C9',
  velText: '#0F64A8',
  acc: '#E4572E',
  accText: '#B4421C',
  ok: '#1F7F43',
  okBg: '#E8F5ED',
  okText: '#175C30',
  bad: '#CC3D3D',
  badBg: '#FBECEC',
  badText: '#962A2A',
  balloon: '#FFFFFF',
  balloonLine: '#DCE5F0',
  balloonShade: '#DCE5F0',
  gore: '#2F6DB5',
  kraft: '#D8A468',
  kraftLight: '#E8BE89',
  kraftDark: '#A97A45',
  sack: '#D2A66E',
  ghost: '#C9D8EC',
  rope: '#9DB7DA',
  burner: '#DCE5F0',
  flame: '#FFB02E',
  flameCore: '#FFE6A3',
};

/** The stage: the dark-blue scene and the question on it. Same keys, colours that read on dark blue. */
export const stage: Palette = {
  ...palette,
  page: '#1B4C8A', // fill of circles and pills drawn on the scene
  ink: '#FFFFFF',
  muted: '#C9D8EC',
  faint: '#A9C0DE',
  line: '#4C73A8',
  lineStrong: '#7E9FCB',
  grid: 'rgba(255,255,255,0.09)',
  select: '#FFFFFF',
  selectBg: '#1B4C8A',
  vel: '#5CC8FF',
  velText: '#8FDBFF',
  acc: '#FF8A65',
  accText: '#FFB199',
  ok: '#5FD38D',
  okBg: '#164B3A',
  okText: '#8FE3B0',
  bad: '#FF7A7A',
  badBg: '#5A2238',
  badText: '#FFA8A8',
};

/** Fonts: Space Grotesk for questions, titles and buttons; IBM Plex Sans for everything else. One family per weight. */
export const font = {
  display: 'SpaceGrotesk_700Bold',
  displaySemi: 'SpaceGrotesk_600SemiBold',
  body: 'IBMPlexSans_400Regular',
  bodyMedium: 'IBMPlexSans_500Medium',
  bodySemi: 'IBMPlexSans_600SemiBold',
  bodyBold: 'IBMPlexSans_700Bold',
  italic: 'IBMPlexSans_600SemiBold_Italic', // quantity letters: a, s, u, v, t
} as const;

export const radius = { s: 10, m: 12, l: 16 } as const;
export const touch = 44; // minimum touch target, pt
export const GRID = 20; // blueprint grid step, pt
