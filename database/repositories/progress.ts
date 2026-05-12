import { type SQLiteDatabase } from 'expo-sqlite';
import { type LessonProgress, type LastViewed } from '@/types';

function genId(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export class ProgressRepository {
  constructor(private db: SQLiteDatabase) {}

  async markLessonComplete(
    courseId: string,
    moduleId: string,
    lessonId: string
  ): Promise<void> {
    await this.db.runAsync(
      `INSERT INTO lesson_progress (id, course_id, module_id, lesson_id, completed, progress_percent, completed_at, updated_at)
       VALUES (?, ?, ?, ?, 1, 100, datetime('now'), datetime('now'))
       ON CONFLICT(lesson_id) DO UPDATE SET
         completed = 1,
         progress_percent = 100,
         completed_at = COALESCE(completed_at, datetime('now')),
         updated_at = datetime('now')`,
      [genId(), courseId, moduleId, lessonId]
    );
  }

  async updateVideoProgress(
    courseId: string,
    moduleId: string,
    lessonId: string,
    percent: number
  ): Promise<void> {
    await this.db.runAsync(
      `INSERT INTO lesson_progress (id, course_id, module_id, lesson_id, completed, progress_percent, updated_at)
       VALUES (?, ?, ?, ?, 0, ?, datetime('now'))
       ON CONFLICT(lesson_id) DO UPDATE SET
         progress_percent = CASE
           WHEN ? > lesson_progress.progress_percent AND lesson_progress.completed = 0
           THEN ?
           ELSE lesson_progress.progress_percent
         END,
         updated_at = datetime('now')`,
      [genId(), courseId, moduleId, lessonId, percent, percent, percent]
    );
  }

  async getLessonProgress(lessonId: string): Promise<LessonProgress | null> {
    return await this.db.getFirstAsync<LessonProgress>(
      'SELECT * FROM lesson_progress WHERE lesson_id = ?',
      [lessonId]
    );
  }

  async getCourseProgress(courseId: string): Promise<LessonProgress[]> {
    return await this.db.getAllAsync<LessonProgress>(
      'SELECT * FROM lesson_progress WHERE course_id = ?',
      [courseId]
    );
  }

  async getCompletedCount(courseId: string): Promise<number> {
    const result = await this.db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM lesson_progress WHERE course_id = ? AND completed = 1',
      [courseId]
    );
    return result?.count ?? 0;
  }

  async getAllProgress(): Promise<LessonProgress[]> {
    return await this.db.getAllAsync<LessonProgress>(
      'SELECT * FROM lesson_progress'
    );
  }

  async getLastViewed(): Promise<LastViewed | null> {
    return await this.db.getFirstAsync<LastViewed>(
      'SELECT * FROM last_viewed WHERE id = ?',
      ['singleton']
    );
  }

  async setLastViewed(
    courseId: string,
    moduleId: string,
    lessonId: string
  ): Promise<void> {
    await this.db.runAsync(
      `INSERT INTO last_viewed (id, course_id, module_id, lesson_id, updated_at)
       VALUES ('singleton', ?, ?, ?, datetime('now'))
       ON CONFLICT(id) DO UPDATE SET
         course_id = excluded.course_id,
         module_id = excluded.module_id,
         lesson_id = excluded.lesson_id,
         updated_at = datetime('now')`,
      [courseId, moduleId, lessonId]
    );
  }
}
