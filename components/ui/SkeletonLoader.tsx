import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, BorderRadius } from '@/constants/theme';

function usePulse() {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 900, useNativeDriver: false }),
        Animated.timing(anim, { toValue: 0, duration: 900, useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);
  return anim;
}

interface BlockProps {
  width?: number | string;
  height?: number;
  radius?: number;
  style?: ViewStyle;
}

function Block({ width = '100%', height = 14, radius = BorderRadius.sm, style }: BlockProps) {
  const scheme = useColorScheme() ?? 'dark';
  const base = scheme === 'dark' ? '#1F1F32' : '#E4E4F0';
  const hi   = scheme === 'dark' ? '#2D2D48' : '#F0F0FA';
  const anim = usePulse();
  const bg = anim.interpolate({ inputRange: [0, 1], outputRange: [base, hi] });
  return (
    <Animated.View style={[{ borderRadius: radius, backgroundColor: bg }, style, { width: width as any, height }]} />
  );
}

function CourseCard() {
  const scheme = useColorScheme() ?? 'dark';
  const theme  = Colors[scheme];
  const accent = scheme === 'dark' ? '#2D2D48' : '#DCDCEE';
  return (
    <View style={[sk.card, { backgroundColor: theme.card }]}>
      <View style={[sk.bar, { backgroundColor: accent }]} />
      <View style={sk.body}>
        <Block height={11} width="42%" />
        <Block height={17} width="80%" style={{ marginTop: 8 }} />
        <Block height={5}  width="100%" radius={2} style={{ marginTop: 12 }} />
        <View style={sk.foot}>
          <Block height={10} width="28%" />
          <Block height={10} width="12%" />
        </View>
      </View>
    </View>
  );
}

function ListItem() {
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  return (
    <View style={[sk.listItem, { backgroundColor: theme.card }]}>
      <Block height={40} width={40} radius={BorderRadius.md} style={{ flexShrink: 0 }} />
      <View style={sk.listBody}>
        <Block height={13} width="60%" />
        <Block height={11} width="85%" style={{ marginTop: 6 }} />
      </View>
    </View>
  );
}

export const SkeletonLoader = { Block, CourseCard, ListItem };

const sk = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: 12,
    minHeight: 90,
  },
  bar:  { width: 6 },
  body: { flex: 1, padding: 14, gap: 3, justifyContent: 'center' },
  foot: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: BorderRadius.lg,
    padding: 14,
    marginBottom: 10,
  },
  listBody: { flex: 1, gap: 3 },
});
