// Draws a piece of the art library (src/art/): pass the markup one of its functions returns.
// `color` sets `currentColor`, which line icons use for their strokes.
import { SvgXml } from 'react-native-svg';

export function Art({ xml, width, color }: { xml: string; width: number; color?: string }) {
  const box = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(xml);
  const height = box ? (width * Number(box[2])) / Number(box[1]) : width;
  return <SvgXml xml={xml} width={width} height={height} color={color} />;
}
