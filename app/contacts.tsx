import React, { useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, BorderRadius, Shadows, FontSizes } from '@/constants/theme';
import { Typography } from '@/components/ui/Typography';
import { EmptyState } from '@/components/ui/EmptyState';
import { ContactCard } from '@/components/community/ContactCard';
import { useCommunityStore } from '@/store/community.store';
import type { ContactType } from '@/types/community';

type TabKey = 'todos' | ContactType;

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'todos', label: 'Todos', icon: 'grid-outline' },
  { key: 'lider', label: 'Líderes', icon: 'person-outline' },
  { key: 'ministerio', label: 'Ministerios', icon: 'star-outline' },
  { key: 'grupo', label: 'Grupos', icon: 'people-outline' },
];

const TAB_COLOR: Record<TabKey, string> = {
  todos: Colors.primary,
  lider: Colors.secondary,
  ministerio: Colors.accent,
  grupo: Colors.info,
};

export default function ContactsScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  const [activeTab, setActiveTab] = useState<TabKey>('todos');

  const contacts = useCommunityStore(s => s.contacts);

  const filtered = useMemo(() => {
    if (activeTab === 'todos') return contacts;
    return contacts.filter(c => c.tipo === activeTab);
  }, [contacts, activeTab]);

  const countByType = useMemo(() => ({
    todos: contacts.length,
    lider: contacts.filter(c => c.tipo === 'lider').length,
    ministerio: contacts.filter(c => c.tipo === 'ministerio').length,
    grupo: contacts.filter(c => c.tipo === 'grupo').length,
  }), [contacts]);

  const activeColor = TAB_COLOR[activeTab];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Typography variant="overline" secondary>Iglesia</Typography>
          <Typography variant="h2" style={{ color: theme.text }}>Grupos y Ministerios</Typography>
        </View>
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsRow}
        style={styles.tabsScroll}
      >
        {TABS.map(tab => {
          const isActive = activeTab === tab.key;
          const color = TAB_COLOR[tab.key];
          const count = countByType[tab.key];
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabChip,
                { backgroundColor: isActive ? color : theme.card },
              ]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.8}
            >
              <Ionicons name={tab.icon as any} size={13} color={isActive ? '#FFF' : color} />
              <Typography style={{ color: isActive ? '#FFF' : color, fontSize: FontSizes.xs, fontWeight: '600' }}>
                {tab.label}
              </Typography>
              {count > 0 && (
                <View style={[styles.tabBadge, { backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : `${color}20` }]}>
                  <Typography style={{ color: isActive ? '#FFF' : color, fontSize: 10, fontWeight: '700' }}>
                    {count}
                  </Typography>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Resumen */}
      {activeTab !== 'todos' && filtered.length > 0 && (
        <View style={[styles.summaryBar, { backgroundColor: `${activeColor}10` }]}>
          <Ionicons
            name={TABS.find(t => t.key === activeTab)?.icon as any}
            size={14}
            color={activeColor}
          />
          <Typography style={{ color: activeColor, fontSize: 12, fontWeight: '600' }}>
            {filtered.length} {activeTab === 'lider' ? 'líderes' : activeTab === 'ministerio' ? 'ministerios' : 'grupos'}
          </Typography>
        </View>
      )}

      {/* Lista */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {filtered.length === 0 ? (
          <EmptyState
            icon="people-outline"
            title="Sin contactos"
            subtitle="No hay contactos en esta categoría todavía."
            color={Colors.info}
          />
        ) : (
          filtered.map(contact => <ContactCard key={contact.id} contact={contact} />)
        )}

        {/* Info */}
        <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
          <Ionicons name="shield-checkmark-outline" size={14} color={theme.textMuted} />
          <Typography variant="caption" muted style={{ flex: 1, lineHeight: 17 }}>
            Al contactar por WhatsApp o Telegram serás redirigido fuera de la aplicación.
          </Typography>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsScroll: { flexGrow: 0 },
  tabsRow: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: 8,
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: BorderRadius.full,
  },
  tabBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.full,
  },
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 8,
    marginBottom: 4,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 40,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.md,
  },
});
