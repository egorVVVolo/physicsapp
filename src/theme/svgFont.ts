import { Platform } from 'react-native';

// SVG text: on the web an unset font falls back to a serif, so name a sans-serif stack there.
// On iOS and Android leave it unset to get the system font (a CSS-style stack does not work natively).
export const svgFont = Platform.select({ web: 'Helvetica Neue, Helvetica, Arial, sans-serif', default: undefined });
