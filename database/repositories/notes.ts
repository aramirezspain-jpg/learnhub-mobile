import { type SQLiteDatabase } from 'expo-sqlite';
import { type Note } from '@/types';

function genId(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export class NotesRepository {
  constructor(private db: SQLiteDatabase) {}

  async createNote(courseId: string, lessonId: string, content: string): Promise<Note> {
    const id = genId();
    await this.db.runAsync(
      `INSERT INTO notes (id, lesson_id, course_id, content)
       VALUES (?, ?, ?, ?)`,
      [id, lessonId, courseId, content]
    );
    const note = await this.db.getFirstAsync<Note>(
      'SELECT * FROM notes WHERE id = ?',
      [id]
    );
    return note!;
  }

  async updateNote(id: string, content: string): Promise<void> {
    await this.db.runAsync(
      `UPDATE notes SET content = ?, updated_at = datetime('now') WHERE id = ?`,
      [content, id]
    );
  }

  async deleteNote(id: string): Promise<void> {
    await this.db.runAsync('DELETE FROM notes WHERE id = ?', [id]);
  }

  async getNotesByLesson(lessonId: string): Promise<Note[]> {
    return await this.db.getAllAsync<Note>(
      'SELECT * FROM notes WHERE lesson_id = ? ORDER BY created_at DESC',
      [lessonId]
    );
  }

  async getAllNotes(): Promise<Note[]> {
    return await this.db.getAllAsync<Note>(
      'SELECT * FROM notes ORDER BY updated_at DESC'
    );
  }
}
