import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { Typography } from '@/components/ui/Typography';
import type { Announcement } from '@/types/community';

const PRIORITY_COLOR: Record<Announcement['prioridad'], string> = {
  alta: Colors.error,
  media: Colors.warning,
  baja: Colors.success,
};

const PRIORITY_LABEL: Record<Announcement['prioridad'], string> = {
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja',
};

const CATEGORY_LABEL: Record<Announcement['categoria'], string> = {
  evento: 'Evento',
  campana: 'Campaña',
  ayuno: 'Ayuno',
  actividad: 'Actividad',
  general: 'General',
};

const CATEGORY_ICON: Record<Announcement['categoria'], string> = {
  evento: 'calendar',
  campana: 'heart',
  ayuno: 'flame',
  actividad: 'people',
  general: 'information-circle',
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

interface Props {
  announcement: Announcement;
  onPress?: () => void;
  isRead?: boolean;
  expanded?: boolean;
}

export function AnnouncementCard({ announcement: ann, onPress, isRead = false, expanded = false }: Props) {
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];

  const isDestacado = ann.estado === 'destacado';
  const priorityColor = PRIORITY_COLOR[ann.prioridad];
  const accentColor = isDestacado ? Colors.accent : priorityColor;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: theme.card },
        Shadows.sm,
        isDestacado && { borderColor: `${Colors.accent}35`, borderWidth: 1.5 },
        isRead && !isDestacado && styles.cardRead,
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Accent lateral */}
      <View style={[styles.accent, { backgroundColor: accentColor }]} />

      <View style={styles.body}>
        {/* Encabezado */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            {isDestacado ? (
              <View style={[styles.destacadoBadge, { backgroundColor: `${Colors.accent}18` }]}>
                <Ionicons name="star" size={10} color={Colors.accent} />
                <Typography style={{ color: Colors.accent, fontSize: 9, fontWeight: '800', letterSpacing: 0.5 }}>
                  DESTACADO
                </Typography>
              </View>
            ) : (
              <View style={[styles.categoryBadge, { backgroundColor: `${accentColor}15` }]}>
                <Ionicons
                  name={`${CATEGORY_ICON[ann.categoria]}-outline` as any}
                  size={10}
                  color={accentColor}
                />
                <Typography style={{ color: accentColor, fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {CATEGORY_LABEL[ann.categoria]}
                </Typography>
              </View>
            )}
            {!isRead && <View style={styles.unreadDot} />}
          </View>
          <Typography variant="caption" color={Colors.primary} style={{ fontSize: 10 }}>
            {formatDateShort(ann.fecha)}
          </Typography>
        </View>

        {/* Categoría (si es destacado, mostramos también la categoría) */}
        {isDestacado && (
          <View style={[styles.categoryBadge, { backgroundColor: `${priorityColor}12`, alignSelf: 'flex-start' }]}>
            <Ionicons
              name={`${CATEGORY_ICON[ann.categoria]}-outline` as any}
              size={9}
              color={priorityColor}
            />
            <Typography style={{ color: priorityColor, fontSize: 9, fontWeight: '600', textTransform: 'uppercase' }}>
              {CATEGORY_LABEL[ann.categoria]}
            </Typography>
          </View>
        )}

        {/* Título */}
        <Typography
          variant="label"
          style={{ color: isDestacado ? Colors.accent : theme.text }}
          numberOfLines={expanded ? undefined : 1}
        >
          {ann.titulo}
        </Typography>

        {/* Descripción */}
        <Typography
          variant="caption"
          secondary
          style={{ lineHeight: 18 }}
          numberOfLines={expanded ? undefined : 2}
        >
          {ann.descripcion}
        </Typography>

        {/* Footer: prioridad + expiración */}
        <View style={styles.footer}>
          <View style={[styles.priorityBadge, { backgroundColor: `${priorityColor}12` }]}>
            <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
            <Typography style={{ color: priorityColor, fontSize: 9, fontWeight: '600' }}>
              Prioridad {PRIORITY_LABEL[ann.prioridad]}
            </Typography>
          </View>
          <View style={styles.footerRight}>
            {ann.fecha_expiracion && (
              <View style={[styles.expBadge, { backgroundColor: theme.surface }]}>
                <Ionicons name="time-outline" size={9} color={theme.textMuted} />
                <Typography style={{ color: theme.textMuted, fontSize: 9 }}>
                  Exp: {formatDate(ann.fecha_expiracion)}
                </Typography>
              </View>
            )}
            {!expanded && (
              <Ionicons name="chevron-forward" size={14} color={theme.textMuted} />
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: 10,
  },
  cardRead: {
    opacity: 0.65,
  },
  accent: {
    width: 4,
  },
  body: {
    flex: 1,
    padding: Spacing.md,
    gap: 7,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  destacadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  priorityDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  expBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
});
