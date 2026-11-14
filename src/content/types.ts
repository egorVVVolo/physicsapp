// The shape of lesson content. Content files have no React imports, so Node tests can load them.
//
// A lesson is a short story around one puzzle (docs/LESSON_FRAMEWORK.md, "Decisions of 11 Nov, night"):
// intro → screens with questions along the way → back to the puzzle → Skill check.
// Every screen has ONE focus: either text (at most two short paragraphs) or a figure with one sentence.
// Text limits are checked by src/content/rules.test.ts.

// ── Figures (drawn by src/figures from these numbers; up is positive) ─────────────────────

/** A person standing on bathroom scales inside a lift car. */
export type LiftFig = {
  kind: 'lift';
  m: number; // mass of the person, kg
  a: number; // acceleration of the lift, m s⁻² (up positive)
  /**
   * The lift is moving: the shaft slides past the car, driven by s = ut + ½at² from src/physics.
   * u is the velocity when the loop starts (up positive); the label sits by an outline arrow ("steady 2 m s⁻¹").
   * Without it the lift is at rest (or, on an explore screen, starts from rest with the slider's a).
   */
  motion?: { u: number; text: string };
  /** Which forces on the person are drawn. */
  forces: ('W' | 'N')[];
  /** Draw N as a dashed stub with "?" instead of its real length (the question asks about it). */
  unknownN?: true;
  /** Draw the acceleration of the lift (a double chevron). */
  showAcc?: true;
  /**
   * The scales display, in kg like real bathroom scales (N ÷ g). Hidden ("- - -") by default;
   * 'afterCheck' keeps it hidden until the question is answered, then shows it.
   */
  reading?: 'shown' | 'afterCheck';
  /** Write the size of each force next to its arrow, in N. */
  values?: true;
  /** Draw three candidate N arrows (shorter / equal to W / longer) to tap. Their ids are CANDIDATE_IDS. */
  candidates?: true;
  /** Write g in the sheet header next to m (the screen where W = mg is worked out). */
  showG?: true;
  /** Mark on the person where N acts: a dot in the middle of the soles and a short N arrow up from it. */
  nOnPerson?: true;
};

/** The person lifted off the scales ("exploded" view) with the forces on each body, for Newton's third law. */
export type PairsFig = {
  kind: 'pairs';
  m: number;
  /** Start with the bodies stacked together, move them apart, then grow the arrows (the first time the figure is met). */
  explode?: true;
};

/** A velocity–time graph of a lift trip, split into lettered parts of constant acceleration. */
export type VtFig = { kind: 'vt'; phases: { id: string; dt: number; a: number }[] };

/** A cutaway of the scales under a foot: the spring inside squashes and the display counts up. */
export type ScalesFig = { kind: 'scales'; m: number };

/** Two small lifts side by side: at rest, and accelerating at `a`. Used to show the puzzle solved. */
export type LiftPairFig = { kind: 'liftPair'; m: number; a: number };

/**
 * Throws from a balcony: the hand is `h` above the ground; ball A goes straight up at +u, ball B straight down at −u.
 * Up is positive. Positions and velocities come from s = ut + ½at² with a = −g (src/physics/kinematics).
 */
export type ThrowFig = {
  kind: 'throw';
  h: number; // height of the hand above the ground, m
  u: number; // speed of each throw, m s⁻¹
  balls: ('A' | 'B')[];
  /** Where ball A is while the figure stands still: just thrown, at the top, or falling back past the hand. */
  at?: 'hand' | 'top' | 'back';
  /** Write each velocity next to its arrow (and the speed each ball lands with). */
  values?: true;
  /** Make the "up is positive" axis stand out. */
  signs?: true;
  /** Draw the acceleration (a double chevron) and write it in the header. */
  showAcc?: true;
  /** Hide ball A's velocity: "v = ?" (the question asks about it). */
  unknownV?: true;
  /** Three acceleration candidates beside ball A at the top, to tap. Their ids are ACC_IDS. */
  candidates?: true;
  /** Faint copies of ball A every 0.1 s along its path so far, like a strobe photo. */
  trail?: true;
  /** Play the flights from where they stand down to the ground, again and again. 'afterCheck': still until answered. */
  play?: true | 'afterCheck';
};

/** The velocity–time graph of a ball thrown straight up at u, until time tEnd: one straight line through v = 0. */
export type ThrowVtFig = { kind: 'throwVt'; u: number; tEnd: number };

