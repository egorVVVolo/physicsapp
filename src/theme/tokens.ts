// Design tokens, "Brilliant + engineering drawing" look (owner's choice, 11 Nov 2026, night).
// A plain white page with ink text and one dark main button. The memorable part is the figure:
// every scene is a drawing sheet (pale drafting paper, FIG label, line art), and every FORCE is drawn
// in one signature colour, the course blue of the map. Other vectors are told apart by shape, not colour.
// "*Text" colours are the ones used for text (≥ 4.5:1, checked by tokens.test.ts).

export const palette = {
  page: '#FFFFFF',
  ink: '#1A1E25', // main text and the main button
  muted: '#4E5663', // secondary text
  faint: '#646C79', // hints, axis numbers
  line: '#DADFE5', // card borders
  lineStrong: '#B9C1CB',
  chipLine: '#E3E6EA', // the round chips of the map's top bar and the bottom card
  cardLip: '#D5DAE0', // the edge the map's bottom card stands on
  pillBg: 'rgba(0,0,0,0.07)', // a small secondary pill ("Why?")
  // the main button: dark pill with a bottom lip
  primary: '#1A1E25',
  primaryLip: '#000000',
  onPrimary: '#FFFFFF',
  disabled: '#ECEEF1',
  disabledLip: '#D2D7DE', // a disabled main button keeps a grey lip, so it still reads as a button
  onDisabled: '#5A626E',
  // answer cards
  select: '#2E66DB', // border of the chosen card (and of a chosen part of a figure): the course blue
  selectBg: '#E6EEFE',
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
  scrim: 'rgba(26,30,37,0.45)', // dims the screen behind a sheet that asks a question (Leave the lesson?)
  draw: '#2A3039', // line art
  drawFill: '#E2E6EB', // flat fills of bodies
  drawFillDark: '#C3CAD3',
  label: '#4E5663', // FIG labels and dimensions (mono)
  // the person and the scales in figures: quiet flat colours, never blue (blue means force)
  skin: '#EFD6C2',
  hair: '#3B4049',
  shirt: '#D9E0E9',
  trousers: '#59647A',
  shoe: '#2A3039',
  scalesTop: '#F3F5F8',
  scalesFront: '#C9D0DA',
  force: '#2E66DB', // every force, everywhere: the course blue of the map (12 Nov), so red only ever means "wrong"
  forceText: '#1F4FB8',
};

export type Palette = typeof palette;

/**
 * Colours of the course map, flat "vector 3D" (owner's pick, 12 Nov): every surface is one solid colour,
 * depth comes from facets, no gradients or gloss. One calm blue for the whole course.
 * main/lip: the Start button and its lip (white text) · soft: the wash behind the bottom card ·
 * face/side/inner: top, side band and centre of a puck · text: "Level 2", "Up next" on white.
 */
export type LevelColor = { main: string; lip: string; soft: string; face: string; side: string; inner: string; text: string };
export const courseBlue: LevelColor = {
  main: '#2E66DB',
  lip: '#1D47A3',
  soft: '#E6EEFE',
  face: '#3D7BF2',
  side: '#2556C4',
  inner: '#7CA6F7',
  text: '#1F4FB8',
};
/** Pucks of lessons that are not built yet: flat grey, same facets. */
export const soonGrey: LevelColor = { main: '#9CA3AD', lip: '#737B86', soft: '#EEF1F4', face: '#9CA3AD', side: '#737B86', inner: '#BCC2CA', text: '#646C79' };
/** The grey stand-in for the reward yellow: a level's object before it is earned. */
export const soonReward = { face: soonGrey.inner, side: soonGrey.side, lip: soonGrey.lip, pale: '#D7DBE0', soft: soonGrey.soft };

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

// ───────────────────────────────────────────────────────────────────────────────────────────────
// Design system v1 (12 Nov, docs/DESIGN.md). `levelPalette` is switched on in the app (13 Nov, task 1.1);
// `darkPalette` waits for task 5.1. The rest is switched on step by step (docs/DESIGN_TASKS.md).
// ───────────────────────────────────────────────────────────────────────────────────────────────

/**
 * One colour per level of the map: the colour means "where you are". Forces in figures and the chosen
 * answer stay course blue everywhere.
 */
export const levelPalette: Record<string, LevelColor> = {
  motion: courseBlue,
  forces: { main: '#6B4BD8', lip: '#4A30A8', soft: '#EEE9FD', face: '#7C5CF0', side: '#5A3CC4', inner: '#A996F7', text: '#5536BD' },
  'momentum-moments': { main: '#BF2D83', lip: '#8C1C5E', soft: '#FCE8F3', face: '#D8409A', side: '#A82572', inner: '#EC8CC4', text: '#A3216E' },
  energy: { main: '#C4500B', lip: '#933A05', soft: '#FDEBDD', face: '#E8651A', side: '#B5480A', inner: '#F6A36E', text: '#A84407' },
  fluids: { main: '#08808C', lip: '#055C66', soft: '#DDF4F6', face: '#0E9AA8', side: '#07707B', inner: '#6CCAD3', text: '#066E79' },
  materials: { main: '#4F7A00', lip: '#385700', soft: '#EDF5D9', face: '#639700', side: '#456B00', inner: '#A5CF4A', text: '#446900' },
};
/** The colour of each level of the map (design system v1, switched on 13 Nov). */
export const levelColors = levelPalette;

