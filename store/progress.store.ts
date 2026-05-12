import { create } from 'zustand';
import { type LessonProgress, type CourseProgress, type LastViewed } from '@/types';

interface ProgressState {
  lessonProgress: Record<string, LessonProgress>; // keyed by lesson_id
  lastViewed: LastViewed | null;
  quizScores: Record<string, number>; // keyed by quiz_id → score

  // Acciones
  setAllProgress: (progress: LessonProgress[]) => void;
  markComplete: (lessonId: string, progress: LessonProgress) => void;
  updateProgress: (lessonId: string, percent: number) => void;
  setLastViewed: (data: LastViewed) => void;
  setQuizScore: (quizId: string, score: number) => void;

  // Selectores computados
  isLessonComplete: (lessonId: string) => boolean;
  getCourseProgress: (courseId: string, totalLessons: number) => CourseProgress;
  getCompletedCountForCourse: (courseId: string) => number;
  getCompletedCountForModule: (moduleId: string) => number;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  lessonProgress: {},
  lastViewed: null,
  quizScores: {},

  setAllProgress: (progress) => {
    const map: Record<string, LessonProgress> = {};
    for (const p of progress) {
      map[p.lesson_id] = p;
    }
    set({ lessonProgress: map });
  },

  markComplete: (lessonId, progress) => {
    set(state => ({
      lessonProgress: { ...state.lessonProgress, [lessonId]: progress },
    }));
  },

  updateProgress: (lessonId, percent) => {
    set(state => {
      const existing = state.lessonProgress[lessonId];
      if (existing?.completed === 1) return state;
      const updated: LessonProgress = existing
        ? { ...existing, progress_percent: Math.max(existing.progress_percent, percent), updated_at: new Date().toISOString() }
        : {
            id: lessonId,
            course_id: '',
            module_id: '',
            lesson_id: lessonId,
            completed: 0,
            progress_percent: percent,
            completed_at: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
      return { lessonProgress: { ...state.lessonProgress, [lessonId]: updated } };
    });
  },

  setLastViewed: (data) => set({ lastViewed: data }),

  setQuizScore: (quizId, score) => {
    set(state => ({
      quizScores: { ...state.quizScores, [quizId]: score },
    }));
  },

  isLessonComplete: (lessonId) => {
    const p = get().lessonProgress[lessonId];
    return p?.completed === 1;
  },

  getCompletedCountForCourse: (courseId) => {
    return Object.values(get().lessonProgress).filter(
      p => p.course_id === courseId && p.completed === 1
    ).length;
  },

  getCourseProgress: (courseId, totalLessons) => {
    const completed = get().getCompletedCountForCourse(courseId);
    const percent = totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;
    return {
      course_id: courseId,
      total_lessons: totalLessons,
      completed_lessons: completed,
      progress_percent: percent,
    };
  },

  getCompletedCountForModule: (moduleId) => {
    return Object.values(get().lessonProgress).filter(
      p => p.module_id === moduleId && p.completed === 1
    ).length;
  },
}));
