import { create } from 'zustand';
import { type LessonProgress, type CourseProgress, type LastViewed } from '@/types';

interface ProgressState {
  lessonProgress: Record<string, LessonProgress>; // keyed by lesson_id
  lastViewed: LastViewed | null;
  quizScores: Record<string, number>; // keyed by quiz_id → score

  // Acciones
  setAllProgress: (progress: LessonProgress[]) => void;
  markComplete: (lessonId: string, progress: LessonProgress) => void;
  setLastViewed: (data: LastViewed) => void;
  setQuizScore: (quizId: string, score: number) => void;

  // Selectores computados
  isLessonComplete: (lessonId: string) => boolean;
  getCourseProgress: (courseId: string, totalLessons: number) => CourseProgress;
  getCompletedCountForCourse: (courseId: string) => number;
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
}));