/**
 * The reward yellow: the only meaning is "you earned this" (stamps, the momentum top, sparks, a new
 * notebook card). Never a control, never body text (`text` is the dark twin for labels on white).
 */
export const reward = {
  face: '#FFC531',
  side: '#D99A00',
  lip: '#B87F00',
  pale: '#FFE38A',
  soft: '#FFF4CC',
  text: '#7A5200',
  on: '#1A1E25', // ink on the yellow
};
export type Reward = typeof reward;

/** Dark theme: the same keys as `palette`. The main button turns into a white pill; blue and the verdict colours get lighter twins. */
export const darkPalette: Palette = {
  page: '#101419',
  ink: '#F1F3F6',
  muted: '#B4BCC8',
  faint: '#98A1AE',
  line: '#2A313B',
  lineStrong: '#3A434F',
  chipLine: '#2A313B',
  cardLip: '#05070A',
  pillBg: 'rgba(255,255,255,0.1)',
  primary: '#F1F3F6',
  primaryLip: '#AEB6C2',
  onPrimary: '#1A1E25',
  disabled: '#232A33',
  disabledLip: '#171C23',
  onDisabled: '#9AA3B0',
  select: '#6C9BFF',
  selectBg: '#17264A',
  ok: '#3FB97A',
  okLip: '#2A8A58',
  okBg: '#12301F',
  okText: '#7FE0AC',
  bad: '#F0717A',
  badBg: '#3A161A',
  badText: '#FFA5AB',
  paper: '#171C23',
  paperLine: '#323A46',
  scrim: 'rgba(0,0,0,0.6)',
  draw: '#D7DCE3',
  drawFill: '#2B333E',
  drawFillDark: '#3B4552',
  label: '#B4BCC8',
  skin: '#EFD6C2',
  hair: '#8A919C',
  shirt: '#3A4554',
  trousers: '#7C89A3',
  shoe: '#D7DCE3',
  scalesTop: '#3A434F',
  scalesFront: '#2B333E',
  force: '#6C9BFF',
  forceText: '#8FB3FF',
};

/**
 * Figure style 2.0 (V2 plan 3.1): flat fills by material instead of grey, each with the thin ink outline of the
 * drawing. Never a saturated blue (force), green or red (verdict) or yellow (earned): tokens.test.ts checks the hues.
 * Heroes: A wears plum, B grey-teal; car A is plum, car B sand.
 */
export const material = {
  wood: '#D9A86C',
  woodSide: '#B98648',
  metal: '#B3BDC9',
  metalSide: '#8D99A8',
  rubber: '#2F343C',
  water: '#CFE8EF',
  waterLine: '#8CC7D6',
  plastic: '#EADCC6',
  plasticSide: '#CDB998',
  floor: '#E6E1D8',
  skinA: '#EBC8AA',
  skinB: '#A8754F',
  hairA: '#3B4049',
  hairB: '#6B4A2E',
  clothA: '#8C6A9F',
  clothB: '#5E8C87',
  trousers: '#4A5468',
  carA: '#8C6A9F',
  carB: '#CDB48E',
  ball: '#F2EEE6',
};
export type Material = typeof material;

/** The same materials on the dark sheet: darker, a little less saturated. */
export const darkMaterial: Material = {
  wood: '#9C7445',
  woodSide: '#7A5833',
  metal: '#6B7685',
  metalSide: '#525C69',
  rubber: '#0E1115',
  water: '#1D3D47',
  waterLine: '#3E7A8A',
  plastic: '#5A5243',
  plasticSide: '#463F33',
  floor: '#262C34',
  skinA: '#C9A285',
  skinB: '#8A5F40',
  hairA: '#14171C',
  hairB: '#4A321E',
  clothA: '#735885',
  clothB: '#4C736F',
  trousers: '#2E3544',
  carA: '#735885',
  carB: '#9C8868',
  ball: '#D9D4CA',
};

/** The three line weights of a figure: dimensions and grids, outlines of bodies, forces. No other numbers. */
export const stroke = { thin: 1.2, body: 1.8, force: 2.6 } as const;
export type Stroke = { thin: number; body: number; force: number };

/**
 * Motion tokens (ms). Interface eases out and never bounces; only drawn physical objects bounce, and they
 * follow the model. `stagger` is the delay between blocks that rise one after another.
 */
export const motion = {
  tap: 90, // press of a button or a card
  fast: 160, // small state changes: a chosen card, a toggle
  base: 240, // sheets, fades, the progress fill
  screen: 340, // a screen sliding in
  scene: 600, // a figure drawing itself, a colour flood
  celebrate: 900, // a stamp, a puck landing: once per lesson
  stagger: 60,
  /** cubic-bezier control points: out = entrances, inOut = moves, in = exits */
  easeOut: [0.22, 1, 0.36, 1],
  easeInOut: [0.65, 0, 0.35, 1],
  easeIn: [0.55, 0, 1, 0.45],
  /** springs (Reanimated withSpring): a sheet settles without a bounce, a pop overshoots once */
  springSheet: { damping: 22, stiffness: 240 },
  springPop: { damping: 9, stiffness: 220 },
} as const;
