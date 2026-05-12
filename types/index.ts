// ─── Contenido ─────────────────────────────────────────────────────────────

export interface Level {
  id: string;
  nombre: string;
  descripcion: string;
  color: string;
  icono: string;
  orden: number;
}

export interface BibleVerse {
  referencia: string;
  texto: string;
}

export interface ContentSection {
  subtitulo: string;
  texto: string;
}

export interface LessonContent {
  introduccion: string;
  secciones: ContentSection[];
  puntos_clave: string[];
  citas_biblicas: BibleVerse[];
  reflexion?: string;
}

export type LessonType = 'lectura' | 'video' | 'audio' | 'pdf' | 'practica';

export interface Resource {
  id: string;
  tipo: 'pdf' | 'video' | 'audio' | 'enlace';
  titulo: string;
  url?: string;
}

export interface QuizQuestion {
  id: string;
  pregunta: string;
  opciones: string[];
  respuesta_correcta: number;
  explicacion: string;
}

export interface Quiz {
  id: string;
  preguntas: QuizQuestion[];
}

export interface Lesson {
  id: string;
  orden: number;
  titulo: string;
  tipo: LessonType;
  duracion_minutos: number;
  contenido: LessonContent;
  quiz?: Quiz;
  recursos: Resource[];
  video_url?: string;
}

export interface Module {
  id: string;
  orden: number;
  titulo: string;
  descripcion: string;
  icono: string;
  lecciones: Lesson[];
}

export type DifficultyLevel = 'principiante' | 'intermedio' | 'avanzado';

export interface Course {
  id: string;
  nivel_id: string;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  banner_color: string;
  duracion_estimada: string;
  total_lecciones: number;
  nivel_dificultad: DifficultyLevel;
  tags: string[];
  instructor: string;
  modulos: Module[];
}

// ─── Progreso ───────────────────────────────────────────────────────────────

export interface LessonProgress {
  id: string;
  course_id: string;
  module_id: string;
  lesson_id: string;
  completed: number; // 0 | 1 (SQLite boolean)
  progress_percent: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuizResult {
  id: string;
  quiz_id: string;
  lesson_id: string;
  course_id: string;
  score: number;
  total_questions: number;
  answers: string; // JSON string
  completed_at: string;
}

export interface Note {
  id: string;
  lesson_id: string;
  course_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: string;
  content_id: string;
  content_type: 'course' | 'lesson' | 'quote';
  course_id: string | null;
  created_at: string;
}

export interface LastViewed {
  course_id: string;
  module_id: string;
  lesson_id: string;
  updated_at: string;
}

export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  language: string;
  notifications: boolean;
  font_size: 'small' | 'medium' | 'large';
}

// ─── Computados ─────────────────────────────────────────────────────────────

export interface CourseProgress {
  course_id: string;
  total_lessons: number;
  completed_lessons: number;
  progress_percent: number;
  last_lesson_id?: string;
  last_module_id?: string;
}

export interface QuizAnswerRecord {
  question_id: string;
  selected: number;
  correct: boolean;
}
