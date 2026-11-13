// Builds everything that is generated from the art library (src/art/) and the tokens:
//   assets/brand/*.png, *.svg   the app icon in three directions, Android layers, favicon, splash mark
//   assets/sounds/*.wav         interface sounds, synthesised here (no samples from anywhere)
//   prototypes/design-system.html   the demo page: live motion demos and the asset gallery
// Run: npm run assets   (needs ImageMagick's `magick` for the PNG files; sounds and the page do not)
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { appIcon, appIconMono, mark, stamp, type IconVariant } from '../src/art/brand.ts';
import { darkNeutral, illustration, illustrationNames, lightNeutral } from '../src/art/illustrations.ts';
import { lessonIcon, lessonTile } from '../src/art/lessonIcons.ts';
import { levelObject, object, objectNames, puck } from '../src/art/objects.ts';
import { uiIcon, uiIconBodies, type UiIconName } from '../src/art/uiIcons.ts';
import { course } from '../src/content/course.ts';
import { courseBlue, darkPalette, levelPalette, motion, palette, reward, soonGrey } from '../src/theme/tokens.ts';

const root = new URL('..', import.meta.url).pathname;
const out = (p: string) => root + p;
mkdirSync(out('assets/brand'), { recursive: true });
mkdirSync(out('assets/sounds'), { recursive: true });

// ───────────────────────── sounds ─────────────────────────
const SR = 44100;
type Harmonic = [multiple: number, level: number];
const MALLET: Harmonic[] = [
  [1, 1],
  [2, 0.28],
  [4, 0.07],
];
const SOFT: Harmonic[] = [
  [1, 1],
  [2, 0.12],
];

/** A struck note: fast attack, exponential decay, higher harmonics die sooner. */
function note(buf: Float32Array, at: number, freq: number, o: { amp?: number; decay?: number; attack?: number; harmonics?: Harmonic[] } = {}) {
  const { amp = 0.5, decay = 0.14, attack = 0.004, harmonics = MALLET } = o;
  const n0 = Math.floor(at * SR);
  for (let i = n0; i < buf.length; i++) {
    const t = (i - n0) / SR;
    const env = Math.min(1, t / attack) * Math.exp(-t / decay);
    let s = 0;
    for (const [h, a] of harmonics) s += a * Math.sin(2 * Math.PI * freq * h * t) * Math.exp(-t * (h - 1) * 9);
    buf[i] += amp * env * s;
  }
}

/** A sine that glides from f1 to f2, with an optional tremolo that speeds up (a wheel spinning up). */
function glide(buf: Float32Array, at: number, dur: number, f1: number, f2: number, o: { amp?: number; decay?: number; tremolo?: [number, number] } = {}) {
  const { amp = 0.5, decay = dur, tremolo } = o;
  const n0 = Math.floor(at * SR);
  let phase = 0;
  let trem = 0;
  for (let i = 0; i < dur * SR && n0 + i < buf.length; i++) {
    const t = i / SR;
    const k = t / dur;
    phase += (2 * Math.PI * (f1 + (f2 - f1) * k * k)) / SR;
    let a = Math.min(1, t / 0.006) * Math.exp(-t / decay) * Math.min(1, (dur - t) / 0.02);
    if (tremolo) {
      trem += (2 * Math.PI * (tremolo[0] + (tremolo[1] - tremolo[0]) * k)) / SR;
      a *= 0.6 + 0.4 * Math.sin(trem);
    }
    buf[n0 + i] += amp * a * Math.sin(phase);
  }
}

/** A short burst of low-passed noise: the slap of a stamp on paper. */
function thump(buf: Float32Array, at: number, o: { amp?: number; decay?: number; cutoff?: number } = {}) {
  const { amp = 0.4, decay = 0.02, cutoff = 0.12 } = o;
  const n0 = Math.floor(at * SR);
  let y = 0;
  let seed = 12345;
  for (let i = 0; i < 0.2 * SR && n0 + i < buf.length; i++) {
    seed = (seed * 1664525 + 1013904223) % 4294967296; // fixed seed: the file is the same on every build
    y += cutoff * (seed / 2147483648 - 1 - y);
    buf[n0 + i] += amp * y * Math.exp(-i / SR / decay) * 3;
  }
}

