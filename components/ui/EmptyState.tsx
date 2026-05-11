import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, BorderRadius } from '@/constants/theme';
import { Typography } from './Typography';

interface EmptyStateProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  subtitle: string;
  color?: string;
}

export function EmptyState({ icon, title, subtitle, color }: EmptyStateProps) {
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  const iconColor = color ?? theme.textMuted;

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: `${iconColor}15` }]}>
        <Ionicons name={icon} size={32} color={iconColor} />
      </View>
      <Typography variant="h3" muted center style={styles.title}>
        {title}
      </Typography>
      <Typography variant="body" muted center style={styles.subtitle}>
        {subtitle}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 56,
    paddingHorizontal: 32,
    gap: 12,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: { marginTop: 4 },
  subtitle: { lineHeight: 22 },
});
