import React, { useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, BorderRadius, Shadows, FontSizes } from '@/constants/theme';
import { Typography } from '@/components/ui/Typography';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScheduleItem } from '@/components/community/ScheduleItem';
import { useCommunityStore } from '@/store/community.store';
import type { ScheduleType } from '@/types/community';

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const DIAS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

type TypeFilter = 'todos' | ScheduleType;

const TYPE_FILTERS: { key: TypeFilter; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'culto', label: 'Cultos' },
  { key: 'discipulado', label: 'Discipulado' },
  { key: 'escuela_biblica', label: 'Escuela Bíblica' },
  { key: 'reunion', label: 'Reuniones' },
  { key: 'actividad', label: 'Actividades' },
];

const TYPE_COLOR: Record<ScheduleType, string> = {
  culto: Colors.primary,
  discipulado: Colors.secondary,
  escuela_biblica: Colors.accent,
  reunion: Colors.info,
  actividad: Colors.success,
};

export default function SchedulesScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  const today = new Date().getDay();
  const [selectedDay, setSelectedDay] = useState<number>(today);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('todos');

  const schedules = useCommunityStore(s => s.schedules);

  const schedulesForDay = useMemo(() => {
    return schedules.filter(s => {
      if (!s.activo) return false;
      const dayMatch = s.dia_semana === selectedDay;
      const typeMatch = typeFilter === 'todos' || s.tipo === typeFilter;
      return dayMatch && typeMatch;
    }).sort((a, b) => a.hora.localeCompare(b.hora));
  }, [schedules, selectedDay, typeFilter]);

  const countByDay = useMemo(() => {
    return DIAS.map((_, i) =>
      schedules.filter(s => s.activo && s.dia_semana === i).length
    );
  }, [schedules]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Typography variant="overline" secondary>Iglesia</Typography>
          <Typography variant="h2" style={{ color: theme.text }}>Horarios</Typography>
        </View>
        <View style={[styles.todayBadge, { backgroundColor: `${Colors.success}15` }]}>
          <Ionicons name="today-outline" size={14} color={Colors.success} />
          <Typography style={{ color: Colors.success, fontSize: 11, fontWeight: '600' }}>
            {DIAS_SHORT[today]}
          </Typography>
        </View>
      </View>

      {/* Selector de día */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.daysRow}
        style={styles.daysScroll}
      >
        {DIAS.map((dia, idx) => {
          const isSelected = selectedDay === idx;
          const isToday = today === idx;
          const count = countByDay[idx];
          return (
            <TouchableOpacity
              key={idx}
              style={[
                styles.dayChip,
                { backgroundColor: isSelected ? Colors.success : theme.card },
                isToday && !isSelected && { borderColor: Colors.success, borderWidth: 1 },
              ]}
              onPress={() => setSelectedDay(idx)}
              activeOpacity={0.8}
            >
              <Typography
                style={{
                  color: isSelected ? '#FFF' : isToday ? Colors.success : theme.textSecondary,
                  fontSize: 11,
                  fontWeight: '700',
                  textTransform: 'uppercase',
                }}
              >
                {DIAS_SHORT[idx]}
              </Typography>
              {count > 0 && (
                <View style={[styles.dayCount, { backgroundColor: isSelected ? 'rgba(255,255,255,0.3)' : `${Colors.success}20` }]}>
                  <Typography style={{ color: isSelected ? '#FFF' : Colors.success, fontSize: 9, fontWeight: '700' }}>
                    {count}
                  </Typography>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Filtro por tipo */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.typeFiltersRow}
        style={styles.typeFiltersScroll}
      >
        {TYPE_FILTERS.map(f => {
          const isActive = typeFilter === f.key;
          const color = f.key === 'todos' ? Colors.primary : TYPE_COLOR[f.key as ScheduleType];
          return (
            <TouchableOpacity
              key={f.key}
              style={[
                styles.typeChip,
                { backgroundColor: isActive ? color : `${color}10`, borderColor: isActive ? color : 'transparent' },
              ]}
              onPress={() => setTypeFilter(f.key)}
              activeOpacity={0.8}
            >
              <Typography style={{ color: isActive ? '#FFF' : color, fontSize: FontSizes.xs, fontWeight: '600' }}>
                {f.label}
              </Typography>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Divider con día seleccionado */}
      <View style={[styles.dayHeader, { backgroundColor: theme.surface }]}>
        <Ionicons name="calendar" size={16} color={Colors.success} />
        <Typography variant="label" style={{ color: theme.text }}>
          {DIAS[selectedDay]}
        </Typography>
        {schedulesForDay.length > 0 && (
          <Typography variant="caption" color={Colors.success} style={{ fontWeight: '700' }}>
            {schedulesForDay.length} {schedulesForDay.length === 1 ? 'servicio' : 'servicios'}
          </Typography>
        )}
      </View>

      {/* Lista de horarios */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {schedulesForDay.length === 0 ? (
          <EmptyState
            icon="calendar-outline"
            title="Sin servicios"
            subtitle={`No hay servicios programados para el ${DIAS[selectedDay].toLowerCase()} con el filtro seleccionado.`}
            color={Colors.success}
          />
        ) : (
          schedulesForDay.map(sch => <ScheduleItem key={sch.id} schedule={sch} />)
        )}

        {/* Info */}
        <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
          <Ionicons name="information-circle-outline" size={16} color={theme.textMuted} />
          <Typography variant="caption" muted style={{ flex: 1, lineHeight: 17 }}>
            Los horarios son recurrentes salvo indicación contraria. Consulta cambios con el equipo pastoral.
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
  todayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  daysScroll: { flexGrow: 0 },
  daysRow: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    gap: 8,
  },
  dayChip: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
    gap: 4,
    minWidth: 56,
  },
  dayCount: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.full,
  },
  typeFiltersScroll: { flexGrow: 0 },
  typeFiltersRow: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    marginBottom: 2,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: 40,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.lg,
  },
});
