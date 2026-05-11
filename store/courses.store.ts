import { create } from 'zustand';
import { type Course, type Level } from '@/types';

interface CoursesState {
  courses: Course[];
  levels: Level[];
  initialized: boolean;

  setCourses: (courses: Course[]) => void;
  setLevels: (levels: Level[]) => void;
  setInitialized: () => void;
  getCourseById: (id: string) => Course | undefined;
  getCoursesByLevel: (nivelId: string) => Course[];
}

export const useCoursesStore = create<CoursesState>((set, get) => ({
  courses: [],
  levels: [],
  initialized: false,

  setCourses: (courses) => set({ courses }),
  setLevels: (levels) => set({ levels }),
  setInitialized: () => set({ initialized: true }),

  getCourseById: (id) => get().courses.find(c => c.id === id),
  getCoursesByLevel: (nivelId) => get().courses.filter(c => c.nivel_id === nivelId),
}));
