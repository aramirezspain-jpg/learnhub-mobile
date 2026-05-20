import React from 'react';
import { View, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { Typography } from '@/components/ui/Typography';
import type { Contact } from '@/types/community';

const TYPE_LABEL: Record<Contact['tipo'], string> = {
  lider: 'Líder',
  ministerio: 'Ministerio',
  grupo: 'Grupo',
};

const TYPE_ICON: Record<Contact['tipo'], string> = {
  lider: 'person',
  ministerio: 'star',
  grupo: 'people',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');
}

interface Props {
  contact: Contact;
}

export function ContactCard({ contact }: Props) {
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];

  const openWhatsApp = () => {
    const num = contact.whatsapp?.replace(/\D/g, '') ?? '';
    Linking.openURL(`https://wa.me/${num}`).catch(() => {});
  };

  const openTelegram = () => {
    const handle = (contact.telegram ?? '').replace('@', '');
    Linking.openURL(`https://t.me/${handle}`).catch(() => {});
  };

  const openEmail = () => {
    Linking.openURL(`mailto:${contact.email}`).catch(() => {});
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.card }, Shadows.sm]}>
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: contact.color }]}>
        <Typography style={{ color: '#FFF', fontSize: 16, fontWeight: '700' }}>
          {getInitials(contact.nombre)}
        </Typography>
      </View>

      {/* Info */}
      <View style={styles.info}>
        {/* Header row */}
        <View style={styles.headerRow}>
          <View style={[styles.typeBadge, { backgroundColor: `${contact.color}15` }]}>
            <Ionicons name={`${TYPE_ICON[contact.tipo]}-outline` as any} size={10} color={contact.color} />
            <Typography style={{ color: contact.color, fontSize: 9, fontWeight: '700', textTransform: 'uppercase' }}>
              {TYPE_LABEL[contact.tipo]}
            </Typography>
          </View>
          {contact.zona ? (
            <Typography variant="caption" muted style={{ fontSize: 10 }}>
              {contact.zona}
            </Typography>
          ) : null}
        </View>

        {/* Nombre */}
        <Typography variant="label" style={{ color: theme.text }} numberOfLines={1}>
          {contact.nombre}
        </Typography>

        {/* Cargo */}
        {contact.cargo ? (
          <Typography variant="caption" color={contact.color} style={{ fontWeight: '600', fontSize: 11 }}>
            {contact.cargo}
          </Typography>
        ) : null}

        {/* Descripción */}
        {contact.descripcion ? (
          <Typography variant="caption" secondary numberOfLines={2} style={{ lineHeight: 17 }}>
            {contact.descripcion}
          </Typography>
        ) : null}

        {/* Horario de atención */}
        {contact.horario_atencion ? (
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={11} color={Colors.success} />
            <Typography style={{ color: Colors.success, fontSize: 11, fontWeight: '500' }}>
              {contact.horario_atencion}
            </Typography>
          </View>
        ) : null}

        {/* Ubicación */}
        {contact.ubicacion ? (
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={11} color={theme.textMuted} />
            <Typography variant="caption" muted numberOfLines={1}>
              {contact.ubicacion}
            </Typography>
          </View>
        ) : null}

        {/* Botones de contacto */}
        {(contact.whatsapp || contact.telegram || contact.email) ? (
          <View style={styles.contactBtns}>
            {contact.whatsapp ? (
              <TouchableOpacity
                style={[styles.contactBtn, { backgroundColor: '#25D36615' }]}
                onPress={openWhatsApp}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-whatsapp" size={14} color="#25D366" />
                <Typography style={{ color: '#25D366', fontSize: 11, fontWeight: '600' }}>
                  WhatsApp
                </Typography>
              </TouchableOpacity>
            ) : null}
            {contact.telegram ? (
              <TouchableOpacity
                style={[styles.contactBtn, { backgroundColor: '#0088CC15' }]}
                onPress={openTelegram}
                activeOpacity={0.8}
              >
                <Ionicons name="paper-plane-outline" size={14} color="#0088CC" />
                <Typography style={{ color: '#0088CC', fontSize: 11, fontWeight: '600' }}>
                  Telegram
                </Typography>
              </TouchableOpacity>
            ) : null}
            {contact.email ? (
              <TouchableOpacity
                style={[styles.contactBtn, { backgroundColor: '#EA433515' }]}
                onPress={openEmail}
                activeOpacity={0.8}
              >
                <Ionicons name="mail-outline" size={14} color="#EA4335" />
                <Typography style={{ color: '#EA4335', fontSize: 11, fontWeight: '600' }}>
                  Email
                </Typography>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: 12,
    gap: Spacing.md,
    alignItems: 'flex-start',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  info: {
    flex: 1,
    gap: 5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contactBtns: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
  },
});
