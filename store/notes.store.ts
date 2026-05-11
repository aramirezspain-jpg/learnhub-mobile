import { create } from 'zustand';
import { type Note } from '@/types';

interface NotesState {
  notes: Note[];
  setAllNotes: (notes: Note[]) => void;
  addNote: (note: Note) => void;
  updateNoteInStore: (id: string, content: string) => void;
  removeNote: (id: string) => void;
  getNotesByLesson: (lessonId: string) => Note[];
  hasNoteForLesson: (lessonId: string) => boolean;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],

  setAllNotes: (notes) => set({ notes }),

  addNote: (note) => set(state => ({ notes: [note, ...state.notes] })),

  updateNoteInStore: (id, content) =>
    set(state => ({
      notes: state.notes.map(n =>
        n.id === id ? { ...n, content, updated_at: new Date().toISOString() } : n
      ),
    })),

  removeNote: (id) =>
    set(state => ({ notes: state.notes.filter(n => n.id !== id) })),

  getNotesByLesson: (lessonId) =>
    get().notes.filter(n => n.lesson_id === lessonId),

  hasNoteForLesson: (lessonId) =>
    get().notes.some(n => n.lesson_id === lessonId),
}));
