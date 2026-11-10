// The shape of lesson content. Content files have no React imports, so tests can load them.
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

/** What the vertical scene shows before anything moves. */
export type SceneSetup = {
  body: Motion; // the package, from the release
  /** `secret` hides the velocity arrow until the step is answered (when the velocity is the question). */
  carrier: { motion: Motion; label: string; secret?: boolean };
  /** A second drone and package in their own lane (labels: first, second). */
  second?: { body: Motion; carrier: Motion; labels: [string, string] };
  worldTop: number; // metres on the ruler
  description: string; // one sentence for screen readers
};

/** A second body played next to the real one: the learner's answer (dashed) or a real comparison (solid). */
export type Companion = { track: Track; label: string; kind: 'ghost' | 'solid' };

export type Playback = {
  events: ClockEvent[];
  captions: Record<string, string>; // each ≤ 80 characters
  endT: number;
  real: Track;
  realLabel: string;
  companion: Companion | null;
  showAcc: boolean; // the acceleration arrow is hidden while a later step still asks about it
  graph: { tMax: number; hMax: number };
};

export type Option = { id: string; label: string; correct?: true; misconception?: MisconceptionId; feedback: string };

type StepBase = { id: string; condition: string; question: string; scene: SceneSetup };

/** One attempt; the answer then plays on the scene. */
export type PredictStep = StepBase & {
  type: 'predict';
  options: Option[];
  playbackFor: (optionId: string) => Playback;
};

export type Values = Partial<Record<Quantity, number>>;
export type Chip = { value: number; label: string; misconception?: MisconceptionId; feedback?: string };
export type Slot = { quantity: Quantity; correct: number; chips: Chip[] };

/**
 * The learner picks an equation, fills it with signed values, the app solves,
 * and the learner reads the result (which root, or what the sign means).
 */
export type BuildStep = StepBase & {
  type: 'build';
  unknown: Quantity;
  known: Quantity[];
  hint: string; // "Known: s, u, a. Wanted: t."
  relations: { id: RelationId; misconception?: MisconceptionId; feedback: string }[];
  /** The chosen equation as it is drawn: text pieces and quantities (slots, givens, the unknown). */
  template: (string | { q: Quantity })[];
  slots: Slot[];
  given?: { quantity: Quantity; value: number; label: string };
  solved: string; // what the app shows after solving
  final: { prompt: string; choices: Option[] };
  flippedFeedback: string; // every sign flipped: consistent, but not the stated convention
  methodHint: string; // second level of help
  worked: string[]; // shown when the answer is revealed
  wrongPlayback: (values: Values) => Playback;
  donePlayback: () => Playback;
  exam?: { command: string; marks: number }; // exam format: one attempt per part, no help
  retry?: BuildStep; // same problem with new values, after a reveal
};

export type SpotErrorStep = StepBase & {
  type: 'spot-error';
  lines: { id: string; text: string; wrong?: true; feedback: string }[];
  misconception: MisconceptionId;
  methodHint: string;
  worked: string[];
  playback: () => Playback;
};

export type Step = PredictStep | BuildStep | SpotErrorStep;

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
