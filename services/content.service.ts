import { type Course, type Level } from '@/types';

// Importación estática — agregar nuevos cursos solo requiere importarlos aquí
import curso001 from '@/data/courses/curso_001.json';
import levelsJson from '@/data/levels.json';

const COURSE_REGISTRY: Course[] = [
  curso001 as unknown as Course,
];

export const ContentService = {
  getAllCourses(): Course[] {
    return COURSE_REGISTRY;
  },

  getCourseById(id: string): Course | undefined {
    return COURSE_REGISTRY.find(c => c.id === id);
  },

  getCoursesByLevel(nivelId: string): Course[] {
    return COURSE_REGISTRY.filter(c => c.nivel_id === nivelId);
  },

  getLevels(): Level[] {
    return levelsJson.levels as Level[];
  },

  getLevelById(id: string): Level | undefined {
    return (levelsJson.levels as Level[]).find(l => l.id === id);
  },

  getLessonById(lessonId: string) {
    for (const course of COURSE_REGISTRY) {
      for (const mod of course.modulos) {
        for (const lesson of mod.lecciones) {
          if (lesson.id === lessonId) {
            return { course, module: mod, lesson };
          }
        }
      }
    }
    return undefined;
  },

  getAdjacentLessons(lessonId: string): { prev?: string; next?: string } {
    for (const course of COURSE_REGISTRY) {
      for (const mod of course.modulos) {
        const idx = mod.lecciones.findIndex(l => l.id === lessonId);
        if (idx === -1) continue;

        const allLessons: string[] = [];
        for (const m of course.modulos) {
          for (const l of m.lecciones) {
            allLessons.push(l.id);
          }
        }
        const globalIdx = allLessons.indexOf(lessonId);
        return {
          prev: globalIdx > 0 ? allLessons[globalIdx - 1] : undefined,
          next: globalIdx < allLessons.length - 1 ? allLessons[globalIdx + 1] : undefined,
        };
      }
    }
    return {};
  },

  getTotalLessons(courseId: string): number {
    const course = COURSE_REGISTRY.find(c => c.id === courseId);
    if (!course) return 0;
    return course.modulos.reduce((sum, m) => sum + m.lecciones.length, 0);
  },

  getFirstLesson(courseId: string): { moduleId: string; lessonId: string } | undefined {
    const course = COURSE_REGISTRY.find(c => c.id === courseId);
    if (!course || course.modulos.length === 0) return undefined;
    const firstModule = course.modulos[0];
    if (firstModule.lecciones.length === 0) return undefined;
    return { moduleId: firstModule.id, lessonId: firstModule.lecciones[0].id };
  },
};