/** Core Practical 1: height fallen against time squared for a ball dropped from rest; a straight line of this gradient. */
export type FallGraphFig = { kind: 'fallGraph'; gradient: number };

export type Fig = LiftFig | PairsFig | VtFig | ScalesFig | LiftPairFig | ThrowFig | ThrowVtFig | FallGraphFig;

/** Tap targets drawn by a lift figure with `candidates`. */
export const CANDIDATE_IDS = ['shorter', 'equal', 'longer'] as const;
/** Tap targets drawn by the pairs figure. */
export const PAIR_IDS = ['W', 'P', 'E'] as const;
/** Tap targets drawn by a throw figure with `candidates`: the acceleration at the top. */
export const ACC_IDS = ['up', 'zero', 'down'] as const;

// ── Screens ──────────────────────────────────────────────────────────────────────────────

export type Option = {
  id: string;
  label: string;
  correct?: true;
  /** One line shown after a wrong first try (story questions only). */
  hint?: string;
};

type Base = { id: string };

/** First screen: a title, one or two sentences and a figure. */
export type IntroScreen = Base & { kind: 'intro'; title: string; body: string; fig: Fig };

/** Text only (≤ 2 short paragraphs, optional definition card), or a figure with one sentence. */
export type TextScreen = Base & {
  kind: 'text';
  body: string[]; // **word** marks the key words of the screen (bold)
  card?: { term: string; text: string };
  fig?: Fig;
};

/** A prediction: no right answer yet, no outcome. A later choice screen returns to it (`revisitOf`). */
export type PredictScreen = Base & {
  kind: 'predict';
  prompt: string;
  fig?: Fig;
  options: Option[];
  after: string; // the button label once an option is picked ("Let's find out")
};

/** A question with one right option. */
export type ChoiceScreen = Base & {
  kind: 'choice';
  prompt: string;
  fig?: Fig;
  options: Option[];
  why: string; // behind the "Why?" button, after the verdict
  /** Id of the predict screen this question returns to; the learner's earlier pick is shown. */
  revisitOf?: string;
};

/**
 * Play with the figure through a slider, then a light question (not counted in the tally).
 * The slider drives the lift's acceleration, or the time since the throw.
 */
export type ExploreScreen = Base & {
  kind: 'explore';
  instruction: string; // names the gesture: "Drag …"
  fig: LiftFig | ThrowFig;
  /**
   * `tick`: gap between the marks on the ruler (defaults to `step`). `symbol` and `dp` write the bubble ("t = 0.82 s"),
   * `signed` adds + to positive values. `start`: where the thumb begins (defaults to the lift's a, or `min`).
   */
  slider: { min: number; max: number; step: number; tick?: number; label: string; unit: string; symbol: string; dp: number; signed?: true; start?: number };
  question: { prompt: string; options: Option[]; right: string };
};

/** Answer by tapping something drawn on the figure. Option ids match the figure's tap targets. */
export type TapFigScreen = Base & {
  kind: 'tapFig';
  prompt: string;
  instruction: string; // names the gesture: "Tap …"
  fig: Fig;
  options: Option[];
  why: string;
};

export type Screen = IntroScreen | TextScreen | PredictScreen | ChoiceScreen | ExploreScreen | TapFigScreen;
export type Question = ChoiceScreen | TapFigScreen;

export type Lesson = {
  id: string;
  title: string;
  spec: number[]; // WPH11 specification points covered
  minutes: number;
  story: Screen[];
  /** Exam-level questions at the end: one try each, "Why?" only after the answer. */
  skillCheck: Question[];
  youCanNow: string[];
  /** The last screen: the puzzle, solved, as one figure with one sentence. */
  recap: { fig: Fig; text: string };
  /** The lesson's card in the Notebook: the formula to keep (≤ 24 characters) and the idea in words (≤ 110). */
  card: { formula: string; idea: string };
};

// ── Course map ───────────────────────────────────────────────────────────────────────────

/** `about`: one sentence on the map card saying what the lesson is about (shown for lessons not built yet too). */
export type LessonRef = { id: string; title: string; spec: number[]; ready: boolean; about: string };
export type Level = { id: string; title: string; lessons: LessonRef[] };
export type Course = { title: string; subtitle: string; levels: Level[] };

export const isQuestion = (s: Screen): s is Question => s.kind === 'choice' || s.kind === 'tapFig';
