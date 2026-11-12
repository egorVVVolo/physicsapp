// Flat vector 3D objects: the "things" of the app. One per level of the map (the reward for finishing the
// level), plus the momentum top, the notebook, the drafting compass, the lock and the spark.
// Each one is drawn in a 120 × 120 box from solid surfaces only: no gradients, no outlines, no blur.
// `c` is the colour of the level the object belongs to; `g` is the reward yellow, used for the one part
// that moves or matters (the ball, the bob, the load).
import { WHITE, ball, coil, cyl, isoBox, onTop, shadow, svg, type Gold, type Tone } from './svg.ts';

type Draw = (c: Tone, g: Gold) => string;

/** The lesson puck of the map, as markup (100 × 76). The same facets as src/figures/Puck.tsx. */
export function puckBody(c: Tone, state: 'done' | 'current' | 'open' = 'done'): string {
  const side = `<g fill="${c.side}"><ellipse cx="50" cy="38" rx="40" ry="22"/><rect x="10" y="38" width="80" height="6"/><ellipse cx="50" cy="44" rx="40" ry="22"/></g>`;
  const face = `<ellipse cx="50" cy="32" rx="40" ry="22" fill="${c.face}"/>`;
  if (state === 'current') {
    return (
      side +
      face +
      `<ellipse cx="50" cy="33" rx="24" ry="13" fill="${c.side}"/><path d="M26,33 A24,13 0 0 1 74,33 A24,10 0 0 0 26,33 Z" fill="#000000" fill-opacity="0.16"/>` +
      `<ellipse cx="50" cy="33" rx="24" ry="13" stroke="${WHITE}" stroke-width="5"/>`
    );
  }
  const dash = state === 'done' ? '' : ' stroke-dasharray="26.1 3.6" stroke-dashoffset="27.9"';
  return (
    side +
    face +
    `<ellipse cx="50" cy="32" rx="22" ry="11.5" fill="${c.inner}"/><ellipse cx="50" cy="32" rx="24" ry="13" stroke="${WHITE}" stroke-width="5"${dash}/>` +
    (state === 'done' ? `<path d="M41,32 L47.5,37.5 L59.5,26.5" stroke="${WHITE}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>` : '')
  );
}

/** A lab stand: a round base, a post and an arm. Shared by the pendulum and the spring. */
const stand = (c: Tone) =>
  shadow(58, 108, 46, 8, c.soft) +
  cyl(58, 99, 42, 9, 6, c.face, c.side) +
  `<rect x="24" y="15" width="7" height="85" rx="3.5" fill="${c.lip}"/><rect x="24" y="15" width="64" height="7" rx="3.5" fill="${c.lip}"/>`;

