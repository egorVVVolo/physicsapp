// Illustrations for whole screens (320 × 220): the welcome screen, empty states, the Skill check card.
// They are built from the same flat objects as the rest of the art. `n` holds the neutral colours,
// so the dark theme can pass its own.
import { objectBody, puckBody } from './objects.ts';
import { WHITE, coil, svg, type Gold, type Tone } from './svg.ts';

export type Neutral = { paper: string; line: string; card: string; ink: string; fill: string };
export const lightNeutral: Neutral = { paper: '#F4F6F8', line: '#C9D0D8', card: '#FFFFFF', ink: '#1A1E25', fill: '#E2E6EB' };
export const darkNeutral: Neutral = { paper: '#171C23', line: '#3A434F', card: '#232A33', ink: '#F1F3F6', fill: '#323A46' };

const SPARK = 'M0,-12 Q1.6,-1.6 12,0 Q1.6,1.6 0,12 Q-1.6,1.6 -12,0 Q-1.6,-1.6 0,-12 Z';
const spark = (x: number, y: number, k: number, g: Gold) => `<path d="${SPARK}" fill="${g.face}" transform="translate(${x} ${y}) scale(${k})"/>`;
const place = (x: number, y: number, k: number, body: string) => `<g transform="translate(${x} ${y}) scale(${k})">${body}</g>`;

type Draw = (c: Tone, g: Gold, n: Neutral) => string;

const bodies: Record<string, Draw> = {
  // Welcome: a puck on a spring. In the app the puck can be pulled and let go; this is its still frame.
  welcome: (c, g) =>
    `<rect x="104" y="6" width="112" height="9" rx="4.5" fill="${c.lip}"/>` +
    coil(160, 15, 75, 17, 6, c.face, c.side, 5) +
    `<path d="M160,75 V96" stroke="${c.lip}" stroke-width="3.4" stroke-linecap="round"/>` +
    `<ellipse cx="160" cy="191" rx="44" ry="20" stroke="${c.inner}" stroke-width="2.8" stroke-dasharray="6 7" stroke-linecap="round"/>` +
    `<path d="M150,150 L160,158 L170,150 M150,162 L160,170 L170,162" stroke="${c.inner}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>` +
    place(105, 62, 1.1, puckBody(c, 'done')) +
    spark(246, 62, 1.1, g) +
    spark(70, 112, 0.7, g) +
    spark(262, 132, 0.5, g),

  // Progress with nothing in it yet: a blank drawing sheet waiting for the first line
  emptyProgress: (c, g, n) =>
    `<rect x="44" y="18" width="212" height="176" rx="14" fill="${n.paper}" stroke="${n.line}" stroke-width="2"/>` +
    `<path d="M78,162 V50 M78,162 H222" stroke="${n.line}" stroke-width="2.8" stroke-dasharray="5 7" stroke-linecap="round"/>` +
    `<path d="M78,162 Q140,156 176,104 T222,58" stroke="${c.inner}" stroke-width="3.4" stroke-dasharray="0.1 8" stroke-linecap="round"/>` +
    place(186, 84, 1, objectBody('compass', c, g)) +
    spark(66, 40, 0.6, g),

  // The notebook before the first lesson is finished: one card ready, the rest still outlines
  notebookEmpty: (c, g, n) =>
    `<rect x="118" y="34" width="84" height="120" rx="10" stroke="${n.line}" stroke-width="2.4" stroke-dasharray="6 7" transform="rotate(-13 160 170)"/>` +
    `<rect x="118" y="34" width="84" height="120" rx="10" stroke="${n.line}" stroke-width="2.4" stroke-dasharray="6 7" transform="rotate(13 160 170)"/>` +
    `<rect x="118" y="40" width="84" height="120" rx="10" fill="${n.line}"/><rect x="118" y="34" width="84" height="120" rx="10" fill="${n.card}" stroke="${n.line}" stroke-width="2"/>` +
    `<path d="M132,54 H160" stroke="${n.line}" stroke-width="3" stroke-linecap="round"/>` +
    `<path d="M134,128 H186" stroke="${n.ink}" stroke-width="2.4" stroke-linecap="round"/><rect x="146" y="102" width="28" height="26" rx="3" fill="${n.fill}"/>` +
    `<path d="M160,98 V72 M152,80 L160,72 L168,80" stroke="${c.main}" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>` +
    spark(202, 36, 1.2, g) +
    `<ellipse cx="160" cy="196" rx="70" ry="9" fill="${c.soft}"/>`,

  // Every lesson that exists is done: more are on the way
  allDone: (c, g, n) =>
    place(14, 96, 0.92, puckBody(c, 'done')) +
    place(96, 56, 0.92, puckBody(c, 'done')) +
    `<g transform="translate(180 96) scale(0.92)" stroke="${n.line}" stroke-width="2.8" stroke-dasharray="6 7" stroke-linecap="round"><path d="M10,32 A40,22 0 0 1 90,32 V44 A40,22 0 0 1 10,44 Z"/><ellipse cx="50" cy="32" rx="24" ry="13"/></g>` +
    `<g transform="translate(250 60) scale(0.6)" stroke="${n.line}" stroke-width="3.6" stroke-dasharray="6 8" stroke-linecap="round"><path d="M10,32 A40,22 0 0 1 90,32 V44 A40,22 0 0 1 10,44 Z"/></g>` +
    spark(142, 40, 0.9, g) +
    spark(60, 80, 0.55, g),

  // The Skill check: a clipboard, one try per question
  skillCheck: (c, g, n) =>
    `<rect x="100" y="32" width="120" height="166" rx="16" fill="${c.side}"/><rect x="100" y="24" width="120" height="166" rx="16" fill="${c.face}"/>` +
    `<rect x="112" y="44" width="96" height="134" rx="8" fill="${WHITE}"/>` +
    `<rect x="136" y="12" width="48" height="24" rx="9" fill="${n.ink === '#1A1E25' ? n.ink : '#0B0E12'}"/><circle cx="160" cy="22" r="4" fill="${c.face}"/>` +
    [0, 1, 2, 3]
      .map((i) => {
        const y = 68 + i * 28;
        const dot =
          i < 2
            ? `<circle cx="130" cy="${y}" r="8" fill="${c.main}"/><path d="M126,${y} L129,${y + 3} L134.5,${y - 3.5}" stroke="${WHITE}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`
            : `<circle cx="130" cy="${y}" r="6.6" stroke="${i === 2 ? c.main : '#C9D0D8'}" stroke-width="2.8"/>`;
        return dot + `<rect x="146" y="${y - 4}" width="${i % 2 ? 40 : 50}" height="8" rx="4" fill="#E2E6EB"/>`;
      })
      .join('') +
    spark(240, 44, 1.1, g) +
    spark(78, 150, 0.6, g),
};

export type IllustrationName = 'welcome' | 'emptyProgress' | 'notebookEmpty' | 'allDone' | 'skillCheck';
export const illustrationNames = Object.keys(bodies) as IllustrationName[];

/** The illustration as a document (320 × 220). */
export const illustration = (name: IllustrationName, c: Tone, g: Gold, n: Neutral = lightNeutral) => svg(320, 220, bodies[name](c, g, n));
