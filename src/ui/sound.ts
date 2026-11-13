// Interface sounds (docs/DESIGN.md, 7). One player per sound, created the first time it is needed.
// The phone's silent switch is respected. In a browser nothing plays before the first tap: that is the browser's rule.
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

const files = {
  tap: require('../../assets/sounds/tap.wav'),
  tick: require('../../assets/sounds/tick.wav'),
  correct: require('../../assets/sounds/correct.wav'),
  wrong: require('../../assets/sounds/wrong.wav'),
  reveal: require('../../assets/sounds/reveal.wav'),
  flood: require('../../assets/sounds/flood.wav'),
  complete: require('../../assets/sounds/complete.wav'),
  stamp: require('../../assets/sounds/stamp.wav'),
  unlock: require('../../assets/sounds/unlock.wav'),
  spin: require('../../assets/sounds/spin.wav'),
};
export type SoundName = keyof typeof files;

let enabled = true;
let modeSet = false;
const players: Partial<Record<SoundName, AudioPlayer>> = {};

/** Turned off from Settings (task 5.2). */
export const setSoundEnabled = (on: boolean) => {
  enabled = on;
};

/** Plays a sound from the start. `rate` above 1 plays it faster and higher (no pitch correction). */
export function play(name: SoundName, rate = 1) {
  if (!enabled) return;
  try {
    if (!modeSet) {
      modeSet = true;
      setAudioModeAsync({ playsInSilentMode: false }).catch(() => {});
    }
    const p = (players[name] ??= createAudioPlayer(files[name]));
    p.volume = 0.7;
    p.shouldCorrectPitch = false;
    p.setPlaybackRate(rate);
    p.seekTo(0).catch(() => {});
    p.play();
  } catch {
    // a device without audio simply stays silent
  }
}
