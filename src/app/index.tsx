import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { APP_NAME } from '../constants';
import { PhoneFrame } from '../components/stepParts';
import { colors } from '../theme/tokens';
import { fonts } from '../theme/fonts';

const variants = [
  { href: '/variant-a', name: 'A', title: 'Engineer’s notebook', text: 'Paper, grid, drawn like a diagram.' },
  { href: '/variant-b', name: 'B', title: 'Big stage', text: 'Scene on top, question in a sheet below.' },
  { href: '/variant-c', name: 'C', title: 'Colour panel', text: 'Bold blue question band, heavy answer bars.' },
] as const;

// Temporary screen for choosing the visual direction (stage 1).
export default function Variants() {
  return (
    <PhoneFrame background={colors.background}>
      <SafeAreaView style={{ flex: 1, padding: 24, gap: 16 }}>
        <Text style={{ fontFamily: fonts.display, fontSize: 32, color: colors.ink }}>{APP_NAME}</Text>
        <Text style={{ fontFamily: fonts.body, fontSize: 16, color: colors.inkMuted }}>
          Same lesson step, three designs. Open each and answer the question.
        </Text>
        <View style={{ gap: 12, marginTop: 8 }}>
          {variants.map((v) => (
            <Link key={v.href} href={v.href} asChild>
              <Pressable
                accessibilityRole="link"
                style={{ minHeight: 72, padding: 16, borderWidth: 1.5, borderColor: colors.ink, borderRadius: 14, backgroundColor: colors.surface }}
              >
                <Text style={{ fontFamily: fonts.display, fontSize: 20, color: colors.ink }}>
                  {v.name}. {v.title}
                </Text>
                <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.inkMuted, marginTop: 2 }}>{v.text}</Text>
              </Pressable>
            </Link>
          ))}
        </View>
      </SafeAreaView>
    </PhoneFrame>
  );
}
