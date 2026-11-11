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
  /** The way the lift is moving, drawn as an outline arrow with a short label ("2 m s⁻¹", "slowing"). */
  motion?: { dir: 'up' | 'down'; text: string };
  /** Which forces on the person are drawn. */
  forces: ('W' | 'N')[];
  /** Draw N as a dashed stub with "?" instead of its real length (the question asks about it). */
  unknownN?: true;
  /** Draw the acceleration of the lift (a double chevron) with its value. */
  showAcc?: true;
  /** Show the number on the scales display (N, in newtons). Hidden when a question asks about it. */
  showReading?: true;
  /** Draw three candidate N arrows (shorter / equal to W / longer) to tap. Their ids are CANDIDATE_IDS. */
  candidates?: true;
};

/** The person lifted off the scales ("exploded" view) with the forces on each body, for Newton's third law. */
export type PairsFig = { kind: 'pairs'; m: number };

/** A velocity–time graph of a lift trip, split into lettered parts of constant acceleration. */
export type VtFig = { kind: 'vt'; phases: { id: string; dt: number; a: number }[] };

export type Fig = LiftFig | PairsFig | VtFig;

/** Tap targets drawn by a lift figure with `candidates`. */
export const CANDIDATE_IDS = ['shorter', 'equal', 'longer'] as const;
/** Tap targets drawn by the pairs figure. */
export const PAIR_IDS = ['W', 'P', 'E'] as const;

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
  body: string[];
  card?: { term: string; text: string };
  fig?: Fig;
};

/** A prediction: no right answer yet, no outcome. A later choice screen returns to it (`revisitOf`). */
export type PredictScreen = Base & {
  kind: 'predict';
  prompt: string;
  fig?: Fig;
  options: Option[];
  after: string; // one line once an option is picked ("Let's find out.")
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

/** Play with the figure through a slider, then a light question (not counted in the tally). */
export type ExploreScreen = Base & {
  kind: 'explore';
  instruction: string; // names the gesture: "Drag …"
  fig: LiftFig;
  slider: { min: number; max: number; step: number; label: string; unit: string };
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
};

// ── Course map ───────────────────────────────────────────────────────────────────────────

/** `about`: one sentence on the map card saying what the lesson is about (shown for lessons not built yet too). */
export type LessonRef = { id: string; title: string; spec: number[]; ready: boolean; about: string };
export type Level = { id: string; title: string; lessons: LessonRef[] };
export type Course = { title: string; subtitle: string; levels: Level[] };

export const isQuestion = (s: Screen): s is Question => s.kind === 'choice' || s.kind === 'tapFig';
