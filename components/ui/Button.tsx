import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  type TouchableOpacityProps,
  View,
} from 'react-native';
import { Colors, BorderRadius, FontSizes, FontWeights, Shadows } from '@/constants/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading,
  iconLeft,
  iconRight,
  fullWidth,
  style,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        variant === 'primary' && Shadows.primary,
        style,
      ]}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? '#FFF' : Colors.primary}
          size="small"
        />
      ) : (
        <View style={styles.row}>
          {iconLeft}
          <Text style={[styles.label, styles[`label_${variant}`], styles[`labelSize_${size}`]]}>
            {label}
          </Text>
          {iconRight}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.5 },

  // Variantes
  primary: { backgroundColor: Colors.primary },
  secondary: { backgroundColor: `${Colors.primary}18`, borderWidth: 1, borderColor: `${Colors.primary}40` },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: Colors.error },

  // Tamaños
  size_sm: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: BorderRadius.sm },
  size_md: { paddingHorizontal: 20, paddingVertical: 13 },
  size_lg: { paddingHorizontal: 28, paddingVertical: 16 },

  // Labels
  label: { fontWeight: FontWeights.semibold, letterSpacing: 0.2 },
  label_primary: { color: '#FFFFFF' },
  label_secondary: { color: Colors.primary },
  label_ghost: { color: Colors.primary },
  label_danger: { color: '#FFFFFF' },

  labelSize_sm: { fontSize: FontSizes.sm },
  labelSize_md: { fontSize: FontSizes.md },
  labelSize_lg: { fontSize: FontSizes.base },
});
