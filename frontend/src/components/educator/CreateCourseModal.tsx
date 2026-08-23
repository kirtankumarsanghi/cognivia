import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useCourseService } from '../../services/courseService';

interface ConceptForm {
  id: string;
  name: string;
  description: string;
  difficulty: string;
}

interface LessonForm {
  id: string;
  title: string;
  description: string;
  orderNumber: number;
  concepts: ConceptForm[];
}

export default function CreateCourseModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const courseService = useCourseService();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [course, setCourse] = useState({ name: '', code: '', description: '' });
  const [lessons, setLessons] = useState<LessonForm[]>([]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addLesson = () => {
    setLessons([...lessons, {
      id: generateId(),
      title: '',
      description: '',
      orderNumber: lessons.length + 1,
      concepts: []
    }]);
  };

  const addConcept = (lessonId: string) => {
    setLessons(lessons.map(l => {
      if (l.id === lessonId) {
        return {
          ...l,
          concepts: [...l.concepts, {
            id: generateId(),
            name: '',
            description: '',
            difficulty: 'beginner'
          }]
        };
      }
      return l;
    }));
  };

  const updateLesson = (id: string, field: string, value: any) => {
    setLessons(lessons.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const updateConcept = (lessonId: string, conceptId: string, field: string, value: string) => {
    setLessons(lessons.map(l => {
      if (l.id === lessonId) {
        return {
          ...l,
          concepts: l.concepts.map(c => c.id === conceptId ? { ...c, [field]: value } : c)
        };
      }
      return l;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!course.name || !course.code) throw new Error('Course name and code are required');

      // 1. Create Course
      const createdCourse = await courseService.createCourse(course.name, course.code, course.description);

      // 2. Create Lessons and Concepts
      for (const lesson of lessons) {
        if (!lesson.title) continue;
        const createdLesson = await courseService.addLesson(createdCourse.id, lesson.title, lesson.description, lesson.orderNumber);
        
        for (const concept of lesson.concepts) {
          if (!concept.name) continue;
          await courseService.addConcept(createdLesson.id, concept.name, concept.description, concept.difficulty);
        }
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl"
      >
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Create New Course</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200">
              {error}
            </div>
          )}

          <form id="create-course-form" onSubmit={handleSubmit} className="space-y-8">
            {/* Course Basics */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-200 border-b border-slate-800 pb-2">Course Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Course Name</label>
                  <input 
                    type="text" 
                    value={course.name}
                    onChange={e => setCourse({...course, name: e.target.value})}
                    placeholder="e.g. Introduction to React"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Course Code</label>
                  <input 
                    type="text" 
                    value={course.code}
                    onChange={e => setCourse({...course, code: e.target.value})}
                    placeholder="e.g. CS102"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Description</label>
                <textarea 
                  value={course.description}
                  onChange={e => setCourse({...course, description: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors min-h-[100px]"
                />
              </div>
            </div>

            {/* Lessons */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <h3 className="text-lg font-semibold text-slate-200">Curriculum Structure</h3>
                <button 
                  type="button" 
                  onClick={addLesson}
                  className="text-sm bg-slate-800 hover:bg-slate-700 text-white px-3 py-1 rounded transition-colors"
                >
                  + Add Lesson
                </button>
              </div>

              {lessons.map((lesson, idx) => (
                <div key={lesson.id} className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <input 
                        type="text" 
                        value={lesson.title}
                        onChange={e => updateLesson(lesson.id, 'title', e.target.value)}
                        placeholder={`Lesson ${idx + 1} Title`}
                        className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white text-sm focus:border-cyan-500 outline-none"
                      />
                    </div>
                  </div>
                  
                  {/* Concepts */}
                  <div className="pl-6 border-l-2 border-slate-700 space-y-3">
                    {lesson.concepts.map((concept, cIdx) => (
                      <div key={concept.id} className="flex gap-3 items-start">
                        <input 
                          type="text" 
                          value={concept.name}
                          onChange={e => updateConcept(lesson.id, concept.id, 'name', e.target.value)}
                          placeholder={`Concept ${cIdx + 1} Name`}
                          className="flex-1 bg-slate-900 border border-slate-600 rounded px-3 py-1.5 text-white text-sm focus:border-cyan-500 outline-none"
                        />
                        <select
                          value={concept.difficulty}
                          onChange={e => updateConcept(lesson.id, concept.id, 'difficulty', e.target.value)}
                          className="bg-slate-900 border border-slate-600 rounded px-3 py-1.5 text-white text-sm focus:border-cyan-500 outline-none"
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </div>
                    ))}
                    <button 
                      type="button" 
                      onClick={() => addConcept(lesson.id)}
                      className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      + Add Concept
                    </button>
                  </div>
                </div>
              ))}
              {lessons.length === 0 && (
                <div className="text-center text-slate-500 text-sm py-4">
                  No lessons added yet. Click "+ Add Lesson" to start building your curriculum.
                </div>
              )}
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-800 flex justify-end gap-3 bg-slate-900/50 rounded-b-xl">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="create-course-form"
            className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-cyan-900/20 disabled:opacity-50 flex items-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              'Create Course'
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
