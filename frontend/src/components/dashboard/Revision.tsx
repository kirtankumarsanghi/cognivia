import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Loading from '../ui/Loading';
import { useToast } from '../ui/Toast';

interface PracticeQuestion {
  id: string;
  question_text: string;
  question_type: 'mcq' | 'true_false' | 'short_answer';
  options?: string[];
  correct_answer: string;
  explanation?: string;
}

export default function Revision() {
  const api = useApi();
  const { showToast } = useToast();
  const [revisionPlan, setRevisionPlan] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [practiceMode, setPracticeMode] = useState(false);
  const [currentConcept, setCurrentConcept] = useState<any>(null);
  const [practiceQuestions, setPracticeQuestions] = useState<PracticeQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [practiceResults, setPracticeResults] = useState<{correct: number; total: number}>({correct: 0, total: 0});
  const [showResults, setShowResults] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const revisionData = await api.get('/revision/plan');
      console.log('[Revision] Loaded plan:', revisionData);
      
      if (!revisionData) {
        console.warn('[Revision] No data returned from API');
        setRevisionPlan([]);
      } else if (Array.isArray(revisionData)) {
        setRevisionPlan(revisionData);
      } else {
        console.warn('[Revision] Unexpected data format:', typeof revisionData);
        setRevisionPlan([]);
      }
    } catch (err: any) {
      console.error('[Revision] Failed to load revision data', err);
      showToast('Failed to load revision plan', 'error');
      setRevisionPlan([]);
    } finally {
      setLoading(false);
    }
  };

  const generateSmartPlan = async () => {
    console.log('[Revision] Generate button clicked');
    setGenerating(true);
    try {
      console.log('[Revision] Calling API: POST /revision/generate');
      const result = await api.post('/revision/generate', {});
      console.log('[Revision] Generation result:', result);
      
      if (!result) {
        throw new Error('No response from server');
      }
      
      showToast(result.message || 'Smart revision plan generated!', result.success !== false ? 'success' : 'info');
      
      if (result.plans && Array.isArray(result.plans) && result.plans.length > 0) {
        console.log('[Revision] Setting plans from response:', result.plans.length);
        setRevisionPlan(result.plans);
      } else {
        console.log('[Revision] No plans in response, reloading...');
        await loadData(); // Fallback to reloading the plan
      }
    } catch (err: any) {
      console.error('[Revision] Failed to generate smart plan:', err);
      const errorMessage = err.message || 'Failed to generate plan';
      showToast(
        errorMessage.includes('no data') || errorMessage.includes('all caught up')
          ? 'You\'re doing great! No concepts need immediate attention.'
          : 'Failed to generate plan. Try marking some concepts as confused first.',
        'error'
      );
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const startPractice = async (concept: any) => {
    console.log('[Revision] Starting practice for:', concept);
    setCurrentConcept(concept);
    setPracticeMode(true);
    try {
      const conceptId = concept.concept_id || concept.concepts?.id;
      console.log('[Revision] Extracted concept ID:', conceptId);
      
      if (!conceptId) {
        throw new Error('Invalid concept ID');
      }
      
      const questions = await api.get(`/practice?concept_id=${conceptId}`);
      console.log('[Revision] Loaded questions:', questions?.length);
      
      if (questions && Array.isArray(questions) && questions.length > 0) {
        setPracticeQuestions(questions);
        setCurrentQuestionIndex(0);
        setPracticeResults({correct: 0, total: 0});
        setShowResults(false);
      } else {
        showToast('No practice questions available yet.', 'info');
        setPracticeMode(false);
      }
    } catch (err: any) {
      console.error('[Revision] Failed to load practice questions:', err);
      showToast(err.message || 'Failed to load practice questions', 'error');
      setPracticeMode(false);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!selectedAnswer) return;

    const currentQuestion = practiceQuestions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correct_answer;

    try {
      const conceptId = currentConcept.concept_id || currentConcept.concepts?.id;
      if (!conceptId) {
        throw new Error('Invalid concept ID');
      }
      
      await api.post('/practice/attempt', {
        concept_id: conceptId,
        correct: isCorrect
      });
    } catch (err) {
      console.error('Failed to record practice attempt', err);
    }

    setPracticeResults(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));

    setShowFeedback(true);
  };

  const handleNextQuestion = () => {
    setShowFeedback(false);
    setSelectedAnswer('');
    
    if (currentQuestionIndex < practiceQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleCompleteRevision = async (planId: string) => {
    console.log('[Revision] Attempting to complete revision:', planId);
    try {
      const response = await api.post(`/revision/${planId}/complete`, {});
      console.log('[Revision] Complete response:', response);
      showToast('Revision completed! 🎉', 'success');
      await loadData();
    } catch (err: any) {
      console.error('[Revision] Failed to complete revision:', err);
      showToast(err.message || 'Failed to mark as complete', 'error');
    }
  };

  const handleFinishPractice = async () => {
    const accuracy = (practiceResults.correct / practiceResults.total) * 100;
    if (accuracy >= 70) {
      await handleCompleteRevision(currentConcept.id);
    }
    setPracticeMode(false);
    setCurrentConcept(null);
  };

  if (loading) return <Loading variant="revision" />;

  if (practiceMode && currentConcept) {
    const currentQuestion = practiceQuestions[currentQuestionIndex];
    const accuracy = practiceResults.total > 0 ? (practiceResults.correct / practiceResults.total) * 100 : 0;
    const conceptName = currentConcept.concepts?.name || currentConcept.name || 'Unknown Concept';

    return (
      <div className="page-shell min-h-screen">
        <button 
          onClick={() => setPracticeMode(false)} 
          className="back-link"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Exit Practice
        </button>

        <header className="page-heading">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-headline-xl text-3xl text-on-background">
                {conceptName}
              </h1>
              <p className="text-on-surface-variant mt-2">Practice Mode</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-surface-container px-4 py-2 rounded-lg">
                <span className="text-on-surface-variant">Question </span>
                <span className="text-on-surface font-bold">{currentQuestionIndex + 1}/{practiceQuestions.length}</span>
              </div>
              <div className="bg-surface-container px-4 py-2 rounded-lg">
                <span className="text-on-surface-variant">Accuracy: </span>
                <span className={`font-bold ${accuracy >= 70 ? 'text-[#3DD68C]' : 'text-error'}`}>
                  {Math.round(accuracy)}%
                </span>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6 h-2 w-full bg-surface-container rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestionIndex) / practiceQuestions.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </header>

        {showResults ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-surface-container rounded-2xl p-12 text-center"
          >
            <div className={`w-32 h-32 rounded-full mx-auto mb-6 flex items-center justify-center ${
              accuracy >= 70 ? 'bg-[#3DD68C]/20' : 'bg-error/20'
            }`}>
              <span className={`material-symbols-outlined text-[64px] ${
                accuracy >= 70 ? 'text-[#3DD68C]' : 'text-error'
              }`}>
                {accuracy >= 70 ? 'check_circle' : 'cancel'}
              </span>
            </div>

            <h2 className="text-3xl text-on-surface mb-4 font-bold">
              {accuracy >= 70 ? 'Great Job!' : 'Keep Practicing!'}
            </h2>
            <p className="text-on-surface-variant mb-8">
              You got {practiceResults.correct} out of {practiceResults.total} correct.
            </p>

            <div className="flex gap-4 justify-center">
              <button
                onClick={handleFinishPractice}
                className="bg-primary text-on-primary px-8 py-4 rounded-xl font-medium hover:opacity-90"
              >
                Back to Revision Plan
              </button>
            </div>
          </motion.div>
        ) : currentQuestion && (
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-surface-container rounded-2xl p-8"
          >
            <h2 className="text-2xl text-on-surface mb-6 font-semibold">
              {currentQuestion.question_text}
            </h2>

            {currentQuestion.question_type === 'mcq' && currentQuestion.options && (
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => !showFeedback && setSelectedAnswer(option)}
                    disabled={showFeedback}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      selectedAnswer === option
                        ? showFeedback
                          ? option === currentQuestion.correct_answer
                            ? 'border-[#3DD68C] bg-[#3DD68C]/10'
                            : 'border-error bg-error/10'
                          : 'border-primary bg-primary/10'
                        : 'border-outline-variant/20 hover:border-primary/50'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {showFeedback && currentQuestion.explanation && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-6 p-6 rounded-xl bg-surface-bright border border-outline-variant/20 overflow-hidden"
              >
                <div className="flex items-start gap-3">
                  <span className={`material-symbols-outlined mt-0.5 ${selectedAnswer === currentQuestion.correct_answer ? 'text-[#3DD68C]' : 'text-error'}`}>
                    {selectedAnswer === currentQuestion.correct_answer ? 'check_circle' : 'info'}
                  </span>
                  <div>
                    <h4 className={`font-bold mb-1 ${selectedAnswer === currentQuestion.correct_answer ? 'text-[#3DD68C]' : 'text-error'}`}>
                      {selectedAnswer === currentQuestion.correct_answer ? 'Correct!' : 'Incorrect'}
                    </h4>
                    <p className="text-on-surface">{currentQuestion.explanation}</p>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="flex justify-end gap-4 mt-6">
              {!showFeedback ? (
                <button
                  onClick={handleAnswerSubmit}
                  disabled={!selectedAnswer}
                  className="bg-primary text-on-primary px-8 py-4 rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-md font-medium"
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="bg-primary text-on-primary px-8 py-4 rounded-xl hover:opacity-90 transition-all shadow-md font-medium"
                >
                  {currentQuestionIndex < practiceQuestions.length - 1 ? 'Next Question' : 'See Results'}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <div className="page-shell min-h-screen">
      <Link to="/dashboard" className="back-link">
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Back to dashboard
      </Link>
      
      <header className="page-heading mb-8">
        <h1 className="font-headline-xl text-4xl text-on-background mb-2">
          Revision Plan
        </h1>
        <p className="text-on-surface-variant text-lg">
          Smart learning queue based on your progress and confusion signals
        </p>
      </header>

      <div className="bg-surface-container rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl text-on-surface font-semibold">Your Queue</h2>
            <p className="text-on-surface-variant">Prioritized topics for maximum impact</p>
          </div>
          <div className="flex items-center gap-3">
            {revisionPlan.length === 0 && (
              <button
                onClick={generateSmartPlan}
                disabled={generating}
                className="bg-primary text-on-primary px-6 py-3 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
              >
                {generating ? (
                  <>
                    <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
                    Generating...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                    Generate Plan
                  </>
                )}
              </button>
            )}
            <span className="bg-primary/10 text-primary px-4 py-2 rounded-full font-bold">
              {revisionPlan.length} Topics
            </span>
          </div>
        </div>
        
        <AnimatePresence mode="wait">
          {revisionPlan.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {revisionPlan.map((plan, index) => {
                // Safely extract concept data
                const concept = plan.concepts;
                const conceptName = concept?.name || 'Unknown Concept';
                const conceptId = plan.concept_id || concept?.id;
                const lesson = Array.isArray(concept?.lesson) ? concept.lesson[0] : concept?.lesson;
                const course = Array.isArray(lesson?.course) ? lesson.course[0] : lesson?.course;
                const courseName = course?.name || 'N/A';
                
                if (!conceptId) {
                  console.warn('[Revision] Skipping plan with missing concept_id:', plan);
                  return null;
                }
                
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-6 rounded-xl bg-surface-bright hover:bg-surface-container-high transition-colors border border-outline-variant/10"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-[28px]">menu_book</span>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-xl text-on-surface font-semibold mb-1">
                          {conceptName}
                        </h3>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                            plan.priority === 'High' 
                              ? 'bg-error/20 text-error' 
                              : plan.priority === 'Medium'
                              ? 'bg-[#E8A634]/20 text-[#E8A634]'
                              : 'bg-surface-container text-on-surface-variant'
                          }`}>
                            {plan.priority} Priority
                          </span>
                          <span className="text-sm text-on-surface-variant flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">schedule</span>
                            {plan.minutes || 10} min
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => startPractice(plan)}
                        className="bg-[#3DD68C] text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[20px]">quiz</span>
                        Practice
                      </button>
                      
                      <Link 
                        to={`/tutor?concept=${conceptId}`} 
                        className="bg-primary text-on-primary px-6 py-3 rounded-xl font-medium hover:opacity-90 flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[20px]">psychology</span>
                        Tutor
                      </Link>
                      
                      <button
                        onClick={() => handleCompleteRevision(plan.id)}
                        className="p-3 hover:bg-surface-container rounded-xl transition-colors"
                        title="Mark as complete"
                      >
                        <span className="material-symbols-outlined text-[24px] text-on-surface-variant hover:text-[#3DD68C]">
                          check_circle
                        </span>
                      </button>
                    </div>
                  </motion.div>
                );
              }).filter(Boolean)}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="p-16 text-center"
            >
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <span className="material-symbols-outlined text-[80px] text-[#3DD68C] mb-6 block drop-shadow-[0_0_15px_rgba(61,214,140,0.3)]">
                  celebration
                </span>
              </motion.div>
              <h3 className="text-3xl text-on-surface mb-3 font-bold tracking-tight">
                You're All Caught Up!
              </h3>
              <p className="text-on-surface-variant text-lg mb-8 max-w-md mx-auto">
                Your revision queue is empty. Generate a smart plan to find topics that need attention based on your learning metrics.
              </p>
              <button
                onClick={generateSmartPlan}
                disabled={generating}
                className="bg-primary text-on-primary px-8 py-4 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2 mx-auto"
              >
                {generating ? (
                  <>
                    <span className="material-symbols-outlined text-[24px] animate-spin">sync</span>
                    Analyzing Your Progress...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[24px]">auto_awesome</span>
                    Generate Smart Revision Plan
                  </>
                )}
              </button>
              <div className="mt-6 flex gap-3 justify-center">
                <Link 
                  to="/dashboard"
                  className="text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  Back to Dashboard
                </Link>
                <span className="text-on-surface-variant">·</span>
                <Link 
                  to="/courses"
                  className="text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  Explore Courses
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
