import { stoppingDistance, stoppingSpeed, stoppingTime } from '../physics/braking';

// Demo mini-lesson for the visual-direction stage: two intro screens and three questions.
// Every number is computed from the physics model, not typed in.
export const A = 5; // m/s^2, magnitude of the deceleration
export const INTRO_SPEEDS = [10, 20, 30, 40]; // m/s

export type Question = {
  id: string;
  title: string;
  prompt: string;
  unit: string;
  options: { value: number; isCorrect: boolean }[];
  caseU: number; // speed of the braking run shown after a correct answer
  scene: { range: number; xMax: number; yMax: number };
  correctText: string;
  hint: string;
};

function options(correct: number, wrong: number[]) {
  return [...wrong, correct].sort((x, y) => x - y).map((value) => ({ value, isCorrect: value === correct }));
}

// Q1: time to stop from 25 m/s. Not 30 m/s: its scene would show 90 m, the answer to Q3.
const q1U = 25;
const q1Answer = stoppingTime(q1U, A);

// Q2: the hook. 20 m/s needs 40 m, so what does 40 m/s need?
const base = stoppingDistance(20, A);
const q2Answer = stoppingDistance(40, A);

// Q3: work backwards from the distance. Wrong ideas: scale linearly, halve, double.
const q3S = 90;
const q3Answer = stoppingSpeed(q3S, A);
const q3Linear = (20 * q3S) / base;

export const questions: Question[] = [
  {
    id: 'time',
    title: 'Time to stop',
    prompt: `From ${q1U} m/s, how long does it take to stop?`,
    unit: 's',
    options: options(q1Answer, [4, 6, 10]),
    caseU: q1U,
    scene: { range: 100, xMax: 7, yMax: 36 },
    correctText: `v = u + at with v = 0 gives t = ${q1U} ÷ ${A} = ${q1Answer} s.`,
    hint: 'Set v = 0 in v = u + at.',
  },
  {
    id: 'double',
    title: 'Twice as fast',
    prompt: `From 40 m/s, how far does it travel before stopping?`,
    unit: 'm',
    options: options(q2Answer, [base * 2, base * 3, base * 8]),
    caseU: 40,
    scene: { range: 180, xMax: 9, yMax: 48 },
    correctText: `s = u² ÷ 2a. Double u and s goes ×4: ${q2Answer} m.`,
    hint: 'Look at how s depends on u in s = u² ÷ 2a.',
  },
  {
    id: 'backwards',
    title: 'Work backwards',
    prompt: `It stops in exactly ${q3S} m. How fast was it going?`,
    unit: 'm/s',
    options: options(q3Answer, [q3Answer / 2, q3Linear, q3Answer * 2]),
    caseU: q3Answer,
    scene: { range: 100, xMax: 7, yMax: 36 },
    correctText: `u = √(2as) = √(2 × ${A} × ${q3S}) = ${q3Answer} m/s.`,
    hint: 'Distance grows with u², not u. Rearrange s = u² ÷ 2a.',
  },
];
