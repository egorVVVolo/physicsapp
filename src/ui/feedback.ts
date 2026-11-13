// What the app does when something happens: a sound and, on a phone, a vibration (docs/DESIGN.md, 7).
// Screens call only this module, never `haptic` or `play` directly.
import { haptic } from './haptics';
import { play } from './sound';

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
  /** The momentum top spins up. */
  spin: () => play('spin'),
};
