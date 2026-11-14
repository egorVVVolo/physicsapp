// The yellow ball that rolls from the lesson just finished to the next one on the map.
// Motion by a model: constant acceleration up to the middle of the path, the same deceleration after it
// (s = 2u² for u < ½, then s = 1 − 2(1 − u)², u = t / T). The path is a quadratic Bézier curve whose
// control point sits 20 pt above the middle of the segment, so the ball goes over a small arc.
import Animated, { useAnimatedStyle, useFrameCallback, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle, ClipPath, Defs } from 'react-native-svg';
import { scheduleOnRN } from 'react-native-worklets';
import { reward } from '@/theme/tokens';

export type Point = { x: number; y: number };

const BALL = 18; // pt
const R = BALL / 2;
const T = 0.9; // s, the whole roll
const LIFT = 20; // pt, the control point above the middle

export function RollingBall({ from, to, onArrive }: { from: Point; to: Point; onArrive: () => void }) {
  const t = useSharedValue(0);
  const fade = useSharedValue(1);
  const arrived = useSharedValue(false);
  const c = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 - LIFT };

  useFrameCallback((info) => {
    'worklet';
    if (arrived.get()) return;
    const dt = Math.min(0.05, (info.timeSincePreviousFrame ?? 16) / 1000);
    const next = Math.min(T, t.get() + dt);
    t.set(next);
    if (next >= T) {
      arrived.set(true);
      fade.set(withTiming(0, { duration: 160 }));
      scheduleOnRN(onArrive);
    }
  });

  const style = useAnimatedStyle(() => {
    const u = t.get() / T;
    const s = u < 0.5 ? 2 * u * u : 1 - 2 * (1 - u) * (1 - u);
    const a = 1 - s;
    const x = a * a * from.x + 2 * a * s * c.x + s * s * to.x;
    const y = a * a * from.y + 2 * a * s * c.y + s * s * to.y;
    return { opacity: fade.get(), transform: [{ translateX: x - R }, { translateY: y - R }] };
  });

  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 0, top: 0, width: BALL, height: BALL }, style]}>
      {/* flat 3D: the yellow face, and the darker underside showing along the bottom edge */}
      <Svg width={BALL} height={BALL} viewBox={`0 0 ${BALL} ${BALL}`}>
        <Defs>
          <ClipPath id="rolling-ball">
            <Circle cx={R} cy={R} r={R} />
          </ClipPath>
        </Defs>
        <Circle cx={R} cy={R} r={R} fill={reward.side} />
        <Circle cx={R} cy={R - 5} r={R} fill={reward.face} clipPath="url(#rolling-ball)" />
      </Svg>
    </Animated.View>
  );
}
