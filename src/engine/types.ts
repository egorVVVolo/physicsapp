import type { Graph } from '../physics/motion';

// A lesson is a typed list of steps. One player draws any of them.
export type Level = 'foundations' | 'intermediate' | 'advanced';
export type Hints = [string, string];

// How one step went. "revealed" means the learner asked to be shown the answer.
export type Outcome = 'independent' | 'assisted' | 'revealed';

// What the Motion Lab shows in a step.
export type LabView = {
  graph: Graph;
  editable?: number[]; // indexes of the points the learner may drag
  showSt?: boolean; // show the position-time graph (default true)
  showVt?: boolean; // show the velocity-time graph (default true)
  track?: boolean; // show the track, the car and the readouts (default true). Off for questions where they would give the answer away
  hideRun?: boolean; // keep the car at the start and hide readings until the answer is in
  areaNumbers?: boolean; // label the area under the graph with its value
  target?: { s: number }; // a goal position, drawn on the track and the s-t graph
  tangent?: boolean; // draw the tangent on the s-t graph at the cursor
  readouts?: boolean; // pills with t, v and s at the top of the track (default off)
  arrows?: 'v' | 'va'; // velocity arrow only (default) or velocity and acceleration
  slopes?: boolean; // label the acceleration (gradient) of every straight piece
  vRange?: [number, number]; // speed axis, m/s
  cursor?: number; // where the time cursor starts, s (default: end)
  trackRange?: [number, number]; // fixed track and s axis, m; needed when the run must not give the answer away
  focus?: number; // highlight one straight piece of the v-t graph
};

// One cell of a build template: a number slot, a fixed sign, a slot for a sign, or a bracket.
export type Cell =
  | { kind: 'break' }
  | { kind: 'slot' }
  | { kind: 'op'; sym: string }
  | { kind: 'opSlot' }
  | { kind: 'paren'; sym: '(' | ')' };

type Common = {
  id: string;
  level: Level;
  tag: string; // small label above the title, e.g. "Predict"
  title: string;
  body?: string;
};

// Explanation in small portions. The main button reveals the next beat.
export type BeatsStep = Common & {
  kind: 'beats';
  beats: { note: string; lab: LabView; play?: boolean }[];
};

// Hook: guess where the car ends up by tapping the track. The run only plays after the guess.
export type PredictStep = Common & {
  kind: 'predict';
  lab: LabView;
  answer: number; // m, computed from the physics model
  tolerance: number;
  revealNote: (guess: number, answer: number) => string;
};

// Move points of the graph until a condition holds.
export type Goal =
  | { kind: 'acceleration'; segment: number; target: number } // m/s², on one straight piece
  | { kind: 'displacement'; at: number; target: number; tolerance: number }; // m at time `at`

export type GoalStep = Common & {
  kind: 'goal';
  lab: LabView;
  goal: Goal;
  goalText: string; // what the learner has to do, in one line
  solution: number[]; // speeds that satisfy the goal, shown by "Show me"
  hints: Hints;
  explanation: string;
};

// Pick the v-t graph that matches the s-t graph shown.
export type PickStep = Common & {
  kind: 'pick';
  shown: Graph; // the graph the position-time picture is drawn from
  options: Graph[];
  correct: number;
  why: string[]; // for each wrong option: why it does not match (the correct entry is ignored)
  hints: Hints;
  explanation: string;
};

// Build a calculation by dropping number tiles into ready slots.
export type BuildStep = Common & {
  kind: 'build';
  lab?: LabView;
  template: Cell[];
  tiles: number[];
  answer: number;
  solution: string[]; // what goes into each slot and sign slot, in order; shown by "Show me"
  unit: string;
  structureHint: string;
  hints: Hints;
  explanation: string;
};

// Choose the value and the unit.
export type NumericStep = Common & {
  kind: 'numeric';
  lab: LabView;
  question: string;
  options: { value: number; why?: string }[]; // why = what mistake leads to this value
  answer: number;
  unit: string;
  units: string[];
  hints: Hints;
  explanation: string;
};

// Free play: move the graph and watch the car. No check; the button unlocks after the first move.
export type PlayStep = Common & {
  kind: 'play';
  lab: LabView;
  note: string; // shown once the learner has moved a dot
};

export type CompleteStep = Common & {
  kind: 'complete';
  summary: string[];
};

export type Step = BeatsStep | PlayStep | PredictStep | GoalStep | PickStep | BuildStep | NumericStep | CompleteStep;
export type GradedStep = GoalStep | PickStep | BuildStep | NumericStep;

export type Lesson = {
  id: string;
  number: number;
  title: string;
  spec: string; // spec point, e.g. "Motion graphs"
  minutes: number;
  steps: Step[];
};

export const isGraded = (s: Step): s is GradedStep => s.kind === 'goal' || s.kind === 'pick' || s.kind === 'build' || s.kind === 'numeric';
