// Step: a package released from a climbing drone. Every number in the text comes from the
// constants below through src/physics. No React or React Native imports here, so tests can load it.
import { G, position, timeAtRest, timeToReach, velocity, type Motion } from '../physics/kinematics.ts';
import { fixed } from '../physics/format.ts';
import type { ClockEvent } from '../scene/clockStep.ts';

export const H0 = 20; // m, release height
export const VB = 8; // m s⁻¹, the drone climbs steadily

export const realBody: Motion = { s0: H0, u: VB, a: -G };
export const carrier: Motion = { s0: H0, u: VB, a: 0 };
export const bodyWith = (u: number): Motion => ({ s0: H0, u, a: -G });

const speed = `${fixed(VB, 1)} m s⁻¹`;

export const condition = `A drone climbs at a steady ${speed}. It releases a package ${fixed(H0, 0)} m above the ground. Take g = ${fixed(G, 2)} m s⁻², up is positive.`;
export const question = 'What is the package’s velocity the instant it is released?';
export const carrierLabel = speed;
export const sceneDescription = `A drone climbs at ${speed}. A package hangs below it, ${fixed(H0, 0)} metres above the ground.`;

export type Option = { id: string; label: string; u: number; correct?: boolean; feedback: string };
export const options: Option[] = [
  { id: 'zero', label: '0 m s⁻¹', u: 0, feedback: `It was climbing with the drone, so it leaves with the drone’s ${speed} upwards.` },
  { id: 'up', label: `${speed} up`, u: VB, correct: true, feedback: 'It shares the drone’s velocity, so it keeps rising before it falls.' },
  { id: 'down', label: `${speed} down`, u: -VB, feedback: `Letting go changes the forces, not the velocity at that instant. It still starts at ${speed} upwards.` },
];

export const tTop = timeAtRest(realBody)!;
export const hTop = position(tTop, realBody);
export const tBack = timeToReach(H0, realBody)!;
export const tLandReal = timeToReach(0, realBody)!;
/** Landing time of a body released with initial velocity u (used for the ghost). */
export const tLandWith = (u: number) => timeToReach(0, bodyWith(u))!;

export type Playback = {
  events: ClockEvent[];
  endT: number;
  captions: Record<string, string>;
  ghostU: number;
  ghostLabel: string;
  graph: { tMax: number; hMax: number };
};

/**
 * Playback after Check. A wrong answer plays as a ghost next to the real package.
 * A correct answer is compared with the most common mistake ("starts from rest").
 * It always stops when the ghost lands, before the real landing, so later questions stay open.
 */
export function playbackFor(option: Option): Playback {
  const ghostU = option.correct ? 0 : option.u;
  const endT = tLandWith(ghostU);
  const stillUp = fixed(position(endT, realBody), 1);
  const captions: Record<string, string> = {
    top: `Top: v = 0, but a is still ${fixed(G, 2)} m s⁻² downwards`,
    back: `Back at ${fixed(H0, 0)} m, now moving down at ${fixed(-velocity(tBack, realBody), 1)} m s⁻¹`,
    ghostLand: option.correct
      ? `From rest it would land at ${fixed(endT, 2)} s. The real one is still ${stillUp} m up`
      : `Yours lands at ${fixed(endT, 2)} s. The real one is still ${stillUp} m up`,
  };
  const events: ClockEvent[] = [
    { t: tTop, id: 'top' },
    { t: tBack, id: 'back' },
  ].filter((e) => e.t < endT - 0.05);
  events.push({ t: endT, id: 'ghostLand', end: true });
  return {
    events,
    endT,
    captions,
    ghostU,
    ghostLabel: option.correct ? 'from rest' : 'your answer',
    graph: { tMax: endT * 1.1, hMax: Math.max(hTop, H0) * 1.2 },
  };
}
