// Design tokens, "Brilliant + engineering drawing" look (owner's choice, 11 Nov 2026, night).
// A plain white page with ink text and one dark main button. The memorable part is the figure:
// every scene is a drawing sheet (pale drafting paper, FIG label, line art), and every FORCE is drawn
// in one signature colour, like a reviewer's red pen. Other vectors are told apart by shape, not colour.
// "*Text" colours are the ones used for text (≥ 4.5:1, checked by tokens.test.ts).

export const palette = {
  page: '#FFFFFF',
  ink: '#1A1E25', // main text and the main button
  muted: '#4E5663', // secondary text
  faint: '#646C79', // hints, axis numbers
  line: '#DADFE5', // card borders
  lineStrong: '#B9C1CB',
  // the main button: dark pill with a bottom lip
  primary: '#1A1E25',
  primaryLip: '#000000',
  onPrimary: '#FFFFFF',
  disabled: '#ECEEF1',
  onDisabled: '#5A626E',
  // answer cards
  select: '#1A1E25', // border of the chosen card
  selectBg: '#F2F4F6',
  // verdicts
  ok: '#1B7F45',
  okLip: '#12592F',
  okBg: '#DFF3E6',
  okText: '#145C33',
  bad: '#C2303A',
  badBg: '#FCE7E8',
  badText: '#9A2129',
  // the drawing sheet
  paper: '#F4F6F8',
  paperLine: '#C9D0D8',
  draw: '#2A3039', // line art
  drawFill: '#E2E6EB', // flat fills of bodies
  drawFillDark: '#C3CAD3',
  label: '#4E5663', // FIG labels and dimensions (mono)
  force: '#C8124F', // every force, everywhere
  forceText: '#B0103F',
};

export type Palette = typeof palette;

/** One colour per level of the course map. Forces use the signature force colour. */
export const levelColors: Record<string, { main: string; lip: string; soft: string }> = {
  motion: { main: '#2563C9', lip: '#1A4794', soft: '#E4EDFB' },
  forces: { main: '#C8124F', lip: '#8F0C38', soft: '#FBE4EC' },
  'momentum-moments': { main: '#0E7C74', lip: '#095852', soft: '#DDF2F0' },
  energy: { main: '#B4570A', lip: '#7F3D07', soft: '#FBEBDD' },
  fluids: { main: '#0B6FA4', lip: '#084F75', soft: '#DDEFF8' },
  materials: { main: '#4D6170', lip: '#36444F', soft: '#E6EBEF' },
};

/** Space Grotesk: titles, questions, buttons. IBM Plex Sans: reading text. IBM Plex Mono: labels inside figures only. */
export const font = {
  display: 'SpaceGrotesk_700Bold',
  displaySemi: 'SpaceGrotesk_600SemiBold',
  body: 'IBMPlexSans_400Regular',
  bodyMedium: 'IBMPlexSans_500Medium',
  bodySemi: 'IBMPlexSans_600SemiBold',
  bodyBold: 'IBMPlexSans_700Bold',
  italic: 'IBMPlexSans_600SemiBold_Italic',
  mono: 'IBMPlexMono_500Medium',
  monoBold: 'IBMPlexMono_600SemiBold',
} as const;

export const radius = { s: 10, m: 14, pill: 999 } as const;
export const touch = 44; // minimum touch target, pt
export const LIP = 4; // height of the bottom lip under main buttons and the picked card
