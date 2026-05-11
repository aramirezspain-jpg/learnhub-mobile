import React from 'react';
import { Text, type TextProps, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, FontSizes, FontWeights } from '@/constants/theme';

type Variant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'body'
  | 'bodyLarge'
  | 'caption'
  | 'label'
  | 'overline';

interface TypographyProps extends TextProps {
  variant?: Variant;
  color?: string;
  muted?: boolean;
  secondary?: boolean;
  center?: boolean;
  bold?: boolean;
}

export function Typography({
  variant = 'body',
  color,
  muted,
  secondary,
  center,
  bold,
  style,
  ...props
}: TypographyProps) {
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];

  const textColor = color
    ? color
    : muted
    ? theme.textMuted
    : secondary
    ? theme.textSecondary
    : theme.text;

  return (
    <Text
      style={[
        styles[variant],
        { color: textColor },
        center && { textAlign: 'center' },
        bold && { fontWeight: FontWeights.bold },
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  display: {
    fontSize: FontSizes.display,
    fontWeight: FontWeights.black,
    lineHeight: 48,
    letterSpacing: -1,
  },
  h1: {
    fontSize: FontSizes['3xl'],
    fontWeight: FontWeights.bold,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: FontSizes['2xl'],
    fontWeight: FontWeights.bold,
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.semibold,
    lineHeight: 28,
  },
  h4: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    lineHeight: 24,
  },
  bodyLarge: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.regular,
    lineHeight: 26,
  },
  body: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.regular,
    lineHeight: 24,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    lineHeight: 18,
    letterSpacing: 0.2,
  },
  caption: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.regular,
    lineHeight: 16,
  },
  overline: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
    lineHeight: 16,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