const bodies: Record<string, Draw> = {
  // Motion: a ball launched from a block, on its way to a target
  launch: (c, g) =>
    shadow(30, 104, 28, 7, c.soft) +
    isoBox(30, 66, 26, 26, 28, c.face, c.main, c.side) +
    cyl(92, 98, 22, 9.5, 5, c.face, c.side) +
    `<ellipse cx="92" cy="98" rx="15" ry="6.5" fill="${WHITE}"/><ellipse cx="92" cy="98" rx="8" ry="3.5" fill="${c.face}"/>` +
    `<path d="M30,62 Q60,-22 92,96" stroke="${c.inner}" stroke-width="3.6" stroke-dasharray="0.1 8.4" stroke-linecap="round"/>` +
    ball(68, 35.5, 10, g.face, g.side),

  // Forces: a stack of slotted masses on a hook
  masses: (c, g) =>
    shadow(60, 104, 42, 9, c.soft) +
    cyl(60, 84, 36, 13, 12, c.face, c.side) +
    cyl(60, 68, 29, 10.5, 12, c.face, c.side) +
    cyl(60, 53, 22, 8, 12, g.face, g.side) +
    `<ellipse cx="60" cy="53" rx="13" ry="4.7" stroke="${WHITE}" stroke-width="2.6"/>` +
    `<rect x="57.5" y="28" width="5" height="25" rx="2.5" fill="${c.lip}"/><circle cx="60" cy="21" r="7" stroke="${c.lip}" stroke-width="5"/>`,

  // Momentum and moments: Newton's cradle with one ball lifted
  cradle: (c, g) =>
    shadow(60, 110, 50, 7, c.soft) +
    `<rect x="22" y="20" width="6" height="82" rx="3" fill="${c.lip}"/><rect x="96" y="20" width="6" height="82" rx="3" fill="${c.lip}"/>` +
    `<rect x="16" y="16" width="92" height="9" rx="4.5" fill="${c.side}"/>` +
    `<rect x="12" y="101" width="100" height="9" rx="4.5" fill="${c.side}"/><rect x="12" y="97" width="100" height="9" rx="4.5" fill="${c.face}"/>` +
    `<path d="M50,25 V66 M68,25 V66 M86,25 V66 M32,25 L12.5,62" stroke="${c.lip}" stroke-width="1.8" stroke-linecap="round"/>` +
    ball(50, 74, 9, c.face, c.side) +
    ball(68, 74, 9, c.face, c.side) +
    ball(86, 74, 9, c.face, c.side) +
    ball(12.5, 69.9, 9, g.face, g.side),

  // Energy: a pendulum at the top of its swing
  pendulum: (c, g) =>
    stand(c) +
    `<path d="M54.3,71.5 A54,54 0 0 0 101.7,71.5" stroke="${c.inner}" stroke-width="3.4" stroke-dasharray="0.1 7.6" stroke-linecap="round"/>` +
    `<circle cx="54.3" cy="71.5" r="9.5" stroke="${c.inner}" stroke-width="2.6" stroke-dasharray="4.4 4.4"/>` +
    `<path d="M78,21 L101.7,71.5" stroke="${c.lip}" stroke-width="2" stroke-linecap="round"/>` +
    ball(101.7, 71.5, 10, g.face, g.side),

  // Fluids: a ball falling through a tall cylinder of liquid
  cylinder: (c, g) =>
    shadow(60, 110, 34, 6, c.soft) +
    cyl(60, 101, 30, 8, 5, c.face, c.side) +
    `<path d="M42,14 V96 a18,6 0 0 0 36,0 V14 Z" fill="${c.soft}"/>` +
    `<path d="M42,40 V96 a18,6 0 0 0 36,0 V40 Z" fill="${c.face}"/>` +
    `<path d="M67,45 V101.6 a18,6 0 0 0 11,-5.6 V40 Z" fill="${c.main}"/>` +
    `<ellipse cx="60" cy="40" rx="18" ry="6" fill="${c.inner}"/>` +
    `<ellipse cx="60" cy="14" rx="18" ry="6" fill="${WHITE}" stroke="${c.inner}" stroke-width="2.6"/>` +
    `<path d="M42,54 h8 M42,65 h5 M42,76 h8 M42,87 h5" stroke="${WHITE}" stroke-width="2" stroke-linecap="round"/>` +
    `<path d="M55,52 V58 M61,50 V57" stroke="${WHITE}" stroke-width="2.6" stroke-linecap="round" stroke-opacity="0.85"/>` +
    ball(58, 70, 8, g.face, g.side),

  // Materials: a spring stretched by a load
  spring: (c, g) =>
    stand(c) +
    coil(70, 22, 62, 11, 5, c.face, c.side, 4) +
    `<path d="M70,62 V72" stroke="${c.lip}" stroke-width="3" stroke-linecap="round"/>` +
    cyl(70, 72, 15, 6, 15, g.face, g.side) +
    `<ellipse cx="70" cy="72" rx="8" ry="3" stroke="${g.pale}" stroke-width="2.4"/>`,

  // The momentum top: it stays up only while it spins (the streak)
  top: (_c, g) =>
    shadow(60, 106, 20, 5, g.soft) +
    `<path d="M26,50 A34,13 0 0 0 94,50 L60,103 Z" fill="${g.face}"/><path d="M60,63 A34,13 0 0 0 94,50 L60,103 Z" fill="${g.side}"/>` +
    cyl(60, 44, 34, 13, 6, g.pale, g.lip) +
    `<ellipse cx="60" cy="44" rx="21" ry="8" stroke="${WHITE}" stroke-width="3"/>` +
    `<rect x="57" y="17" width="6" height="28" rx="3" fill="${g.lip}"/><circle cx="60" cy="16" r="5.5" fill="${g.side}"/>`,

  // The same top lying on its side: the streak is paused, not "lost"
  topResting: (_c, g) =>
    shadow(56, 104, 44, 6, g.soft) +
    `<g transform="translate(-32 -6) rotate(62 60 103)">` +
    `<path d="M26,50 A34,13 0 0 0 94,50 L60,103 Z" fill="${g.face}"/><path d="M60,63 A34,13 0 0 0 94,50 L60,103 Z" fill="${g.side}"/>` +
    cyl(60, 44, 34, 13, 6, g.pale, g.lip) +
    `<ellipse cx="60" cy="44" rx="21" ry="8" stroke="${WHITE}" stroke-width="3"/>` +
    `<rect x="57" y="17" width="6" height="28" rx="3" fill="${g.lip}"/><circle cx="60" cy="16" r="5.5" fill="${g.side}"/></g>`,

  // The notebook: a board with a drawing sheet, the figure of a finished lesson on it
  notebook: (c, g) =>
    shadow(60, 106, 46, 8, c.soft) +
    isoBox(60, 60, 44, 58, 8, c.face, c.main, c.side) +
    onTop(
      60,
      60,
      `<rect x="-18" y="-25" width="36" height="50" rx="3" fill="${WHITE}"/>` +
        `<path d="M-12,-18 H2" stroke="#C9D0D8" stroke-width="2.6" stroke-linecap="round"/>` +
        `<path d="M-11,14 Q0,-26 11,14" stroke="${c.main}" stroke-width="3" stroke-linecap="round"/><path d="M-13,18 H13" stroke="${c.lip}" stroke-width="2" stroke-linecap="round"/>` +
        `<circle cx="0" cy="-6" r="4" fill="${g.face}"/>` +
        `<rect x="-26" y="-20" width="7" height="4" rx="2" fill="${g.face}"/><rect x="-26" y="-8" width="7" height="4" rx="2" fill="${g.face}"/><rect x="-26" y="4" width="7" height="4" rx="2" fill="${g.face}"/><rect x="-26" y="16" width="7" height="4" rx="2" fill="${g.face}"/>`,
    ),

  // The drafting compass: the sign of "engineering drawing"
  compass: (c, g) =>
    `<path d="M62,113 Q90,113 106,95" stroke="${c.inner}" stroke-width="3.4" stroke-dasharray="0.1 7.6" stroke-linecap="round"/>` +
    `<path d="M30,96 L27,105" stroke="${c.lip}" stroke-width="2.6" stroke-linecap="round"/>` +
    `<path d="M57,27 L30,95" stroke="${c.face}" stroke-width="8" stroke-linecap="round"/>` +
    `<path d="M63,27 L91,89" stroke="${c.side}" stroke-width="8" stroke-linecap="round"/>` +
    `<path d="M92,91 L96,100" stroke="${g.face}" stroke-width="6.5" stroke-linecap="round"/><path d="M96.6,101.4 L97.6,103.6" stroke="${c.lip}" stroke-width="3" stroke-linecap="round"/>` +
    `<rect x="57" y="4" width="6" height="14" rx="3" fill="${c.lip}"/><circle cx="60" cy="25" r="11" fill="${c.main}"/><circle cx="60" cy="25" r="4.5" fill="${WHITE}"/>`,

  // A lock: something that is not open yet (pass the grey tone)
  lock: (c) =>
    `<path d="M44,58 V42 A16,16 0 0 1 76,42 V58" stroke="${c.inner}" stroke-width="9" stroke-linecap="round"/>` +
    `<rect x="30" y="60" width="60" height="46" rx="12" fill="${c.side}"/><rect x="30" y="54" width="60" height="46" rx="12" fill="${c.face}"/>` +
    `<circle cx="60" cy="72" r="6" fill="${WHITE}"/><rect x="57" y="73" width="6" height="14" rx="3" fill="${WHITE}"/>`,

  // The spark: a four-point star, the sign of something earned
  spark: (_c, g) => {
    const d = 'M60,12 Q66,54 108,60 Q66,66 60,108 Q54,66 12,60 Q54,54 60,12 Z';
    return `<path d="${d}" fill="${g.side}" transform="translate(0 6)"/><path d="${d}" fill="${g.face}"/><path d="${d}" fill="${g.pale}" transform="translate(60 60) scale(0.4) translate(-60 -60)"/>`;
  },
};

export type ObjectName = 'launch' | 'masses' | 'cradle' | 'pendulum' | 'cylinder' | 'spring' | 'top' | 'topResting' | 'notebook' | 'compass' | 'lock' | 'spark';
export const objectNames = Object.keys(bodies) as ObjectName[];

/** The object of each level of the map. */
export const levelObject: Record<string, ObjectName> = {
  motion: 'launch',
  forces: 'masses',
  'momentum-moments': 'cradle',
  energy: 'pendulum',
  fluids: 'cylinder',
  materials: 'spring',
};

/** The object's markup, to place inside another drawing (120 × 120 units). */
export const objectBody = (name: ObjectName, c: Tone, g: Gold) => bodies[name](c, g);

/** The object as a document. */
export const object = (name: ObjectName, c: Tone, g: Gold) => svg(120, 120, bodies[name](c, g));

/** The puck as a document. */
export const puck = (c: Tone, state: 'done' | 'current' | 'open' = 'done') => svg(100, 76, puckBody(c, state));
