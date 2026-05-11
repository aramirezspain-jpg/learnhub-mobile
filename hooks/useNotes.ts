import { useCallback } from 'react';
import { useDatabase } from './useDatabase';
import { NotesRepository } from '@/database/repositories/notes';
import { useNotesStore } from '@/store/notes.store';

export function useNotes() {
  const db = useDatabase();
  const store = useNotesStore();

  const createNote = useCallback(
    async (courseId: string, lessonId: string, content: string) => {
      const repo = new NotesRepository(db);
      const note = await repo.createNote(courseId, lessonId, content);
      store.addNote(note);
      return note;
    },
    [db, store]
  );

  const updateNote = useCallback(
    async (id: string, content: string) => {
      const repo = new NotesRepository(db);
      store.updateNoteInStore(id, content);
      await repo.updateNote(id, content);
    },
    [db, store]
  );

  const deleteNote = useCallback(
    async (id: string) => {
      const repo = new NotesRepository(db);
      store.removeNote(id);
      await repo.deleteNote(id);
    },
    [db, store]
  );

  return {
    notes: store.notes,
    getNotesByLesson: store.getNotesByLesson,
    hasNoteForLesson: store.hasNoteForLesson,
    createNote,
    updateNote,
    deleteNote,
  };
}
