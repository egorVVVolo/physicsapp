import { accelerationAt, displacementAt, Graph } from '../physics/motion';
import { Goal, GradedStep, Outcome } from './types';

const EPS = 1e-6;

export function goalMet(goal: Goal, g: Graph): boolean {
  if (goal.kind === 'acceleration') {
    const t = (g.t[goal.segment] + g.t[goal.segment + 1]) / 2;
    return Math.abs(accelerationAt(g, t) - goal.target) < EPS;
  }
  if (goal.kind === 'shape') return g.v.every((v, i) => Math.abs(v - goal.target[i]) <= goal.tolerance + EPS);
  return Math.abs(displacementAt(g, goal.at) - goal.target) <= goal.tolerance + EPS;
}

// Says how far off a goal is, using the same numbers the learner sees on the graph.
function goalMiss(goal: Goal, g: Graph): string {
  const r = (n: number) => Number(n.toFixed(1));
  if (goal.kind === 'acceleration') {
    const t = (g.t[goal.segment] + g.t[goal.segment + 1]) / 2;
    return `That piece shows a = ${r(accelerationAt(g, t))} m/s². You need ${goal.target} m/s².`;
  }
  if (goal.kind === 'shape') {
    const i = g.v.findIndex((v, k) => Math.abs(v - goal.target[k]) > goal.tolerance + EPS);
    return `Check the dot at ${g.t[i]}\u00A0s. It shows ${r(g.v[i])} m/s, but the story needs ${goal.target[i]} m/s.`;
  }
  return `The car finishes ${r(displacementAt(g, goal.at))} m from the start. The target is ${goal.target} m.`;
}

// The learner's answer to a graded step.
export type Answer =
  | { kind: 'goal'; speeds: number[] }
  | { kind: 'pick'; index: number }
  | { kind: 'choice'; index: number }
  | { kind: 'build'; value: number }
  | { kind: 'numeric'; value: number; unit: string };

export type Verdict = { ok: boolean; message: string };

// What the learner reads when a step is right: the explanation, then the mark scheme if the step has one.
export const rightMessage = (step: GradedStep) => (step.marks ? [step.explanation, ...step.marks.scheme].join('\n') : step.explanation);

// Correct or not, with a short reason that teaches something.
export function gradeAnswer(step: GradedStep, answer: Answer): Verdict {
  if (step.kind === 'choice' && answer.kind === 'choice') {
    const ok = answer.index === step.correct;
    return { ok, message: ok ? rightMessage(step) : (step.options[answer.index].why ?? 'That is not it. Read the graph again.') };
  }
  if (step.kind === 'goal' && answer.kind === 'goal') {
    const ok = goalMet(step.goal, { t: step.lab.graph.t, v: answer.speeds });
    return { ok, message: ok ? rightMessage(step) : goalMiss(step.goal, { t: step.lab.graph.t, v: answer.speeds }) };
  }
  if (step.kind === 'pick' && answer.kind === 'pick') {
    const ok = answer.index === step.correct;
    return { ok, message: ok ? rightMessage(step) : (step.why[answer.index] || 'That graph gives a different position curve. Compare how the curve bends.') };
  }
  if (step.kind === 'build' && answer.kind === 'build') {
    const ok = Math.abs(answer.value - step.answer) < EPS;
    return { ok, message: ok ? rightMessage(step) : 'That calculation does not give the answer. Check which areas you added.' };
  }
  if (step.kind === 'numeric' && answer.kind === 'numeric') {
    if (answer.unit !== step.unit && Math.abs(answer.value - step.answer) < EPS) {
      return { ok: false, message: `The number is right, but the unit is not. Which unit measures this quantity?` };
    }
    const ok = answer.unit === step.unit && Math.abs(answer.value - step.answer) < EPS;
    const why = step.options.find((o) => Math.abs(o.value - answer.value) < EPS)?.why;
    return { ok, message: ok ? rightMessage(step) : (why ?? 'That is not the value. Read the graph again.') };
  }
  return { ok: false, message: 'No answer yet.' };
}

// A step done without help is independent; any hint makes it assisted; "Show me" makes it revealed.
export function stepOutcome(hintsUsed: number, revealed: boolean): Outcome {
  if (revealed) return 'revealed';
  return hintsUsed > 0 ? 'assisted' : 'independent';
}

// The lesson is independent only when every scored step was. Anything else is "with help".
export function lessonOutcome(outcomes: Outcome[]): 'independent' | 'assisted' {
  return outcomes.every((o) => o === 'independent') ? 'independent' : 'assisted';
}
