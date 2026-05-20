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
      {/* Bloque de hora */}
      <View style={[styles.timeBlock, { backgroundColor: `${color}12` }]}>
        <Typography style={{ color, fontSize: 15, fontWeight: '700', lineHeight: 18 }}>
          {sch.hora}
        </Typography>
        <Typography style={{ color, fontSize: 9, opacity: 0.8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {dayLabel.slice(0, 3)}
        </Typography>
      </View>

      {/* Contenido */}
      <View style={styles.info}>
        {/* Título */}
        <Typography variant="label" style={{ color: theme.text }} numberOfLines={1}>
          {sch.titulo}
        </Typography>

        {/* Descripción */}
        {sch.descripcion ? (
          <Typography variant="caption" secondary numberOfLines={1}>
            {sch.descripcion}
          </Typography>
        ) : null}

        {/* Ubicación */}
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={11} color={theme.textMuted} />
          <Typography variant="caption" muted numberOfLines={1} style={{ flex: 1 }}>
            {sch.ubicacion}
          </Typography>
        </View>

        {/* Responsable */}
        <View style={styles.metaRow}>
          <Ionicons name="person-outline" size={11} color={theme.textMuted} />
          <Typography variant="caption" muted numberOfLines={1} style={{ flex: 1 }}>
            {sch.responsable}
          </Typography>
        </View>

        {/* Chips fila inferior */}
        <View style={styles.chipsRow}>
          {/* Categoría */}
          {sch.categoria ? (
            <View style={[styles.catChip, { backgroundColor: theme.surface }]}>
              <Typography style={{ color: theme.textSecondary, fontSize: 9, fontWeight: '600' }}>
                {sch.categoria}
              </Typography>
            </View>
          ) : null}

          {/* Recurrente */}
          {sch.es_recurrente && (
            <View style={[styles.recChip, { backgroundColor: `${color}10` }]}>
              <Ionicons name="repeat" size={9} color={color} />
              <Typography style={{ color, fontSize: 9, fontWeight: '600' }}>Semanal</Typography>
            </View>
          )}

          {/* Recordatorio (placeholder Phase 4) */}
          {sch.recordatorio && (
            <View style={[styles.recChip, { backgroundColor: `${Colors.info}10` }]}>
              <Ionicons name="notifications-outline" size={9} color={Colors.info} />
              <Typography style={{ color: Colors.info, fontSize: 9, fontWeight: '600' }}>
                Recuerdo
              </Typography>
            </View>
          )}
        </View>
      </View>

      {/* Tipo badge (columna derecha) */}
      <View style={styles.typeCol}>
        <View style={[styles.typeChip, { backgroundColor: `${color}15` }]}>
          <Ionicons name={`${TIPO_ICON[sch.tipo]}-outline` as any} size={12} color={color} />
          <Typography style={{ color, fontSize: 9, fontWeight: '700' }}>
            {TIPO_LABEL[sch.tipo]}
          </Typography>
        </View>
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 3,
  },
  catChip: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  recChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  typeCol: {
    padding: 10,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
});
