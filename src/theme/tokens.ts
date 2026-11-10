// Design tokens. Two candidate palettes for Egor to choose from (milestone 1).
// Stroke colours (arrows, curves) may be vivid; label text uses the *Text tokens,
// which pass 4.5:1 on both the scene and the surface. Checked by tokens.test.ts.

export type Palette = {
  name: string;
  bg: string; // screen background
  surface: string; // cards, answer buttons
  sky: string; // scene background
  ground: string; // ground band in scenes
  ink: string; // main text, structure lines
  muted: string; // secondary text, ticks
  line: string; // borders
  primary: string; // the one main button
  onPrimary: string;
  vel: string; // velocity strokes
  velText: string;
  acc: string; // acceleration strokes
  accText: string;
  event: string; // events, gaps, captions
  eventText: string;
  ghost: string; // learner's answer (ghost)
  ok: string;
  bad: string;
};

export const palettes = {
  A: {
    name: 'Sky',
    bg: '#F2F6FC',
    surface: '#FFFFFF',
    sky: '#DCEAFF',
    ground: '#E8D8B4',
    ink: '#0D1B2E',
    muted: '#4A5870',
    line: '#CBD6E6',
    primary: '#1748D6',
    onPrimary: '#FFFFFF',
    vel: '#0A5BEA',
    velText: '#0848BC',
    acc: '#E0530F',
    accText: '#A33A06',
    event: '#00876C',
    eventText: '#00614E',
    ghost: '#6A778C',
    ok: '#13703F',
    bad: '#C0262D',
  },
  B: {
    name: 'Ink',
    bg: '#F7F7F4',
    surface: '#FFFFFF',
    sky: '#FFFFFF',
    ground: '#D9DEE4',
    ink: '#111418',
    muted: '#4C535C',
    line: '#D6DADF',
    primary: '#111418',
    onPrimary: '#FFFFFF',
    vel: '#0050F0',
    velText: '#0045CC',
    acc: '#F05A0A',
    accText: '#A93F06',
    event: '#00A383',
    eventText: '#00705A',
    ghost: '#6E7680',
    ok: '#147A45',
    bad: '#C4232B',
  },
} satisfies Record<string, Palette>;

export type PaletteId = keyof typeof palettes;

export const type = {
  title: 22,
  body: 17,
  small: 15,
  label: 13,
} as const;

export const space = { xs: 4, s: 8, m: 12, l: 16, xl: 24 } as const;
export const radius = { s: 10, m: 14, l: 18 } as const;
export const touch = 44; // minimum touch target, pt

