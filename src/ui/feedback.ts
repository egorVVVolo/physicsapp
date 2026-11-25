// What the app does when something happens: a sound and, on a phone, a vibration (docs/DESIGN.md, 7).
// Screens call only this module, never `haptic` or `play` directly.
import { haptic, setHapticsEnabled } from './haptics';
import { play, setSoundEnabled } from './sound';

export const feedback = {
  /** An answer card, a puck or a part of a figure was picked. */
  pick: () => {
    haptic.pick();
    play('tap');
  },
  /** One step of a slider; `k` is 0…1 along the slider, the pitch rises with it. */
  step: (k: number) => {
    haptic.pick();
    play('tick', 0.8 + 0.6 * Math.min(1, Math.max(0, k)));
  },
  right: () => {
    haptic.right();
    play('correct');
  },
  /** The puzzle of the lesson is solved: the right buzz, with the reveal sound. */
  solved: () => {
    haptic.right();
    play('reveal');
  },
  wrong: () => {
    haptic.wrong();
    play('wrong');
  },
  /** "Why?" opened, or the answer was shown. */
  reveal: () => play('reveal'),
  /** The Skill check begins. */
  flood: () => play('flood'),
  /** The puck landed: the lesson is complete. */
  complete: () => {
    haptic.medium();
    play('complete');
  },
  stamp: () => {
    haptic.heavy();
    play('stamp');
  },
  /** Something opened: the next lesson, a notebook card. */
  unlock: () => {
    haptic.pick();
    play('unlock');
  },
  /** The mark hits the floor in the launch animation: each bounce is quieter and a little lower in pitch. */
  bounce: (n: number) => play('tap', 1 - n * 0.12, Math.max(0.15, 0.6 - n * 0.18)),
  /** The momentum top spins up. */
  spin: () => play('spin'),
  /** Settings: sound and vibration on or off (kept in prefs/v1, applied when the app starts). */
  setSound: (on: boolean) => setSoundEnabled(on),
  setHaptics: (on: boolean) => setHapticsEnabled(on),
};
