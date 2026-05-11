export const SCHEMA_SQL = `
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS lesson_progress (
    id TEXT PRIMARY KEY,
    course_id TEXT NOT NULL,
    module_id TEXT NOT NULL,
    lesson_id TEXT NOT NULL UNIQUE,
    completed INTEGER NOT NULL DEFAULT 0,
    progress_percent REAL NOT NULL DEFAULT 0,
    completed_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS quiz_results (
    id TEXT PRIMARY KEY,
    quiz_id TEXT NOT NULL,
    lesson_id TEXT NOT NULL,
    course_id TEXT NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    answers TEXT NOT NULL,
    completed_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    lesson_id TEXT NOT NULL,
    course_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS favorites (
    id TEXT PRIMARY KEY,
    content_id TEXT NOT NULL,
    content_type TEXT NOT NULL CHECK(content_type IN ('course','lesson','quote')),
    course_id TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS last_viewed (
    id TEXT NOT NULL DEFAULT 'singleton' PRIMARY KEY,
    course_id TEXT NOT NULL,
    module_id TEXT NOT NULL,
    lesson_id TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_progress_course ON lesson_progress(course_id);
  CREATE INDEX IF NOT EXISTS idx_progress_lesson ON lesson_progress(lesson_id);
  CREATE INDEX IF NOT EXISTS idx_quiz_course ON quiz_results(course_id);
  CREATE INDEX IF NOT EXISTS idx_notes_lesson ON notes(lesson_id);
  CREATE INDEX IF NOT EXISTS idx_favorites_type ON favorites(content_type);
`;
