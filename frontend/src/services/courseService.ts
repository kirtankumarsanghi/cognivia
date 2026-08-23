import { useApi } from '../hooks/useApi';

export function useCourseService() {
  const api = useApi();

  return {
    getCourses: async () => {
      return await api.get('/courses');
    },
    getCourseById: async (id: string) => {
      return await api.get(`/courses/${id}`);
    },
    createCourse: async (name: string, code: string, description: string) => {
      return await api.post('/courses', { name, code, description });
    },
    addLesson: async (courseId: string, title: string, description: string, orderNumber: number) => {
      return await api.post(`/courses/${courseId}/lessons`, { title, description, orderNumber });
    },
    addConcept: async (lessonId: string, name: string, description: string, difficulty: string) => {
      return await api.post(`/lessons/${lessonId}/concepts`, { name, description, difficulty });
    }
  };
}
