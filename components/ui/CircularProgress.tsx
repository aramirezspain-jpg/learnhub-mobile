import React from 'react';
import { View, Text } from 'react-native';

interface CircularProgressProps {
  progress: number;
  color: string;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

export function CircularProgress({
  progress,
  color,
  size = 80,
  strokeWidth = 7,
  showLabel = true,
}: CircularProgressProps) {
  const clamp = Math.min(100, Math.max(0, Math.round(progress)));
  const halfSize = size / 2;
  const trackColor = `${color}28`;

  // Right half: 0→50%, rotation from -180 to 0
  const rightDeg = -180 + (Math.min(clamp, 50) / 50) * 180;
  // Left half: 50→100%, rotation from -180 to 0
  const leftDeg = -180 + (Math.max(0, clamp - 50) / 50) * 180;

  return (
    <View style={{ width: size, height: size }}>
      {/* Track ring */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: halfSize,
          borderWidth: strokeWidth,
          borderColor: trackColor,
        }}
      />

      {/* Right half (0–50%) */}
      <View
        style={{
          position: 'absolute',
          left: halfSize,
          top: 0,
          width: halfSize,
          height: size,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            position: 'absolute',
            left: -halfSize,
            top: 0,
            width: size,
            height: size,
            borderRadius: halfSize,
            borderWidth: strokeWidth,
            borderColor: clamp > 0 ? color : 'transparent',
            transform: [{ rotate: `${rightDeg}deg` }],
          }}
        />
      </View>

      {/* Left half (51–100%) */}
      {clamp > 50 && (
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: halfSize,
            height: size,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: size,
              height: size,
              borderRadius: halfSize,
              borderWidth: strokeWidth,
              borderColor: color,
              transform: [{ rotate: `${leftDeg}deg` }],
            }}
          />
        </View>
      )}

      {/* Center text */}
      {showLabel && (
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: size,
            height: size,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              color: clamp > 0 ? color : '#6B6B8A',
              fontSize: size * 0.22,
              fontWeight: '800',
              lineHeight: size * 0.26,
            }}
          >
            {clamp}%
          </Text>
          {clamp > 0 && (
            <Text
              style={{
                color: 'rgba(255,255,255,0.45)',
                fontSize: size * 0.1,
                fontWeight: '600',
                lineHeight: size * 0.14,
                letterSpacing: 0.3,
              }}
            >
              HECHO
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
