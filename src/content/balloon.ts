// Prototype step: sandbag released from a rising balloon. Numbers come from src/physics.
import { G, position, timeAtRest, timeToReach, velocity, type Motion } from '@/physics/kinematics';
import type { ClockEvent } from '@/scene/useClock';

export const H0 = 30; // m
export const VB = 4; // m s⁻¹, balloon rises steadily

export const realBag: Motion = { s0: H0, u: VB, a: -G };
export const balloon: Motion = { s0: H0, u: VB, a: 0 };
export const bagWith = (u: number): Motion => ({ s0: H0, u, a: -G });

const f1 = (x: number) => x.toFixed(1);
const f2 = (x: number) => x.toFixed(2);

export const condition =
  'A balloon rises at a steady 4.0 m s⁻¹. A sandbag is cut loose 30 m above the ground. Take g = 9.81 m s⁻², up is positive.';
export const question = 'What is the sandbag’s velocity the instant it is released?';

export type Option = { id: string; label: string; u: number; correct?: boolean; feedback: string };
export const options: Option[] = [
  { id: 'zero', label: '0 m s⁻¹', u: 0, feedback: 'It was rising with the balloon, so it leaves with the balloon’s 4.0 m s⁻¹ upwards.' },
  { id: 'up', label: '4.0 m s⁻¹ up', u: VB, correct: true, feedback: 'It shares the balloon’s velocity, so it rises a little before falling.' },
  { id: 'down', label: '4.0 m s⁻¹ down', u: -VB, feedback: 'Cutting the rope doesn’t flip the velocity. It starts at +4.0 m s⁻¹.' },
];

export const tTop = timeAtRest(realBag)!;
export const tBack = timeToReach(H0, realBag)!;
export const tLandReal = timeToReach(0, realBag)!;
export const tLand = (u: number) => timeToReach(0, bagWith(u))!;

/** Playback for a chosen answer. Stops before the real landing so later questions stay open. */
export function playbackFor(option: Option): { events: ClockEvent[]; endT: number; captions: Record<string, string> } {
  const captions: Record<string, string> = {
    top: `Top: v = 0, but a is still 9.81 m s⁻² down`,
    back: `Back at 30 m, now moving down at ${f1(-velocity(tBack, realBag))} m s⁻¹`,
  };
  if (option.correct) {
    return { endT: tBack, captions, events: [{ t: tTop, id: 'top' }, { t: tBack, id: 'back', end: true }] };
  }
  const tg = tLand(option.u);
  captions.ghostLand = `Yours lands at ${f2(tg)} s. The real one is still ${f1(position(tg, realBag))} m up`;
  return {
    endT: tg,
    captions,
    events: [{ t: tTop, id: 'top' }, { t: tBack, id: 'back' }, { t: tg, id: 'ghostLand', end: true }],
  };
}
