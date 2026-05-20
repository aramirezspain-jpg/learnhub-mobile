import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, BorderRadius, FontWeights } from '@/constants/theme';
import { Typography } from './Typography';

interface EmptyStateProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  subtitle: string;
  color?: string;
  action?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, subtitle, color, action, onAction }: EmptyStateProps) {
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  const iconColor = color ?? theme.textMuted;

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: `${iconColor}12`, borderColor: `${iconColor}22`, borderWidth: 1 }]}>
        <Ionicons name={icon} size={34} color={iconColor} />
      </View>
      <Typography variant="h3" style={[styles.title, { color: theme.text }]}>
        {title}
      </Typography>
      <Typography variant="body" muted center style={styles.subtitle}>
        {subtitle}
      </Typography>
      {action && onAction && (
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: `${Colors.primary}14`, borderColor: `${Colors.primary}28`, borderWidth: 1 }]}
          onPress={onAction}
          activeOpacity={0.72}
        >
          <Typography variant="label" color={Colors.primary} style={{ fontWeight: FontWeights.semibold }}>
            {action}
          </Typography>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 52,
    paddingHorizontal: 36,
    gap: 8,
  },
  iconWrap: {
    width: 76,
    height: 76,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    textAlign: 'center',
    marginTop: 4,
  },
  subtitle: {
    lineHeight: 22,
    textAlign: 'center',
  },
  actionBtn: {
    marginTop: 12,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
  },
});
