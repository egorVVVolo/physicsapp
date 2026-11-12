// One line icon per lesson of the map, drawn like a tiny engineering sketch in a 32 × 32 box.
// Strokes use `currentColor`, so the same icon is white on a level tile and ink on a white card.
// The six level icons stay as a fallback for a lesson that has no icon yet (a test keeps that list empty).
import { arrow, svg } from './svg.ts';

const THIN = 'stroke-width="1.6"';
const DOTS = 'stroke-dasharray="0.1 4.2" stroke-width="2.6"';
const fill = 'fill="currentColor" stroke="none"';

/** Icon bodies (the content of the 32 × 32 box). */
export const lessonIconBodies: Record<string, string> = {
  // ── Motion ──
  // a number line with its positive end marked, and a vector pointing the other way
  'vectors-signs': `<path d="${arrow(3, 23, 28.5, 23)}"/><path d="M13,20 V26" ${THIN}/><path d="${arrow(18, 10, 4.5, 10)}"/><path d="M25,6.5 V13.5 M21.5,10 H28.5" ${THIN}/>`,
  // a velocity–time graph: speed up, steady, slow down
  'motion-graphs': `<path d="M5,4 V27 H29" ${THIN}/><path d="M5,27 L12,11 H20 L26.5,27"/>`,
  // one term of an equation picked out of three
  suvat: `<rect x="3" y="11" width="8" height="10" rx="1.5" ${fill}/><path d="M13.5,14 H17.5 M13.5,18 H17.5" ${THIN}/><rect x="20.5" y="11" width="8.5" height="10" rx="1.5"/><path d="M8,27 H24" ${THIN} stroke-dasharray="0.1 3.6"/>`,
  // up one side, down the other, the ball at the top
  'up-stop-down': `<circle cx="16" cy="6" r="3" ${fill}/><path d="${arrow(9, 27, 9, 12)}"/><path d="${arrow(23, 12, 23, 27)}"/><path d="M3,30 H29" ${THIN}/>`,
  // one slanted vector and its two components
  resolving: `<path d="${arrow(5, 26, 25, 8)}"/><path d="M5,26 H25 V12" ${THIN} stroke-dasharray="2.6 3"/>`,
  // launched sideways off a ledge
  projectiles: `<path d="M3,11 H10 V29"/><circle cx="13.5" cy="7.5" r="3" ${fill}/><path d="M17,9 Q27,10 28,27" ${DOTS}/><path d="M10,29 H30" ${THIN}/>`,

  // ── Forces ──
  // a body and the forces on it
  'free-body': `<rect x="12" y="12" width="8" height="8" rx="1.5" ${fill}/><path d="${arrow(16, 10.5, 16, 3)}"/><path d="${arrow(16, 21.5, 16, 29)}"/><path d="${arrow(21.5, 16, 29, 16)}"/>`,
  // a push, and the acceleration it gives (double chevron = acceleration, as in the figures)
  'f-ma': `<path d="M3,26 H29"/><rect x="13" y="14" width="12" height="12" rx="1.5"/><path d="${arrow(2.5, 20, 11.5, 20)}"/><path d="M17,4 L20.5,7.5 L17,11 M22,4 L25.5,7.5 L22,11" ${THIN}/>`,
  // a box on a hatched floor, the floor pushing up on it
  'normal-reaction': `<path d="M4,26 H28"/><path d="M8,26 l-3,4 M13,26 l-3,4 M18,26 l-3,4 M23,26 l-3,4 M28,26 l-3,4" ${THIN}/><rect x="9" y="15" width="14" height="11" rx="1.5" ${fill}/><path d="${arrow(16, 13, 16, 3.5)}"/>`,
  // a parachute: drag has grown to balance the weight
  'terminal-velocity': `<path d="M4,13 Q16,-4 28,13 Z"/><path d="M4,13 L14.5,23 M28,13 L17.5,23 M16,13 V22" ${THIN}/><rect x="13" y="23" width="6" height="6" rx="1.5" ${fill}/>`,

  // ── Momentum and moments ──
  // a heavy ball and its motion (outline arrow = motion, as in the figures)
  momentum: `<circle cx="9.5" cy="17" r="6.5" ${fill}/><path d="M18.5,14.5 H24 V11.5 L30,17 L24,22.5 V19.5 H18.5 Z" stroke-width="1.8"/><path d="M3,28 H29" ${THIN}/>`,
  // two balls meeting
  collisions: `<circle cx="10" cy="19" r="6" ${fill}/><circle cx="22" cy="19" r="6"/><path d="M16,3.5 V9 M10.5,5.5 L13,9.5 M21.5,5.5 L19,9.5" ${THIN}/>`,
  // a spanner on a nut: force at a distance from the pivot
  moments: `<circle cx="8" cy="22" r="4.5"/><circle cx="8" cy="22" r="1" ${fill}/><path d="M11.8,19.4 L26,10"/><path d="${arrow(21.5, 2.5, 26, 9.6)}"/>`,
  // a seesaw: a big load close to the pivot balances a small one far away
  balance: `<path d="M16,20 L12,27.5 H20 Z" ${fill}/><path d="M3,19.5 H29"/><rect x="7.5" y="10" width="7" height="8" rx="1.5" ${fill}/><rect x="23.5" y="13.5" width="4.5" height="4.5" rx="1"/>`,

  // ── Energy ──
  // a force and the distance it moves through
  work: `<rect x="4" y="12" width="9" height="9" rx="1.5" ${fill}/><path d="${arrow(14.5, 16.5, 25, 16.5)}"/><path d="M2,21.5 H30" ${THIN}/><path d="M4,27.5 H27 M4,25 V30 M27,25 V30" ${THIN}/>`,
  // a ball at the top of a slope and at the bottom
  'ke-gpe': `<path d="M3,8.5 Q10,8.5 16,18 T29,27.5"/><circle cx="6.5" cy="4.8" r="2.8" ${fill}/><circle cx="25.5" cy="22.6" r="2.8"/>`,
  // energy in, most of it carried on, some of it lost on the way
  conservation: `<path d="${arrow(3, 10, 28.5, 10)}"/><path d="M10,10 Q18,10 18,19 V27.5 M14.8,24.2 L18,27.6 L21.2,24.2"/>`,
  // a dial
  power: `<path d="M4,23 A12,12 0 0 1 28,23"/><path d="M16,23 L22.5,13"/><circle cx="16" cy="23" r="1.6" ${fill}/><path d="M7.5,14.5 L9.3,16.3 M16,11 V13.4 M3,27.5 H29" ${THIN}/>`,

  // ── Fluids ──
  // a ball in a beaker, pushed up by the liquid
  'density-upthrust': `<path d="M5,7 V26 Q5,28 7,28 H25 Q27,28 27,26 V7" ${THIN}/><path d="M5,15 q2.75,-2.6 5.5,0 t5.5,0 t5.5,0 t5.5,0" ${THIN}/><circle cx="16" cy="21" r="4" ${fill}/><path d="${arrow(16, 16, 16, 4)}"/>`,
  // a ball falling through a tall tube of liquid, timing marks on the side
  viscosity: `<path d="M10,3 V26.5 Q10,29 12.5,29 H19.5 Q22,29 22,26.5 V3"/><circle cx="16" cy="16" r="3.2" ${fill}/><path d="M14,6 V10.5 M18,6 V10.5 M5.5,11 H10 M5.5,23 H10" ${THIN}/>`,

  // ── Materials ──
  // a spring fixed to a wall, pulled by a force
  hooke: `<path d="M4,7 V25"/><path d="M4,16 H7 L9,11 L12.5,21 L16,11 L19.5,21 L21.5,16 H23"/><path d="${arrow(23, 16, 29.5, 16, 4)}"/>`,
  // a rod pulled from both ends
  young: `<rect x="10" y="11.5" width="12" height="9" rx="1.5"/><path d="${arrow(9, 16, 2.5, 16, 4)}"/><path d="${arrow(23, 16, 29.5, 16, 4)}"/>`,
  // a stress–strain curve that ends where the sample breaks
  'material-graphs': `<path d="M5,4 V27 H29" ${THIN}/><path d="M5,27 L11.5,12 Q14,6.5 18.5,8.5 T25,10"/><path d="M23,8 L27,12 M27,8 L23,12" ${THIN}/>`,
  // the area under a force–extension line
  'strain-energy': `<path d="M5,27 L24,9 V27 Z" fill="currentColor" fill-opacity="0.45" stroke="none"/><path d="M5,4 V27 H29" ${THIN}/><path d="M5,27 L24,9"/><path d="M24,9 V27" ${THIN} stroke-dasharray="2.4 2.8"/>`,

  // ── Level fallbacks (the icons the map has used since 11 Nov) ──
  motion: `<path d="M4,27 Q14,-2 28,22" ${DOTS}/><circle cx="4.5" cy="26" r="3" ${fill}/><path d="M23,22.5 L28,22 L27.5,17"/><path d="M2,30 H30" ${THIN}/>`,
  forces: `<path d="M3,26 H29"/><rect x="6" y="14" width="12" height="12" rx="1.5"/><path d="${arrow(18, 20, 28, 20)}"/>`,
  'momentum-moments': `<circle cx="9" cy="18" r="5.5"/><circle cx="24" cy="18" r="4"/><path d="${arrow(3, 9, 12, 9, 3.6)}"/><path d="M3,28 H29" ${THIN}/>`,
  energy: `<path d="M8,3 H24 M16,3 L23,21"/><circle cx="23.8" cy="23" r="3.6" ${fill}/><path d="M7,21 Q16,30 25,21" ${DOTS}/>`,
  fluids: `<rect x="10" y="8" width="12" height="12" rx="1.5"/><path d="M3,17 q3.25,-3 6.5,0 t6.5,0 t6.5,0 t6.5,0"/><path d="M3,24 q3.25,-3 6.5,0 t6.5,0 t6.5,0 t6.5,0" ${THIN}/>`,
  materials: `<path d="M6,3 H26 M16,3 L16,6 L11,8.5 L21,12 L11,15.5 L21,19 L16,21 L16,23"/><rect x="11" y="23" width="10" height="7" rx="1.5" ${fill}/>`,
};

const GROUP = 'fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"';

/** True when the lesson has an icon of its own. */
export const hasLessonIcon = (lessonId: string) => lessonId in lessonIconBodies;

/** The icon group, to place inside another drawing (32 × 32 units). */
export const lessonIconGroup = (lessonId: string, levelId: string) => `<g ${GROUP}>${lessonIconBodies[lessonId] ?? lessonIconBodies[levelId] ?? ''}</g>`;

/** The icon as a document. Set the colour with the `color` prop of <Art> (or CSS `color`). */
export const lessonIcon = (lessonId: string, levelId = '') => svg(32, 32, lessonIconGroup(lessonId, levelId));

/** The raised tile of the map with the lesson's icon on it: one solid face over a darker lip. */
export function lessonTile(lessonId: string, levelId: string, c: { face: string; side: string }): string {
  return svg(
    60,
    66,
    `<rect x="0" y="6" width="60" height="60" rx="18" fill="${c.side}"/><rect x="0" y="0" width="60" height="60" rx="18" fill="${c.face}"/>` +
      `<g transform="translate(12 12) scale(1.125)" color="#FFFFFF">${lessonIconGroup(lessonId, levelId)}</g>`,
  );
}
