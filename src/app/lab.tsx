import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { MotionLab } from '../components/MotionLab';
import { ChunkyButton, PhoneFrame, tapHaptic } from '../components/stepParts';
import { Knots } from '../physics/motion';
import { fonts } from '../theme/fonts';
import { colors } from '../theme/tokens';

// Test screen for Scene A while stage 2 is being built.
const PRESETS: { name: string; knots: Knots }[] = [
  { name: 'Turn back', knots: [0, 10, 10, 0, -8] },
  { name: 'Speed up', knots: [0, 4, 8, 12, 16] },
  { name: 'Stop and go', knots: [8, 8, 0, 0, 8] },
];

export default function Lab() {
  const [knots, setKnots] = useState<Knots>(PRESETS[0].knots);
  const [playing, setPlaying] = useState(false);

  return (
    <PhoneFrame>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 }}>
          <Text style={{ fontFamily: fonts.display, fontSize: 22, color: colors.ink }}>Motion Lab</Text>
          <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.inkMuted, marginTop: 2 }}>
            Drag the dots on the velocity graph. Drag along the lower graph to move in time.
          </Text>
        </View>
        <MotionLab knots={knots} onChange={setKnots} playing={playing} onPlayingChange={setPlaying} showFps />
        <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 16, gap: 12 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {PRESETS.map((p) => (
              <Pressable
                key={p.name}
                onPress={() => {
                  tapHaptic();
                  setKnots(p.knots);
                }}
                accessibilityRole="button"
                style={{ flex: 1, minHeight: 44, borderRadius: 14, backgroundColor: colors.surfaceRaised, alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ fontFamily: fonts.bodySemi, fontSize: 14, color: colors.ink }}>{p.name}</Text>
              </Pressable>
            ))}
          </View>
          <ChunkyButton
            label={playing ? 'Pause' : 'Play'}
            onPress={() => setPlaying((p) => !p)}
            fill={colors.accent}
            edge={colors.accentEdge}
            textColor={colors.onAccent}
          />
        </View>
      </View>
    </PhoneFrame>
  );
}
