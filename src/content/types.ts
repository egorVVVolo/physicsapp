// The shape of lesson content. Content files have no React imports, so tests can load them.
// Every question screen says two things: WHAT is asked (a full, natural question) and HOW to answer
// (a short instruction that names the gesture: "Drag…", "Tap…").
// Text limits (checked by tests): question ≤ 58 characters, instruction ≤ 44, idea line ≤ 70,
// feedback ≤ 45, caption ≤ 38. One short thought per screen.
import type { Motion, Quantity, RelationId, Track } from '../physics/kinematics.ts';
import type { ClockEvent } from '../scene/clockStep.ts';

/** Ids from the misconception bank (docs/LESSON_FRAMEWORK.md, section 12). */
export type MisconceptionId =
  | 'K-TOP-ZERO-A'
  | 'K-SIGN-CONV'
  | 'K-ACC-DIR'
  | 'K-SPEED-VEL'
  | 'K-SUVAT-PICK'
  | 'K-RELEASE-REST'
  | 'K-ROOT-PICK';

/** What the scene is about: a sandbag released from a rising balloon. The scene draws the given numbers itself. */
export type SceneSetup = {
  body: Motion; // the sandbag, from the release (s0 = release height in metres)
  carrier: Motion; // the balloon: a = 0, u = its steady climb speed
  worldTop: number; // metres shown on the scene
  description: string; // one sentence for screen readers
  /** Hide the balloon's speed (the velocity is what the question asks). */
  secretCarrierSpeed?: boolean;
};

/** Which quantity the scene points out (build and idea screens). */
export type Highlight = 's' | 'u' | 'a' | null;

/** A second body played next to the real one: the learner's answer (dashed) or a real comparison. */
export type Companion = { track: Track; label: string; kind: 'ghost' | 'solid' };

export type Playback = {
  events: ClockEvent[];
  captions: Record<string, string>; // each ≤ 38 characters
  endT: number;
  real: Track;
  realLabel: string;
  companion: Companion | null;
  showAcc: boolean; // the acceleration arrow is hidden while a later question still asks about it
};

export type Option = {
  id: string;
  label: string;
  correct?: true;
  misconception?: MisconceptionId;
  feedback: string;
  value?: number; // where the option sits on a number line (timeline answers)
};

type StepBase = {
  id: string;
  question: string; // the sentence centred on the scene (on an idea card: its title)
  /** How to answer, shown under the question: names the gesture. Every question step has one; idea steps none. */
  instruction?: string;
  scene: SceneSetup;
  /** Show the small "up is +  g = 9.81 m s⁻²" tag. */
  sign?: boolean;
  /** Short given facts shown as small pills under the question, e.g. "lands after 3.0 s". ≤ 2, each ≤ 28 characters. */
  facts?: string[];
};

/** A short idea shown on the scene. No answer, no outcome. */
export type IdeaStep = StepBase & {
  type: 'idea';
  line: string; // one sentence under the title, ≤ 70 characters
  playback: Playback; // plays on its own and repeats
  highlight?: Highlight;
};

/** One attempt; the answer then plays on the scene. */
export type PredictStep = StepBase & {
  type: 'predict';
  /** How the learner answers: tap a card, or drag the velocity arrow on the sandbag (it snaps to the options' preview values). */
  input: 'cards' | 'vector';
  options: Option[];
  /** Velocity (m s⁻¹, up positive) the chosen option shows as an arrow before release; null = no arrow. */
  preview: (optionId: string) => number | null;
  playbackFor: (optionId: string) => Playback;
};

export type Values = Partial<Record<Quantity, number>>;
export type Chip = { value: number; label: string; misconception?: MisconceptionId; feedback?: string };
/**
 * How a value is entered on the scene or in the strip:
 * displacement = drag the s arrow from the release point; vector = drag the velocity arrow on the sandbag;
 * flip = tap the acceleration arrow to turn it; tiles = tap number tiles into the equation; cards = tap a card.
 */
export type SlotInput = 'displacement' | 'vector' | 'flip' | 'tiles' | 'cards';
export type Slot = {
  quantity: Quantity;
  correct: number;
  prompt: string; // the question of this stage
  instruction: string; // how to answer it
  highlight: Highlight;
  input: SlotInput;
  chips: Chip[];
};

/**
 * The learner picks an equation, fills it with signed values one at a time, the app solves,
 * and the learner reads the result (which root, or what the sign means). Each stage is its own screen.
 */
export type BuildStep = StepBase & {
  type: 'build';
  /** The whole task in a few words, kept in view on every stage ("Find: t to hit the ground"). ≤ 28 characters. */
  goal: string;
  unknown: Quantity;
  known: Quantity[];
  relationPrompt: string;
  relationInstruction: string;
  relations: { id: RelationId; misconception?: MisconceptionId; feedback: string }[];
  /** The chosen equation as it is drawn: text pieces and quantities (slots, givens, the unknown). */
  template: (string | { q: Quantity })[];
  slots: Slot[];
  given?: { quantity: Quantity; value: number; label: string };
  solved: string; // what the app shows after solving
  final: { prompt: string; instruction: string; choices: Option[]; input: 'timeline' | 'cards' };
  methodHint: string; // second level of help
  worked: string[]; // shown when the answer is revealed
  wrongPlayback: (values: Values) => Playback;
  donePlayback: () => Playback;
  exam?: { command: string; marks: number }; // exam format: one attempt per part, no help
  retry?: BuildStep; // same problem with new values, after a reveal
};

/** One quantity of a student's working, drawn on the scene as an arrow or a tag. */
export type WorkingItem = {
  id: string;
  kind: 's' | 'u' | 'a' | 'v' | 't';
  label: string; // shown next to the arrow, e.g. "v = +23.2"
  value: number; // signed value in SI units (sets the arrow direction)
  wrong?: true;
  feedback: string; // ≤ 45 characters
};

/** Spot the error: the student's working is drawn on the scene; the learner taps the wrong item. */
export type SpotErrorStep = StepBase & {
  type: 'spot-error';
  working: string; // one line of the student's final step, shown under the scene
  items: WorkingItem[];
  misconception: MisconceptionId;
  methodHint: string;
  worked: string[];
  playback: () => Playback;
};

export type AccDir = 'down' | 'zero' | 'up';

/**
 * Strobe: the sandbag frozen at a few instants (rising, top, falling). The learner sets the
 * acceleration arrow on every frame; the right answer is the same arrow everywhere.
 */
export type StrobeStep = StepBase & {
  type: 'strobe';
  frames: { id: string; t: number; label: string }[];
  feedback: { right: string; zeroTop: string; followsMotion: string; other: string };
  misconceptions: { zeroTop: MisconceptionId; followsMotion: MisconceptionId };
  playbackFor: (answers: Record<string, AccDir>) => Playback;
};

export type Step = IdeaStep | PredictStep | StrobeStep | BuildStep | SpotErrorStep;

export type Session = {
  id: string;
  kind: 'core' | 'exam' | 'tricky';
  minutes: number;
  steps: Step[];
  youCanNow: string[];
};

export type Lesson = {
  id: string;
  number: string;
  title: string;
  idea: string;
  spec: number[];
  misconceptions: MisconceptionId[];
  sessions: Session[];
};
