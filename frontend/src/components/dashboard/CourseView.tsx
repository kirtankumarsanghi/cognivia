import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeUpChild } from '../../utils/animation';
import Loading from '../ui/Loading';
import ConceptGraph from '../concepts/ConceptGraph';
import Toast, { useToast } from '../ui/Toast';

export default function CourseView() {
  const { id } = useParams();
  const api = useApi();
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  
  const [course, setCourse] = useState<any>(null);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [selectedConcept, setSelectedConcept] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'lessons' | 'graph'>('lessons');
  const [loading, setLoading] = useState(true);
  const [conceptDetails, setConceptDetails] = useState<any>(null);
  const [loadingConcept, setLoadingConcept] = useState(false);
  const [pulseData, setPulseData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPulse() {
      try {
        const data = await api.get('/confusion/pulse');
        setPulseData(data || []);
      } catch (err) {
        console.error('Failed to fetch pulse data', err);
      }
    }
    fetchPulse();
    const intervalId = setInterval(fetchPulse, 15000);
    return () => clearInterval(intervalId);
  }, [api]);

  useEffect(() => {
    async function loadCourse() {
      try {
        setError(null);
        const courseData = await api.get(`/courses/${id}`);
        setCourse(courseData);
        if (courseData.lessons && courseData.lessons.length > 0) {
          setSelectedLesson(courseData.lessons[0]);
        }
      } catch (err: any) {
        console.error('Failed to load course', err);
        setError(err.message || 'Failed to load course data');
      } finally {
        setLoading(false);
      }
    }
    loadCourse();
  }, [id, api]);

  const loadConceptDetails = async (conceptId: string) => {
    setLoadingConcept(true);
    try {
      const details = await api.get(`/concepts/${conceptId}`);
      setConceptDetails(details);
    } catch (err) {
      console.error('Failed to load concept details', err);
    } finally {
      setLoadingConcept(false);
    }
  };

  const handleConceptClick = (concept: any) => {
    setSelectedConcept(concept);
    loadConceptDetails(concept.id);
  };

  const handleMarkClear = async () => {
    if (!selectedConcept) return;
    try {
      await api.post('/confusion/signal', {
        concept_id: selectedConcept.id,
        signal: 'Clear'
      });
      // Reload concept details to show updated mastery
      await loadConceptDetails(selectedConcept.id);
      
      // Show success feedback
      showToast('Great! Your mastery has been updated.', 'success');
    } catch (err) {
      console.error('Failed to mark concept as clear', err);
      showToast('Failed to update mastery. Please try again.', 'error');
    }
  };

  const handleAddToRevision = async () => {
    if (!selectedConcept) return;
    try {
      await api.post('/confusion/signal', {
        concept_id: selectedConcept.id,
        signal: 'Confused'
      });
      showToast('Added to your revision plan!', 'success');
    } catch (err) {
      console.error('Failed to add to revision', err);
      showToast('Failed to add to revision plan. Please try again.', 'error');
    }
  };

  if (loading) return <Loading variant="course" />;
  
  if (error) {
    return (
      <div className="page-shell">
        <div className="min-h-[60vh] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-container rounded-2xl p-8 max-w-md w-full text-center border border-error/20"
          >
            <span className="material-symbols-outlined text-error text-[48px] mb-4">error</span>
            <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Failed to Load Course</h2>
            <p className="font-body-md text-on-surface-variant mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/courses')}
                className="bg-surface-container-high text-on-surface px-6 py-3 rounded-xl font-label-md uppercase tracking-widest hover:bg-surface-bright transition-colors"
              >
                Back to Courses
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-primary text-on-primary px-6 py-3 rounded-xl font-label-md uppercase tracking-widest hover:opacity-90 transition-opacity"
              >
                Try Again
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }
  
  if (!course) return <div className="page-shell">Course not found</div>;

  const calculateProgress = () => {
    if (!course.lessons) return 0;
    const totalConcepts = course.lessons.reduce((sum: number, lesson: any) => 
      sum + (lesson.concepts?.length || 0), 0);
    return totalConcepts > 0 ? Math.round((5 / totalConcepts) * 100) : 0; // Simplified calculation
  };


  return (
    <div className="page-shell">
      <Link to="/courses" className="back-link">
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Back to courses
      </Link>

      {/* Course Header */}
      <header className="bg-surface-container rounded-2xl p-8 shadow-md border border-outline-variant/10 mb-8">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-[40px]">menu_book</span>
            </div>
            <div>
              <span className="font-label-md text-label-md text-outline uppercase tracking-widest">{course.code}</span>
              <h1 className="font-headline-xl text-3xl text-on-surface mt-2 mb-3">{course.name}</h1>
              <p className="font-body-md text-on-surface-variant max-w-2xl">{course.description}</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="bg-surface rounded-xl p-4 mb-3">
              <span className="font-headline-lg text-headline-lg text-on-surface">{calculateProgress()}%</span>
              <p className="font-label-sm text-label-sm text-outline uppercase">Progress</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 h-2 bg-surface-bright rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${calculateProgress()}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Lessons Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-surface-container rounded-2xl p-6 shadow-md border border-outline-variant/10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-headline-md text-headline-md text-on-surface">Lessons</h2>
              <button 
                onClick={() => setViewMode(viewMode === 'graph' ? 'lessons' : 'graph')}
                className="text-sm font-label-sm uppercase tracking-wider text-primary hover:opacity-80 transition-opacity"
              >
                {viewMode === 'graph' ? 'List View' : 'Map View'}
              </button>
            </div>
            <div className="space-y-2">
              {course.lessons?.map((lesson: any, index: number) => (
                <button
                  key={lesson.id}
                  onClick={() => {
                    setSelectedLesson(lesson);
                    setSelectedConcept(null);
                    setConceptDetails(null);
                  }}
                  className={`w-full text-left p-4 rounded-xl transition-all ${
                    selectedLesson?.id === lesson.id
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface hover:bg-surface-bright text-on-surface'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`font-label-md ${
                      selectedLesson?.id === lesson.id ? 'text-on-primary' : 'text-outline'
                    }`}>
                      {(index + 1).toString().padStart(2, '0')}
                    </span>
                    <div className="flex-1">
                      <p className="font-body-md font-medium">{lesson.title}</p>
                      <p className={`font-body-sm ${
                        selectedLesson?.id === lesson.id ? 'text-on-primary/80' : 'text-on-surface-variant'
                      }`}>
                        {lesson.concepts?.length || 0} concepts
                      </p>
                    </div>
                    {selectedLesson?.id === lesson.id && (
                      <span className="material-symbols-outlined">chevron_right</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-8">
          {viewMode === 'graph' ? (
            <ConceptGraph />
          ) : (
            <>
              {selectedLesson && !selectedConcept && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface-container rounded-2xl p-8 shadow-md border border-outline-variant/10"
            >
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">
                {selectedLesson.title}
              </h2>
              <p className="font-body-md text-on-surface-variant mb-8">
                {selectedLesson.description || 'Explore the concepts in this lesson.'}
              </p>

              <h3 className="font-label-md text-label-md text-outline uppercase tracking-widest mb-4">
                Concepts
              </h3>
              <motion.div
                variants={staggerContainer(0.05)}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {selectedLesson.concepts?.map((concept: any) => (
                  <motion.button
                    key={concept.id}
                    variants={fadeUpChild}
                    onClick={() => handleConceptClick(concept)}
                    className="text-left p-6 bg-surface rounded-xl hover:bg-surface-bright transition-all border border-outline-variant/10 hover:border-primary/50 group"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <span className="material-symbols-outlined text-primary text-[24px]">
                        lightbulb
                      </span>
                      <span className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm uppercase border ${
                        concept.difficulty === 'beginner'
                          ? 'text-[#3DD68C] bg-[#3DD68C]/10 border-[#3DD68C]/20'
                          : concept.difficulty === 'intermediate'
                          ? 'text-[#E8A634] bg-[#E8A634]/10 border-[#E8A634]/20'
                          : 'text-error bg-error/10 border-error/20'
                      }`}>
                        {concept.difficulty}
                      </span>
                    </div>
                    <h4 className="font-headline-sm text-headline-sm text-on-surface mb-2 group-hover:text-primary transition-colors">
                      {concept.name}
                    </h4>
                    <p className="font-body-sm text-on-surface-variant line-clamp-2 mb-3">
                      {concept.description || 'Click to learn more about this concept.'}
                    </p>
                    {pulseData.find(p => p.concept_id === concept.id && p.confusion_percentage > 20) && (
                      <div className="flex items-center gap-2 mt-2 text-error">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-error"></span>
                        </span>
                        <span className="text-xs font-medium">
                          {pulseData.find(p => p.concept_id === concept.id).confusion_percentage}% of your class also flagged this
                        </span>
                      </div>
                    )}
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>
          )}

          {selectedConcept && (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedConcept.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Back Button */}
                <button
                  onClick={() => {
                    setSelectedConcept(null);
                    setConceptDetails(null);
                  }}
                  className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-body-md"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  Back to lesson
                </button>

                {/* Concept Header */}
                <div className="bg-surface-container rounded-2xl p-8 shadow-md border border-outline-variant/10">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="font-headline-xl text-3xl text-on-surface mb-3">
                        {selectedConcept.name}
                      </h2>
                      <p className="font-body-lg text-on-surface-variant">
                        {selectedConcept.description}
                      </p>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full font-label-md uppercase border ${
                      selectedConcept.difficulty === 'beginner'
                        ? 'text-[#3DD68C] bg-[#3DD68C]/10 border-[#3DD68C]/20'
                        : selectedConcept.difficulty === 'intermediate'
                        ? 'text-[#E8A634] bg-[#E8A634]/10 border-[#E8A634]/20'
                        : 'text-error bg-error/10 border-error/20'
                    }`}>
                      {selectedConcept.difficulty}
                    </span>
                  </div>

                  {loadingConcept ? (
                    <div className="py-8 text-center">
                      <span className="material-symbols-outlined animate-spin text-primary text-[32px]">
                        progress_activity
                      </span>
                    </div>
                  ) : conceptDetails && (
                    <>
                      {/* Mastery & Confusion Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-surface p-6 rounded-xl">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="material-symbols-outlined text-primary">verified</span>
                            <span className="font-label-sm text-outline uppercase tracking-wider">Mastery</span>
                          </div>
                          <span className="font-headline-lg text-headline-lg text-on-surface">
                            {Math.round(conceptDetails.mastery)}%
                          </span>
                          <div className="mt-3 h-2 bg-surface-bright rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all duration-500"
                              style={{ width: `${conceptDetails.mastery}%` }}
                            />
                          </div>
                        </div>
                        <div className="bg-surface p-6 rounded-xl">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="material-symbols-outlined text-error">help</span>
                            <span className="font-label-sm text-outline uppercase tracking-wider">Confusion</span>
                          </div>
                          <span className="font-headline-lg text-headline-lg text-error">
                            {conceptDetails.confusion}%
                          </span>
                          <div className="mt-3 h-2 bg-surface-bright rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-error transition-all duration-500"
                              style={{ width: `${conceptDetails.confusion}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Prerequisites */}
                      {conceptDetails.prerequisites && conceptDetails.prerequisites.length > 0 && (
                        <div className="bg-[#E8A634]/10 border border-[#E8A634]/20 rounded-xl p-6 mb-6">
                          <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-[#E8A634] text-[24px]">
                              account_tree
                            </span>
                            <div>
                              <h3 className="font-label-md text-[#E8A634] uppercase tracking-wider mb-2">
                                Prerequisites
                              </h3>
                              <p className="font-body-sm text-on-surface-variant mb-3">
                                Make sure you understand these concepts first:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {conceptDetails.prerequisites.map((prereq: any) => (
                                  <span
                                    key={prereq.id}
                                    className="px-3 py-1.5 bg-surface rounded-lg font-body-sm text-on-surface"
                                  >
                                    {prereq.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <button
                          onClick={() => navigate(`/tutor?concept=${selectedConcept.id}`)}
                          className="bg-primary text-on-primary px-6 py-4 rounded-xl font-label-md uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined">psychology</span>
                          Ask Cogniva
                        </button>
                        <button
                          onClick={() => navigate(`/revision`)}
                          className="bg-surface-container-high hover:bg-[#E8A634] text-on-surface hover:text-white px-6 py-4 rounded-xl font-label-md uppercase tracking-widest transition-colors flex items-center justify-center gap-2 border border-outline-variant/10 hover:border-[#E8A634]"
                        >
                          <span className="material-symbols-outlined">quiz</span>
                          Practice
                        </button>
                        {conceptDetails.confusion > 30 ? (
                          <button
                            onClick={handleAddToRevision}
                            className="bg-error/10 hover:bg-error text-error hover:text-white px-6 py-4 rounded-xl font-label-md uppercase tracking-widest transition-colors flex items-center justify-center gap-2 border border-error/20"
                          >
                            <span className="material-symbols-outlined">add</span>
                            Add to Revision
                          </button>
                        ) : (
                          <button
                            onClick={handleMarkClear}
                            className="bg-[#3DD68C]/10 hover:bg-[#3DD68C] text-[#3DD68C] hover:text-white px-6 py-4 rounded-xl font-label-md uppercase tracking-widest transition-colors flex items-center justify-center gap-2 border border-[#3DD68C]/20"
                          >
                            <span className="material-symbols-outlined">check_circle</span>
                            Mark Clear
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          )}
            </>
          )}
        </div>
      </div>
      
      {/* Toast Notifications */}
      <Toast 
        message={toast.message}
        type={toast.type}
        isOpen={toast.isOpen}
        onClose={hideToast}
      />
    </div>
  );
}
