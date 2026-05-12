import { useCallback } from 'react';
import { useDatabase } from './useDatabase';
import { ProgressRepository } from '@/database/repositories/progress';
import { useProgressStore } from '@/store/progress.store';
import { type LessonProgress } from '@/types';

export function useProgress() {
  const db = useDatabase();
  const store = useProgressStore();

  const markLessonComplete = useCallback(
    async (courseId: string, moduleId: string, lessonId: string) => {
      const repo = new ProgressRepository(db);
      await repo.markLessonComplete(courseId, moduleId, lessonId);
      const updated: LessonProgress = {
        id: lessonId,
        course_id: courseId,
        module_id: moduleId,
        lesson_id: lessonId,
        completed: 1,
        progress_percent: 100,
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      store.markComplete(lessonId, updated);
    },
    [db, store]
  );

  const saveVideoProgress = useCallback(
    async (courseId: string, moduleId: string, lessonId: string, percent: number) => {
      store.updateProgress(lessonId, percent);
      const repo = new ProgressRepository(db);
      await repo.updateVideoProgress(courseId, moduleId, lessonId, percent);
    },
    [db, store]
  );

  const recordLastViewed = useCallback(
    async (courseId: string, moduleId: string, lessonId: string) => {
      const repo = new ProgressRepository(db);
      await repo.setLastViewed(courseId, moduleId, lessonId);
      store.setLastViewed({
        course_id: courseId,
        module_id: moduleId,
        lesson_id: lessonId,
        updated_at: new Date().toISOString(),
      });
    },
    [db, store]
  );

  return {
    lessonProgress: store.lessonProgress,
    lastViewed: store.lastViewed,
    isLessonComplete: store.isLessonComplete,
    getCourseProgress: store.getCourseProgress,
    getCompletedCountForCourse: store.getCompletedCountForCourse,
    markLessonComplete,
    recordLastViewed,
    saveVideoProgress,
  };
}