function wav(buf: Float32Array): Buffer {
  let peak = 0;
  for (const v of buf) peak = Math.max(peak, Math.abs(v));
  const k = peak > 0.85 ? 0.85 / peak : 1;
  const fade = Math.floor(0.012 * SR);
  const data = Buffer.alloc(44 + buf.length * 2);
  data.write('RIFF', 0);
  data.writeUInt32LE(36 + buf.length * 2, 4);
  data.write('WAVEfmt ', 8);
  data.writeUInt32LE(16, 16);
  data.writeUInt16LE(1, 20);
  data.writeUInt16LE(1, 22);
  data.writeUInt32LE(SR, 24);
  data.writeUInt32LE(SR * 2, 28);
  data.writeUInt16LE(2, 32);
  data.writeUInt16LE(16, 34);
  data.write('data', 36);
  data.writeUInt32LE(buf.length * 2, 40);
  for (let i = 0; i < buf.length; i++) {
    const tail = Math.min(1, (buf.length - i) / fade);
    data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, buf[i] * k * tail)) * 32767), 44 + i * 2);
  }
  return data;
}

const sec = (s: number) => new Float32Array(Math.ceil(s * SR));
// one key for everything (C major pentatonic), so sounds that follow each other never clash
const C4 = 261.63, G4 = 392.0, A4 = 440.0, C5 = 523.25, E5 = 659.25, G5 = 783.99, A5 = 880.0, C6 = 1046.5, D6 = 1174.66, E6 = 1318.51;

const sounds: Record<string, () => Float32Array> = {
  // a pick: an answer card, a puck, a toggle
  tap: () => {
    const b = sec(0.07);
    note(b, 0, 1320, { amp: 0.32, decay: 0.012, harmonics: SOFT });
    return b;
  },
  // one step of a slider (the app raises the pitch with the value)
  tick: () => {
    const b = sec(0.035);
    note(b, 0, 1760, { amp: 0.25, decay: 0.006, harmonics: SOFT });
    return b;
  },
  // Check, and it is right
  correct: () => {
    const b = sec(0.62);
    note(b, 0, G5, { amp: 0.42, decay: 0.13 });
    note(b, 0.09, C6, { amp: 0.46, decay: 0.2 });
    return b;
  },
  // Check, and it is not: low and soft, never a buzzer
  wrong: () => {
    const b = sec(0.5);
    note(b, 0, 311.13, { amp: 0.4, decay: 0.1, harmonics: SOFT });
    note(b, 0.11, 233.08, { amp: 0.42, decay: 0.14, harmonics: SOFT });
    return b;
  },
  // the answer is shown, or "Why?" opens
  reveal: () => {
    const b = sec(0.7);
    note(b, 0, A4, { amp: 0.3, decay: 0.26, harmonics: SOFT });
    note(b, 0.02, E5, { amp: 0.22, decay: 0.24, harmonics: SOFT });
    return b;
  },
  // the Skill check begins
  flood: () => {
    const b = sec(0.8);
    note(b, 0, C4, { amp: 0.34, decay: 0.3, attack: 0.07, harmonics: SOFT });
    note(b, 0.05, G4, { amp: 0.3, decay: 0.32, attack: 0.07, harmonics: SOFT });
    note(b, 0.16, C5, { amp: 0.22, decay: 0.3, attack: 0.05, harmonics: SOFT });
    return b;
  },
  // the lesson is complete: the puck lands
  complete: () => {
    const b = sec(1.7);
    [C5, E5, G5, C6].forEach((f, i) => note(b, i * 0.085, f, { amp: 0.36, decay: 0.16 }));
    note(b, 0.4, C5, { amp: 0.26, decay: 0.5 });
    note(b, 0.4, G5, { amp: 0.26, decay: 0.5 });
    note(b, 0.4, E6, { amp: 0.3, decay: 0.55 });
    return b;
  },
  // the stamp hits the page
  stamp: () => {
    const b = sec(0.32);
    glide(b, 0, 0.16, 170, 52, { amp: 0.8, decay: 0.055 });
    thump(b, 0, { amp: 0.35 });
    return b;
  },
  // something opens: the next lesson, a notebook card
  unlock: () => {
    const b = sec(0.55);
    note(b, 0, G5, { amp: 0.34, decay: 0.09 });
    note(b, 0.06, A5, { amp: 0.36, decay: 0.09 });
    note(b, 0.12, D6, { amp: 0.4, decay: 0.18 });
    return b;
  },
  // the momentum top spins up: one more day
  spin: () => {
    const b = sec(0.95);
    glide(b, 0, 0.46, 330, 880, { amp: 0.34, decay: 0.6, tremolo: [14, 44] });
    note(b, 0.45, D6, { amp: 0.36, decay: 0.2 });
    return b;
  },
};

const soundData: Record<string, string> = {};
for (const [name, make] of Object.entries(sounds)) {
  const file = wav(make());
  writeFileSync(out(`assets/sounds/${name}.wav`), file);
  soundData[name] = 'data:audio/wav;base64,' + file.toString('base64');
}
console.log(`sounds: ${Object.keys(sounds).length} files in assets/sounds/`);

