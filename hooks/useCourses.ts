import { useCoursesStore } from '@/store/courses.store';
import { useProgressStore } from '@/store/progress.store';
import { ContentService } from '@/services/content.service';
import { type Course } from '@/types';

export function useCourses() {
  const courses = useCoursesStore(s => s.courses);
  const levels = useCoursesStore(s => s.levels);
  const getCourseById = useCoursesStore(s => s.getCourseById);
  const getCoursesByLevel = useCoursesStore(s => s.getCoursesByLevel);
  const getCompletedCount = useProgressStore(s => s.getCompletedCountForCourse);
  const getCourseProgress = useProgressStore(s => s.getCourseProgress);

  function getCourseWithProgress(id: string) {
    const course = getCourseById(id);
    if (!course) return undefined;
    const totalLessons = ContentService.getTotalLessons(id);
    const progress = getCourseProgress(id, totalLessons);
    return { course, progress };
  }

  function getAllCoursesWithProgress() {
    return courses.map((course: Course) => {
      const totalLessons = ContentService.getTotalLessons(course.id);
      const progress = getCourseProgress(course.id, totalLessons);
      return { course, progress };
    });
  }

  return {
    courses,
    levels,
    getCourseById,
    getCoursesByLevel,
    getCourseWithProgress,
    getAllCoursesWithProgress,
  };
}
