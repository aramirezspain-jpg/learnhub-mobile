import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, FontSizes, FontWeights } from '@/constants/theme';

interface BadgeProps {
  label: string;
  color?: string;
  bg?: string;
  size?: 'sm' | 'md';
}

export function Badge({ label, color, bg, size = 'md' }: BadgeProps) {
  const textColor = color ?? Colors.primary;
  const bgColor = bg ?? `${Colors.primary}20`;

  return (
    <View
      style={[
        styles.base,
        size === 'sm' && styles.sm,
        { backgroundColor: bgColor },
      ]}
    >
      <Text style={[styles.text, size === 'sm' && styles.textSm, { color: textColor }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  sm: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  text: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
    letterSpacing: 0.3,
  },
  textSm: {
    fontSize: 10,
  },
});
