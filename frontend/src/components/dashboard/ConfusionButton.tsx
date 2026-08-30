import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfusionButtonProps {
  onSignalCreated?: () => void;
}

export default function ConfusionButton({ onSignalCreated }: ConfusionButtonProps) {
  const api = useApi();
  const [showModal, setShowModal] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('');
  const [selectedConcept, setSelectedConcept] = useState('');
  const [signal, setSignal] = useState<'Confused' | 'Partially Clear' | 'Clear'>('Confused');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeSession, setActiveSession] = useState<any>(null);

  const handleOpen = async () => {
    setShowModal(true);
    try {
      const coursesData = await api.get('/courses');
      setCourses(coursesData);
      
      // Check for active session when modal opens
      if (selectedCourse) {
        try {
          const session = await api.get(`/sessions/active/${selectedCourse}`);
          setActiveSession(session);
        } catch (err) {
          // No active session, that's okay
          setActiveSession(null);
        }
      }
    } catch (err) {
      console.error('Failed to load courses', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConcept) return;

    setSubmitting(true);
    try {
      const selectedCourseData = courses.find(c => c.id === selectedCourse);
      const selectedLessonData = selectedCourseData?.lessons?.find((l: any) => l.id === selectedLesson);
      const selectedConceptData = selectedLessonData?.concepts?.find((c: any) => c.id === selectedConcept);

      await api.post('/confusion/signal', {
        courseId: selectedCourse,
        concept_id: selectedConcept,
        concept: selectedConceptData?.name || 'Unknown Concept',
        signal,
        note,
        session_id: activeSession?.id || null
      });
      setSuccess(true);
      setTimeout(() => {
        setShowModal(false);
        setSuccess(false);
        setSelectedCourse('');
        setSelectedLesson('');
        setSelectedConcept('');
        setNote('');
        onSignalCreated?.();
      }, 1500);
    } catch (err) {
      console.error('Failed to create signal', err);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCourseData = courses.find(c => c.id === selectedCourse);
  const selectedLessonData = selectedCourseData?.lessons?.find((l: any) => l.id === selectedLesson);
  const concepts = selectedLessonData?.concepts || [];

  return (
    <>
      {/* Fixed Button - Mobile Responsive */}
      <motion.button
        onClick={handleOpen}
        className="fixed bottom-20 right-4 md:bottom-8 md:right-[100px] z-50 flex items-center gap-2 bg-error text-on-error px-4 py-3 md:px-6 md:py-4 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-transform font-label-sm md:font-label-md uppercase tracking-widest"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
      >
        <span className="material-symbols-outlined text-[20px] md:text-[24px]">help</span>
        <span className="hidden sm:inline">I'm Confused</span>
        <span className="sm:hidden">Help</span>
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !submitting && setShowModal(false)}
            />
            <motion.div
              className="fixed inset-0 z-[70] flex items-end md:items-center justify-center p-0 md:p-4"
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
            >
              <div className="bg-surface-container rounded-t-3xl md:rounded-2xl p-6 md:p-8 max-w-2xl w-full max-h-[85vh] md:max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                {success ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-4"
                    >
                      <span className="material-symbols-outlined text-primary text-[48px]">check_circle</span>
                    </motion.div>
                    <h3 className="font-headline-lg text-headline-lg text-on-surface mb-2">Confusion Signal Received!</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant text-center">
                      We've added this to your revision plan and updated your dashboard.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-headline-md md:font-headline-lg text-headline-md md:text-headline-lg text-on-surface">What are you confused about?</h2>
                      <button
                        onClick={() => setShowModal(false)}
                        className="w-10 h-10 rounded-full hover:bg-surface-bright active:bg-surface-bright transition-colors flex items-center justify-center shrink-0"
                      >
                        <span className="material-symbols-outlined text-on-surface-variant">close</span>
                      </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Course Selection */}
                      <div>
                        <label className="font-label-sm text-label-sm text-outline uppercase tracking-wider mb-2 block">
                          Current Course
                        </label>
                        <select
                          value={selectedCourse}
                          onChange={(e) => {
                            setSelectedCourse(e.target.value);
                            setSelectedLesson('');
                            setSelectedConcept('');
                            // Check for active session when course changes
                            if (e.target.value) {
                              api.get(`/sessions/active/${e.target.value}`)
                                .then(session => setActiveSession(session))
                                .catch(() => setActiveSession(null));
                            } else {
                              setActiveSession(null);
                            }
                          }}
                          className="w-full bg-surface border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface text-base focus:outline-none focus:border-primary transition-colors"
                          required
                        >
                          <option value="">Select a course...</option>
                          {courses.map(course => (
                            <option key={course.id} value={course.id}>{course.name}</option>
                          ))}
                        </select>
                        {activeSession && (
                          <div className="mt-2 flex items-center gap-2 text-xs text-primary">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                            <span>Live session active - your signal will be timestamped!</span>
                          </div>
                        )}
                      </div>

                      {/* Lesson Selection */}
                      {selectedCourse && (
                        <div>
                          <label className="font-label-sm text-label-sm text-outline uppercase tracking-wider mb-2 block">
                            Current Lesson
                          </label>
                          <select
                            value={selectedLesson}
                            onChange={(e) => {
                              setSelectedLesson(e.target.value);
                              setSelectedConcept('');
                            }}
                            className="w-full bg-surface border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors"
                            required
                          >
                            <option value="">Select a lesson...</option>
                            {selectedCourseData?.lessons?.map((lesson: any) => (
                              <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Concept Selection */}
                      {selectedLesson && (
                        <div>
                          <label className="font-label-sm text-label-sm text-outline uppercase tracking-wider mb-2 block">
                            Current Concept
                          </label>
                          {concepts.length > 0 ? (
                            <select
                              value={selectedConcept}
                              onChange={(e) => setSelectedConcept(e.target.value)}
                              className="w-full bg-surface border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors"
                              required
                            >
                              <option value="">Select a concept...</option>
                              {concepts.map((concept: any) => (
                                <option key={concept.id} value={concept.id}>{concept.name}</option>
                              ))}
                            </select>
                          ) : (
                            <div className="w-full bg-surface-variant/50 border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface-variant text-sm flex items-center gap-2">
                              <span className="material-symbols-outlined text-sm">info</span>
                              No concepts available for this lesson.
                            </div>
                          )}
                        </div>
                      )}

                      {/* Signal Selection */}
                      {selectedConcept && (
                        <>
                          <div>
                            <label className="font-label-sm text-label-sm text-outline uppercase tracking-wider mb-3 block">
                              How clear is this concept to you?
                            </label>
                            <div className="grid grid-cols-3 gap-2 md:gap-3">
                              <button
                                type="button"
                                onClick={() => setSignal('Confused')}
                                className={`p-3 md:p-4 rounded-xl border-2 transition-all ${
                                  signal === 'Confused'
                                    ? 'border-error bg-error/10 text-error'
                                    : 'border-outline-variant/20 hover:border-error/50 active:border-error/50'
                                }`}
                              >
                                <span className="material-symbols-outlined text-[28px] md:text-[32px] mb-1 md:mb-2">sentiment_very_dissatisfied</span>
                                <p className="font-label-sm uppercase text-xs md:text-sm">Confused</p>
                              </button>
                              <button
                                type="button"
                                onClick={() => setSignal('Partially Clear')}
                                className={`p-3 md:p-4 rounded-xl border-2 transition-all ${
                                  signal === 'Partially Clear'
                                    ? 'border-[#E8A634] bg-[#E8A634]/10 text-[#E8A634]'
                                    : 'border-outline-variant/20 hover:border-[#E8A634]/50 active:border-[#E8A634]/50'
                                }`}
                              >
                                <span className="material-symbols-outlined text-[28px] md:text-[32px] mb-1 md:mb-2">sentiment_neutral</span>
                                <p className="font-label-sm uppercase text-xs md:text-sm">Partial</p>
                              </button>
                              <button
                                type="button"
                                onClick={() => setSignal('Clear')}
                                className={`p-3 md:p-4 rounded-xl border-2 transition-all ${
                                  signal === 'Clear'
                                    ? 'border-[#3DD68C] bg-[#3DD68C]/10 text-[#3DD68C]'
                                    : 'border-outline-variant/20 hover:border-[#3DD68C]/50 active:border-[#3DD68C]/50'
                                }`}
                              >
                                <span className="material-symbols-outlined text-[28px] md:text-[32px] mb-1 md:mb-2">sentiment_satisfied</span>
                                <p className="font-label-sm uppercase text-xs md:text-sm">Clear</p>
                              </button>
                            </div>
                          </div>

                          {/* Optional Note */}
                          <div>
                            <label className="font-label-sm text-label-sm text-outline uppercase tracking-wider mb-2 block">
                              What part is confusing? (Optional)
                            </label>
                            <textarea
                              value={note}
                              onChange={(e) => setNote(e.target.value)}
                              placeholder="E.g., I don't understand why the array needs to be sorted first..."
                              className="w-full bg-surface border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors resize-none"
                              rows={3}
                            />
                          </div>

                          {/* Submit Button */}
                          <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-primary text-on-primary py-4 rounded-xl font-label-md uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {submitting ? (
                              <>
                                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                Submitting...
                              </>
                            ) : (
                              <>
                                <span className="material-symbols-outlined">send</span>
                                Submit Signal
                              </>
                            )}
                          </button>
                        </>
                      )}
                    </form>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
