import { stoppingDistance } from '../physics/braking';

// Demo "Predict" step for the visual-direction comparison (hook of Lesson 3).
// Every number is computed from the physics model, not typed in.
const u1 = 20; // m/s
const u2 = 40; // m/s
const a = 5; // m/s^2, magnitude of the deceleration

const base = stoppingDistance(u1, a); // 40 m
const answer = stoppingDistance(u2, a); // 160 m

export const brakingDemo = {
  u1,
  u2,
  a,
  base,
  answer,
  title: 'Double the speed',
  prompt: `Braking at a constant ${a} m/s², this car stops from ${u1} m/s in ${base} m. From ${u2} m/s with the same braking, how far does it travel before it stops?`,
  // Distractors are the usual wrong ideas: x2 (linear), x3, x8 (cubic).
  options: [
    { metres: base * 2, isCorrect: false },
    { metres: base * 3, isCorrect: false },
    { metres: answer, isCorrect: true },
    { metres: base * 8, isCorrect: false },
  ],
  correctText: `Right. Stopping distance goes with v², so twice the speed means four times the distance: ${answer} m.`,
  incorrectText: 'Not quite. Braking is the same, so look at how s depends on u in v² = u² + 2as.',
};
