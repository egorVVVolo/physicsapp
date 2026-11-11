import { font } from './tokens';

// Text drawn inside SVG (labels on the scene, the time line): one semibold family, no fontWeight,
// because each weight is its own family (loaded in app/_layout.tsx).
export const svgFont = font.bodySemi;
export const svgItalic = font.italic;