// ───────────────────────── brand images ─────────────────────────
const variants: IconVariant[] = ['ink', 'blue', 'white'];
const DEFAULT_ICON: IconVariant = 'white'; // owner's choice, 13 Nov; icon-ink.png is the twin for the phone's dark appearance
const svgFiles: Record<string, string> = {
  'mark.svg': mark(courseBlue),
  'android-foreground.svg': appIcon(courseBlue, DEFAULT_ICON, { background: false, scale: 5 }),
  'android-monochrome.svg': appIconMono(),
};
for (const v of variants) svgFiles[`icon-${v}.svg`] = appIcon(courseBlue, v, { scale: 7 });
for (const [name, body] of Object.entries(svgFiles)) writeFileSync(out(`assets/brand/${name}`), body);

function png(svgName: string, pngName: string, w: number, h = w) {
  execFileSync('magick', ['-background', 'none', '-density', '288', out(`assets/brand/${svgName}`), '-resize', `${w}x${h}`, '-depth', '8', '-strip', '-define', 'png:exclude-chunks=date,time', `PNG32:${out(`assets/brand/${pngName}`)}`]);
}
try {
  for (const v of variants) png(`icon-${v}.svg`, `icon-${v}.png`, 1024);
  png(`icon-${DEFAULT_ICON}.svg`, 'icon.png', 1024);
  png(`icon-${DEFAULT_ICON}.svg`, 'favicon.png', 96);
  png('android-foreground.svg', 'android-icon-foreground.png', 1024);
  png('android-monochrome.svg', 'android-icon-monochrome.png', 1024);
  png('mark.svg', 'splash-icon.png', 600, 456);
  console.log('brand: PNG files in assets/brand/');
} catch {
  console.log('brand: SVG files written; PNG files skipped (ImageMagick `magick` not found)');
}

// ───────────────────────── demo page ─────────────────────────
const levels = course.levels.map((l) => ({ id: l.id, title: l.title, lessons: l.lessons.map((x) => ({ id: x.id, title: x.title, about: x.about })) }));
const perLevel = <T>(make: (id: string) => T) => Object.fromEntries(levels.map((l) => [l.id, make(l.id)]));

const ART = {
  palette,
  darkPalette,
  levelPalette,
  courseBlue,
  soonGrey,
  reward,
  motion,
  levels,
  levelObject,
  tiles: Object.fromEntries(levels.flatMap((l) => l.lessons.map((x) => [x.id, { level: lessonTile(x.id, l.id, levelPalette[l.id]), blue: lessonTile(x.id, l.id, courseBlue), grey: lessonTile(x.id, l.id, soonGrey) }]))),
  lessonIcons: Object.fromEntries(levels.flatMap((l) => l.lessons.map((x) => [x.id, lessonIcon(x.id, l.id)]))),
  uiIcons: Object.fromEntries((Object.keys(uiIconBodies) as UiIconName[]).map((n) => [n, uiIcon(n)])),
  pucks: {
    ...perLevel((id) => ({ done: puck(levelPalette[id], 'done'), current: puck(levelPalette[id], 'current'), open: puck(levelPalette[id], 'open') })),
    grey: { done: puck(soonGrey, 'open'), current: puck(soonGrey, 'open'), open: puck(soonGrey, 'open') },
  },
  objects: Object.fromEntries(
    objectNames.map((n) => {
      const level = Object.keys(levelObject).find((k) => levelObject[k] === n);
      return [n, n === 'lock' ? object(n, soonGrey, reward) : object(n, level ? levelPalette[level] : courseBlue, reward)];
    }),
  ),
  illustrations: Object.fromEntries(illustrationNames.map((n) => [n, { light: illustration(n, courseBlue, reward, lightNeutral), dark: illustration(n, { ...courseBlue, soft: '#17264A' }, reward, darkNeutral) }])),
  stamps: Object.fromEntries((['independent', 'assisted', 'revealed', 'level'] as const).map((s) => [s, stamp(s, courseBlue, reward, soonGrey)])),
  mark: mark(courseBlue),
  icons: Object.fromEntries(variants.map((v) => [v, appIcon(courseBlue, v, { scale: 7 })])),
  sounds: soundData,
};

const template = readFileSync(out('scripts/demo-template.html'), 'utf8');
writeFileSync(out('prototypes/design-system.html'), template.replace('/*__ART__*/null', () => JSON.stringify(ART)));
console.log('demo: prototypes/design-system.html');
