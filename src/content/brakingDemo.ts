import { stoppingDistance, totalStoppingDistance } from '../physics/braking';

// Demo mini-lesson (design-direction stage): intro, two examples, two warm-ups, two build questions.
// Every number is computed from the physics model, not typed in.
export const A = 5; // m/s^2, magnitude of the deceleration
export const INTRO_SPEEDS = [10, 20, 30, 40]; // m/s

// Warm-up: tap the road where a car braking from 20 m/s stops.
export const tapWarmup = {
  u: 20,
  answer: stoppingDistance(20, A),
  tolerance: 4, // metres either side
  scene: { range: 60, xMax: 5, yMax: 24 },
};

export type BuildQuestion = {
  id: string;
  title: string;
  prompt: string;
  unit: string;
  answer: number;
  tiles: number[]; // number tiles on offer
  scene: { u: number; reaction: number; range: number; xMax: number; yMax: number };
  correctText: string;
  hint: string;
};

const u1 = 40;
const u2 = 20;
const reaction = 0.5; // s

export const buildQuestions: BuildQuestion[] = [
  {
    id: 'double',
    title: 'Twice as fast',
    prompt: `Braking at ${A} m/s² from ${u1} m/s. Build the calculation for the stopping distance.`,
    unit: 'm',
    answer: stoppingDistance(u1, A),
    tiles: [u1, A, 2, 20, 10],
    scene: { u: u1, reaction: 0, range: 180, xMax: 9, yMax: 48 },
    correctText: `s = u² ÷ 2a = ${u1} × ${u1} ÷ (2 × ${A}) = ${stoppingDistance(u1, A)} m.`,
    hint: 'Use s = u² ÷ 2a. Watch the brackets around 2a.',
  },
  {
    id: 'reaction',
    title: 'Reaction time',
    prompt: `The driver reacts for ${reaction} s at ${u2} m/s before braking at ${A} m/s². Build the total stopping distance.`,
    unit: 'm',
    answer: totalStoppingDistance(u2, A, reaction),
    tiles: [u2, reaction, 2, A],
    scene: { u: u2, reaction, range: 60, xMax: 5, yMax: 24 },
    correctText: `Thinking: ${u2} × ${reaction} = ${u2 * reaction} m. Braking: ${u2} × ${u2} ÷ (2 × ${A}) = ${stoppingDistance(u2, A)} m. Total ${totalStoppingDistance(u2, A, reaction)} m.`,
    hint: 'During the reaction time the car keeps its speed: distance = speed × time. Then add the braking distance.',
  },
];
