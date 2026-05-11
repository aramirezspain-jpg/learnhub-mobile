import React from 'react';
import { View, ScrollView, StyleSheet, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface SafeScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  scrollable?: boolean;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export function SafeScreen({
  children,
  style,
  scrollable = false,
  edges = ['top', 'left', 'right'],
}: SafeScreenProps) {
  const scheme = useColorScheme() ?? 'dark';
  const bg = Colors[scheme].background;

  if (scrollable) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={edges}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.scrollContent, style]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={edges}>
      <View style={[styles.inner, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 32 },
});
