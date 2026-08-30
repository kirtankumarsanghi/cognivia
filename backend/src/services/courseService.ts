import { supabaseAdmin } from '../config/supabase';

export const courseService = {
  async getCourses() {
    const { data, error } = await supabaseAdmin.from('courses').select('*, lessons(*, concepts(*))');
    if (error) throw error;
    return data;
  },

  async getCourseById(id: string) {
    const { data, error } = await supabaseAdmin
      .from('courses')
      .select('*, lessons(*, concepts(*))')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async createCourse(name: string, code: string, description: string, educatorId: string) {
    const { data, error } = await supabaseAdmin
      .from('courses')
      .insert({ 
        name, 
        code, 
        description: description || '',
        educator_id: educatorId 
      })
      .select('*, lessons(*, concepts(*))')
      .single();
    if (error) throw error;
    return data;
  },

  async addLesson(courseId: string, title: string, description: string, orderNumber: number) {
    const { data, error } = await supabaseAdmin
      .from('lessons')
      .insert({
        course_id: courseId,
        title,
        description: description || '',
        order_number: orderNumber
      })
      .select('*, concepts(*)')
      .single();
    if (error) throw error;
    return data;
  },

  async addConcept(lessonId: string, name: string, description: string, difficulty: string) {
    const { data, error } = await supabaseAdmin
      .from('concepts')
      .insert({
        lesson_id: lessonId,
        name,
        description: description || '',
        difficulty: difficulty || 'beginner'
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};
