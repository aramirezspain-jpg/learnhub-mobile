import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  Animated,
  View,
  Platform,
  type GestureResponderEvent,
  type TouchableOpacityProps,
} from 'react-native';
import * as Haptics from 'expo-haptics';
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
  onPressIn,
  onPressOut,
  onPress,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = (e: GestureResponderEvent) => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 60,
      bounciness: 0,
    }).start();
    onPressIn?.(e);
  };

  const handlePressOut = (e: GestureResponderEvent) => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 3,
    }).start();
    onPressOut?.(e);
  };

  const handlePress = (e: GestureResponderEvent) => {
    if (Platform.OS !== 'web' && !isDisabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.(e);
  };

  return (
    <Animated.View
      style={[
        fullWidth && styles.fullWidth,
        { transform: [{ scale }] },
        style,
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.85}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={[
          styles.base,
          styles[variant],
          styles[`size_${size}`],
          fullWidth && styles.fullWidth,
          isDisabled && styles.disabled,
          variant === 'primary' && Shadows.primary,
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
    </Animated.View>
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
  primary:   { backgroundColor: Colors.primary },
  secondary: { backgroundColor: `${Colors.primary}18`, borderWidth: 1, borderColor: `${Colors.primary}40` },
  ghost:     { backgroundColor: 'transparent' },
  danger:    { backgroundColor: Colors.error },

  // Tamaños
  size_sm: { paddingHorizontal: 14, paddingVertical: 8,  borderRadius: BorderRadius.sm },
  size_md: { paddingHorizontal: 20, paddingVertical: 13 },
  size_lg: { paddingHorizontal: 28, paddingVertical: 16 },

  // Labels
  label:           { fontWeight: FontWeights.semibold, letterSpacing: 0.2 },
  label_primary:   { color: '#FFFFFF' },
  label_secondary: { color: Colors.primary },
  label_ghost:     { color: Colors.primary },
  label_danger:    { color: '#FFFFFF' },

  labelSize_sm: { fontSize: FontSizes.sm },
  labelSize_md: { fontSize: FontSizes.md },
  labelSize_lg: { fontSize: FontSizes.base },
});
