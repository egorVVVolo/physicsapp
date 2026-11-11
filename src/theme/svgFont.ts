import { font } from './tokens';

// Text inside SVG figures: labels in IBM Plex Mono (the drawing-sheet voice), force letters in Space Grotesk.
// No fontWeight: each weight is its own family (loaded in app/_layout.tsx).
export const svgMono = font.mono;
export const svgMonoBold = font.monoBold;
export const svgLetter = font.display;
