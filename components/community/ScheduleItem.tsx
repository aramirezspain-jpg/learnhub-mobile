import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { Typography } from '@/components/ui/Typography';
import type { Schedule } from '@/types/community';

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export const TIPO_LABEL: Record<Schedule['tipo'], string> = {
  culto: 'Culto',
  discipulado: 'Discipulado',
  escuela_biblica: 'Esc. Bíblica',
  reunion: 'Reunión',
  actividad: 'Actividad',
};

const TIPO_COLOR: Record<Schedule['tipo'], string> = {
  culto: Colors.primary,
  discipulado: Colors.secondary,
  escuela_biblica: Colors.accent,
  reunion: Colors.info,
  actividad: Colors.success,
};

const TIPO_ICON: Record<Schedule['tipo'], string> = {
  culto: 'people',
  discipulado: 'book',
  escuela_biblica: 'school',
  reunion: 'chatbubbles',
  actividad: 'bicycle',
};

interface Props {
  schedule: Schedule;
}

export function ScheduleItem({ schedule: sch }: Props) {
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  const color = TIPO_COLOR[sch.tipo];
  const dayLabel = sch.dia_semana !== undefined ? DIAS[sch.dia_semana] : '';

  return (
    <View style={[styles.card, { backgroundColor: theme.card }, Shadows.sm]}>
      {/* Hora */}
      <View style={[styles.timeBlock, { backgroundColor: `${color}12` }]}>
        <Typography style={{ color, fontSize: 15, fontWeight: '700', lineHeight: 18 }}>
          {sch.hora}
        </Typography>
        <Typography style={{ color, fontSize: 9, opacity: 0.8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {dayLabel.slice(0, 3)}
        </Typography>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Typography variant="label" style={{ color: theme.text }} numberOfLines={1}>
          {sch.titulo}
        </Typography>
        {sch.descripcion ? (
          <Typography variant="caption" secondary numberOfLines={1}>
            {sch.descripcion}
          </Typography>
        ) : null}
        <View style={styles.meta}>
          <Ionicons name="location-outline" size={11} color={theme.textMuted} />
          <Typography variant="caption" muted numberOfLines={1} style={{ flex: 1 }}>
            {sch.ubicacion}
          </Typography>
        </View>
        <View style={styles.meta}>
          <Ionicons name="person-outline" size={11} color={theme.textMuted} />
          <Typography variant="caption" muted numberOfLines={1} style={{ flex: 1 }}>
            {sch.responsable}
          </Typography>
        </View>
      </View>

      {/* Tipo badge */}
      <View style={styles.typeBadge}>
        <View style={[styles.typeChip, { backgroundColor: `${color}15` }]}>
          <Ionicons name={`${TIPO_ICON[sch.tipo]}-outline` as any} size={12} color={color} />
          <Typography style={{ color, fontSize: 9, fontWeight: '700' }}>
            {TIPO_LABEL[sch.tipo]}
          </Typography>
        </View>
        {sch.es_recurrente && (
          <View style={[styles.recChip, { backgroundColor: `${theme.border}` }]}>
            <Ionicons name="repeat" size={10} color={theme.textMuted} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: 10,
    alignItems: 'stretch',
  },
  timeBlock: {
    width: 68,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  info: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    gap: 4,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typeBadge: {
    padding: 10,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    gap: 6,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  recChip: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
