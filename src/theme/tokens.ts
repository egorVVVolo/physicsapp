// Design tokens. One light theme in the spirit of Brilliant and Duolingo, kept adult:
// white page, a pale sky for the scene, ink-navy main button, muted green/red verdicts.
// Colours carry meaning: velocity blue, acceleration coral, right green, wrong red, selection blue.
// "*Text" colours are the darker twins used for text (≥ 4.5:1, checked by tokens.test.ts).

export type Palette = {
  page: string; // screen background
  ink: string; // main text
  muted: string; // secondary text
  faint: string; // hints, axis numbers
  line: string; // card borders
  lineStrong: string; // card bottom lip, track
  // the scene
  sky: string;
  ground: string;
  groundLine: string;
  // buttons (chunky, with a darker bottom lip)
  primary: string;
  primaryLip: string;
  onPrimary: string;
  disabled: string;
  disabledLip: string;
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
  okLip: string;
  okBg: string;
  okText: string;
  bad: string;
  badLip: string;
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

export const palette: Palette = {
  page: '#FFFFFF',
  ink: '#172033',
  muted: '#545F72',
  faint: '#5F6A7B',
  line: '#E2E6EC',
  lineStrong: '#CDD4DE',
  sky: '#EDF3F9',
  ground: '#E1E7EE',
  groundLine: '#7A8BA0',
  primary: '#1F2A44',
  primaryLip: '#0C1322',
  onPrimary: '#FFFFFF',
  disabled: '#E7EAEF',
  disabledLip: '#D3D9E1',
  onDisabled: '#5F6A7C',
  select: '#2563EB',
  selectBg: '#EEF4FF',
  vel: '#1479C9',
  velText: '#0F64A8',
  acc: '#E4572E',
  accText: '#B4421C',
  ok: '#1F7F43',
  okLip: '#176A37',
  okBg: '#E8F5ED',
  okText: '#175C30',
  bad: '#CC3D3D',
  badLip: '#A12E2E',
  badBg: '#FBECEC',
  badText: '#962A2A',
  balloon: '#FFFFFF',
  balloonLine: '#AEBBCC',
  balloonShade: '#DCE5F0',
  gore: '#FF7A59',
  kraft: '#D8A468',
  kraftLight: '#E8BE89',
  kraftDark: '#A97A45',
  sack: '#D2A66E',
  ghost: '#7D8899',
  rope: '#8597B0',
  burner: '#2A3B55',
  flame: '#FFB02E',
  flameCore: '#FFE6A3',
};

export const radius = { s: 10, m: 14, l: 18 } as const;
export const touch = 44; // minimum touch target, pt
