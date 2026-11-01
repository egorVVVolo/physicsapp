import React, { useEffect, useState } from 'react';
import { AccessibilityInfo, View } from 'react-native';
import Svg, { Defs, Line, LinearGradient, Polygon, Rect, Stop } from 'react-native-svg';
import { colors } from '../theme/tokens';
import { Car, CarDefs } from './Car';

// Intro illustration: one big car rolling in with its lights on. Plays once, then holds.
export function HeroScene({ height }: { height: number }) {
  const [width, setWidth] = useState(0);
  const [p, setP] = useState(0);

  useEffect(() => {
    let raf = 0;
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (cancelled) return;
      if (reduce) return setP(1);
      const start = Date.now();
      const tick = () => {
        const x = Math.min((Date.now() - start) / 1400, 1);
        setP(1 - Math.pow(1 - x, 3)); // ease-out
        if (x < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, []);

  const scale = 3.2;
  const groundY = height * 0.72;
  const front = width * 0.72 - 90 * (1 - p);
  const carTop = groundY - 35 * scale;

  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={{ height }}
      accessible
      accessibilityLabel="Illustration of a car driving to the right."
    >
      {width > 0 && (
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="heroBeam" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#FFD76A" stopOpacity="0.45" />
              <Stop offset="1" stopColor="#FFD76A" stopOpacity="0" />
            </LinearGradient>
            <LinearGradient id="heroRoad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#262B37" />
              <Stop offset="1" stopColor="#1B1F29" />
            </LinearGradient>
          </Defs>
          <CarDefs />
          <Rect x={0} y={groundY} width={width} height={height - groundY} fill="url(#heroRoad)" />
          <Line x1={0} y1={groundY} x2={width} y2={groundY} stroke={colors.axis} strokeWidth={2} />
          {[0, 1, 2, 3].map((i) => (
            <Rect key={i} x={((i * 120 + p * 60) % (width + 60)) - 30} y={groundY + (height - groundY) * 0.5} width={50} height={4} rx={2} fill={colors.axis} opacity={0.5} />
          ))}
          <Polygon points={`${front},${carTop + 19 * scale} ${width},${carTop + 8 * scale} ${width},${groundY}`} fill="url(#heroBeam)" />
          {[0, 1, 2].map((i) => (
            <Line key={i} x1={front - 72 * scale - 20 - i * 34} y1={carTop + (10 + i * 9) * scale} x2={front - 72 * scale - 70 - i * 34 - (1 - p) * 30} y2={carTop + (10 + i * 9) * scale} stroke={colors.ink} strokeWidth={3} strokeLinecap="round" opacity={0.22 * p} />
          ))}
          <Car x={front} y={carTop} braking={false} scale={scale} />
        </Svg>
      )}
    </View>
  );
}
