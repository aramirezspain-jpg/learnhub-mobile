import React, { useState, useRef } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Spacing, BorderRadius, Shadows, FontSizes } from '@/constants/theme';
import { Typography } from '@/components/ui/Typography';
import { EmptyState } from '@/components/ui/EmptyState';
import { useNotes } from '@/hooks/useNotes';
import { useNotesStore } from '@/store/notes.store';
import { ContentService } from '@/services/content.service';
import { type Note } from '@/types';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

function NoteCard({
  note,
  onEdit,
  onDelete,
}: {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}) {
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  return (
    <View style={[styles.noteCard, { backgroundColor: theme.card }, Shadows.sm]}>
      <View style={[styles.noteAccent, { backgroundColor: Colors.primary }]} />
      <View style={styles.noteContent}>
        <Typography variant="body" style={{ color: theme.text, lineHeight: 22 }}>
          {note.content}
        </Typography>
        <View style={styles.noteMeta}>
          <Ionicons name="time-outline" size={11} color={theme.textMuted} />
          <Typography variant="caption" muted style={{ marginLeft: 4 }}>
            {formatDate(note.updated_at)}
          </Typography>
        </View>
      </View>
      <View style={styles.noteActions}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: `${Colors.primary}15` }]}
          onPress={() => onEdit(note)}
        >
          <Ionicons name="pencil" size={15} color={Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: `${Colors.error}12` }]}
          onPress={() => onDelete(note.id)}
        >
          <Ionicons name="trash-outline" size={15} color={Colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function NotesScreen() {
  const { id: lessonId, courseId } = useLocalSearchParams<{ id: string; courseId: string }>();
  const router = useRouter();
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];
  const inputRef = useRef<TextInput>(null);

  const { createNote, updateNote, deleteNote } = useNotes();
  const allNotes = useNotesStore(s => s.notes);
  const lessonNotes = allNotes.filter(n => n.lesson_id === lessonId);

  const [text, setText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const found = ContentService.getLessonById(lessonId);
  const lessonTitle = found?.lesson.titulo ?? 'Lección';

  function handleEdit(note: Note) {
    setEditingId(note.id);
    setText(note.content);
    inputRef.current?.focus();
  }

  function handleCancelEdit() {
    setEditingId(null);
    setText('');
  }

  async function handleDelete(id: string) {
    Alert.alert('Eliminar nota', '¿Eliminar esta nota?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await deleteNote(id);
          if (editingId === id) {
            setEditingId(null);
            setText('');
          }
        },
      },
    ]);
  }

  async function handleSave() {
    const trimmed = text.trim();
    if (!trimmed || saving || !lessonId || !courseId) return;
    setSaving(true);
    try {
      if (editingId) {
        await updateNote(editingId, trimmed);
        setEditingId(null);
      } else {
        await createNote(courseId, lessonId, trimmed);
      }
      setText('');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Typography variant="overline" secondary>Notas</Typography>
          <Typography variant="label" style={{ color: theme.text }} numberOfLines={1}>
            {lessonTitle}
          </Typography>
        </View>
        <View style={[styles.noteCount, { backgroundColor: `${Colors.primary}18` }]}>
          <Typography variant="label" color={Colors.primary}>
            {lessonNotes.length}
          </Typography>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Lista de notas */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.notesList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {lessonNotes.length === 0 ? (
            <EmptyState
              icon="document-text-outline"
              title="Sin notas aún"
              subtitle="Escribe tu primera nota sobre esta lección."
              color={Colors.primary}
            />
          ) : (
            lessonNotes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          )}
        </ScrollView>

        {/* Editor */}
        <View style={[styles.editor, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
          {editingId && (
            <View style={styles.editingBanner}>
              <Ionicons name="pencil" size={13} color={Colors.primary} />
              <Typography variant="caption" color={Colors.primary} style={{ flex: 1 }}>
                Editando nota
              </Typography>
              <TouchableOpacity onPress={handleCancelEdit}>
                <Ionicons name="close" size={16} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.inputRow}>
            <TextInput
              ref={inputRef}
              style={[
                styles.input,
                {
                  backgroundColor: theme.inputBg,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              placeholder={editingId ? 'Editar nota...' : 'Escribe una nota...'}
              placeholderTextColor={theme.textMuted}
              value={text}
              onChangeText={setText}
              multiline
              maxLength={2000}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[
                styles.saveBtn,
                {
                  backgroundColor: text.trim() ? Colors.primary : theme.border,
                  opacity: saving ? 0.7 : 1,
                },
              ]}
              onPress={handleSave}
              disabled={!text.trim() || saving}
            >
              <Ionicons name={editingId ? 'checkmark' : 'add'} size={22} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  backBtn: { padding: 4 },
  headerCenter: { flex: 1, gap: 2 },
  noteCount: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notesList: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: 16,
    gap: 10,
  },
  noteCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  noteAccent: { width: 4 },
  noteContent: { flex: 1, padding: Spacing.md, gap: 8 },
  noteMeta: { flexDirection: 'row', alignItems: 'center' },
  noteActions: {
    padding: 10,
    gap: 8,
    justifyContent: 'center',
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editor: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.lg,
    paddingTop: 10,
    paddingBottom: Spacing.md,
    gap: 8,
  },
  editingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: FontSizes.md,
    minHeight: 80,
    maxHeight: 160,
  },
  saveBtn: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
