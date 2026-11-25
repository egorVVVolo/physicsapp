// Small interface icons: one line style for the whole app (24 × 24 box, 2 pt stroke, round caps and joins).
// Strokes use `currentColor`. A button that shows only an icon still needs an accessibility label.
import { svg } from './svg.ts';

const dot = 'fill="currentColor" stroke="none"';

export const uiIconBodies = {
  close: `<path d="M6,6 L18,18 M18,6 L6,18"/>`,
  back: `<path d="M14.5,5 L7.5,12 L14.5,19"/>`,
  forward: `<path d="M9.5,5 L16.5,12 L9.5,19"/>`,
  down: `<path d="M5,9.5 L12,16.5 L19,9.5"/>`,
  check: `<path d="M5,12.5 L10,17.5 L19,7"/>`,
  play: `<path d="M8,5.5 V18.5 L18.5,12 Z" fill="currentColor"/>`,
  pause: `<path d="M8.5,6 V18 M15.5,6 V18" stroke-width="2.6"/>`,
  replay: `<path d="M5.5,12 A6.5,6.5 0 1 0 8,7"/><path d="M4.5,4.5 V8.5 H8.5"/>`,
  settings: `<path d="M4,7 H11 M17,7 H20 M4,17 H7 M13,17 H20"/><circle cx="14" cy="7" r="2.6"/><circle cx="10" cy="17" r="2.6"/>`,
  soundOn: `<path d="M4,10 V14 H7.5 L12,18 V6 L7.5,10 Z"/><path d="M15.5,9 Q17.5,12 15.5,15 M18,6.5 Q21.5,12 18,17.5"/>`,
  soundOff: `<path d="M4,10 V14 H7.5 L12,18 V6 L7.5,10 Z"/><path d="M16,9.5 L21,14.5 M21,9.5 L16,14.5"/>`,
  haptics: `<rect x="8.5" y="4" width="7" height="16" rx="2"/><path d="M4.5,9 V15 M19.5,9 V15"/>`,
  moon: `<path d="M19,14.5 A8,8 0 1 1 9.5,5 A6.3,6.3 0 0 0 19,14.5 Z"/>`,
  sun: `<circle cx="12" cy="12" r="3.8"/><path d="M12,3 V5 M12,19 V21 M3,12 H5 M19,12 H21 M5.6,5.6 L7,7 M17,17 L18.4,18.4 M18.4,5.6 L17,7 M7,17 L5.6,18.4"/>`,
  lock: `<rect x="5.5" y="10.5" width="13" height="10" rx="2.5"/><path d="M8.5,10.5 V8 A3.5,3.5 0 0 1 15.5,8 V10.5"/>`,
  why: `<circle cx="12" cy="12" r="8.5"/><path d="M9.6,9.6 A2.5,2.5 0 1 1 12,12.6 V13.8"/><circle cx="12" cy="16.6" r="1.1" ${dot}/>`,
  home: `<path d="M4,11 L12,4 L20,11 M6.5,9.5 V20 H17.5 V9.5"/>`,
  notebook: `<rect x="6" y="4" width="13" height="16" rx="2"/><path d="M4,8 H8 M4,12 H8 M4,16 H8 M11.5,9 H15.5 M11.5,12.5 H15.5"/>`,
  learn: `<circle cx="6.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="6.5" r="2.5"/><path d="M9,17.5 H13 A3,3 0 0 0 13,11.5 H11 A2.5,2.5 0 0 1 11,6.5 H15" stroke-dasharray="0.1 3.4"/>`,
  practice: `<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1.2" ${dot}/>`,
  progress: `<path d="M5,20 V13 M12,20 V5 M19,20 V9" stroke-width="3"/>`,
  momentum: `<ellipse cx="12" cy="9" rx="7.5" ry="3"/><path d="M4.5,9.5 L12,21 L19.5,9.5 M12,6 V2.5"/>`,
  user: `<circle cx="12" cy="8.5" r="3.8"/><path d="M4.5,20 A7.5,6.5 0 0 1 19.5,20"/>`,
  eye: `<path d="M2.5,12 Q12,3.5 21.5,12 Q12,20.5 2.5,12 Z"/><circle cx="12" cy="12" r="2.8"/>`,
  tap: `<circle cx="11" cy="9" r="2.6"/><path d="M11,2.5 V4 M4.5,9 H6 M16,9 H17.5 M6.4,4.4 L7.5,5.5 M15.6,4.4 L14.5,5.5"/><path d="M11,11.6 V21 M11,21 L8,17.5 M11,21 L14.5,18"/>`,
  drag: `<path d="M12,4 V20 M8.5,7.5 L12,4 L15.5,7.5 M8.5,16.5 L12,20 L15.5,16.5"/>`,
  feedback: `<path d="M4,5.5 H20 V16 H11 L7,19.5 V16 H4 Z"/>`,
  star: `<path d="M12,3 Q13,11 21,12 Q13,13 12,21 Q11,13 3,12 Q11,11 12,3 Z"/>`,
  info: `<circle cx="12" cy="12" r="8.5"/><path d="M12,11 V16.5"/><circle cx="12" cy="7.8" r="1.1" ${dot}/>`,
} as const;

export type UiIconName = keyof typeof uiIconBodies;

const GROUP = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';

/** The icon as a document. Set the colour with the `color` prop of <Art> (or CSS `color`). */
export const uiIcon = (name: UiIconName) => svg(24, 24, `<g ${GROUP}>${uiIconBodies[name]}</g>`);
