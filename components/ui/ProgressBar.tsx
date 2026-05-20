import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Colors, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ProgressBarProps {
  progress: number; // 0–100
  color?: string;
  height?: number;
  rounded?: boolean;
  trackColor?: string;
}

export function ProgressBar({
  progress,
  color,
  height = 6,
  rounded = true,
  trackColor,
}: ProgressBarProps) {
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  const clamp = Math.min(Math.max(progress, 0), 100);

  const animPct = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animPct, {
      toValue: clamp,
      duration: 550,
      useNativeDriver: false,
    }).start();
  }, [clamp]);

  return (
    <View
      style={[
        styles.track,
        {
          height,
          backgroundColor: trackColor ?? theme.border,
          borderRadius: rounded ? BorderRadius.full : 0,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.fill,
          {
            width: animPct.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
            backgroundColor: color ?? Colors.primary,
            borderRadius: rounded ? BorderRadius.full : 0,
            height,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
