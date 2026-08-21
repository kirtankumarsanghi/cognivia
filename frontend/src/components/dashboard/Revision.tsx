import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeUpChild } from '../../utils/animation';
import Loading from '../ui/Loading';

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
  const [revisionPlan, setRevisionPlan] = useState<any[]>([]);
  const [completedToday, setCompletedToday] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [practiceMode, setPracticeMode] = useState(false);
  const [currentConcept, setCurrentConcept] = useState<any>(null);
  const [practiceQuestions, setPracticeQuestions] = useState<PracticeQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [practiceResults, setPracticeResults] = useState<{correct: number; total: number}>({correct: 0, total: 0});
  const [showResults, setShowResults] = useState(false);

  const loadData = async () => {
    try {
      const revisionData = await api.get('/revision/plan');
      setRevisionPlan(revisionData);
    } catch (err) {
      console.error('Failed to load revision data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const startPractice = async (concept: any) => {
    setCurrentConcept(concept);
    setPracticeMode(true);
    try {
      const questions = await api.get(`/practice?concept_id=${concept.concept_id}`);
      setPracticeQuestions(questions);
      setCurrentQuestionIndex(0);
      setPracticeResults({correct: 0, total: 0});
      setShowResults(false);
    } catch (err) {
      console.error('Failed to load practice questions', err);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!selectedAnswer) return;

    const currentQuestion = practiceQuestions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correct_answer;

    // Submit attempt to backend
    try {
      await api.post('/practice/attempt', {
        concept_id: currentConcept.concept_id,
        question_id: currentQuestion.id,
        answer: selectedAnswer,
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
    try {
      await api.post(`/revision/${planId}/complete`, {});
      await loadData();
    } catch (err) {
      console.error('Failed to complete revision', err);
    }
  };

  const handleFinishPractice = async () => {
    if (practiceResults.correct / practiceResults.total >= 0.7) {
      await handleCompleteRevision(currentConcept.id);
    }
    setPracticeMode(false);
    setCurrentConcept(null);
  };

  if (loading) return <Loading variant="revision" />;

  if (practiceMode && currentConcept) {
    const currentQuestion = practiceQuestions[currentQuestionIndex];
    const accuracy = practiceResults.total > 0 ? (practiceResults.correct / practiceResults.total) * 100 : 0;

    return (
      <div className="page-shell min-h-screen">
        <button 
          onClick={() => setPracticeMode(false)} 
          className="back-link"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to revision plan
        </button>

        <header className="page-heading">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-label-md text-label-md text-primary uppercase tracking-widest opacity-80 mb-stack-xs block">Practice Mode</span>
              <h1 className="font-headline-xl text-3xl leading-tight sm:text-headline-xl text-on-background m-0">
                {currentConcept.concepts.name}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-surface-container px-4 py-2 rounded-lg">
                <span className="font-body-sm text-on-surface-variant">Question </span>
                <span className="font-headline-md text-on-surface">{currentQuestionIndex + 1}</span>
                <span className="font-body-sm text-on-surface-variant"> / {practiceQuestions.length}</span>
              </div>
              <div className="bg-surface-container px-4 py-2 rounded-lg">
                <span className="font-body-sm text-on-surface-variant">Accuracy: </span>
                <span className={`font-headline-md ${accuracy >= 70 ? 'text-[#3DD68C]' : accuracy >= 50 ? 'text-[#E8A634]' : 'text-error'}`}>
                  {Math.round(accuracy)}%
                </span>
              </div>
            </div>
          </div>
        </header>

        {showResults ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-container rounded-2xl p-12 shadow-lg border border-outline-variant/10 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className={`w-32 h-32 rounded-full mx-auto mb-6 flex items-center justify-center ${
                accuracy >= 70 ? 'bg-[#3DD68C]/20' : 'bg-error/20'
              }`}
            >
              <span className={`material-symbols-outlined text-[64px] ${
                accuracy >= 70 ? 'text-[#3DD68C]' : 'text-error'
              }`}>
                {accuracy >= 70 ? 'check_circle' : 'cancel'}
              </span>
            </motion.div>

            <h2 className="font-headline-xl text-headline-xl text-on-surface mb-4">
              {accuracy >= 70 ? 'Great Job!' : 'Keep Practicing!'}
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-8">
              You got {practiceResults.correct} out of {practiceResults.total} questions correct.
            </p>

            {accuracy >= 70 ? (
              <div className="bg-[#3DD68C]/10 border border-[#3DD68C]/20 rounded-xl p-6 mb-8">
                <p className="font-body-md text-[#3DD68C]">
                  ✓ This concept has been marked as completed in your revision plan!
                </p>
              </div>
            ) : (
              <div className="bg-error/10 border border-error/20 rounded-xl p-6 mb-8">
                <p className="font-body-md text-error">
                  You need at least 70% accuracy to complete this revision. Try again after reviewing the material.
                </p>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <button
                onClick={handleFinishPractice}
                className="bg-primary text-on-primary px-8 py-4 rounded-xl font-label-md uppercase tracking-widest hover:opacity-90 transition-opacity"
              >
                Back to Revision Plan
              </button>
              {accuracy < 70 && (
                <Link
                  to={`/tutor?concept=${currentConcept.concept_id}`}
                  className="bg-surface-container-high text-on-surface px-8 py-4 rounded-xl font-label-md uppercase tracking-widest hover:bg-surface-bright transition-colors border border-outline-variant/10"
                >
                  Get AI Help
                </Link>
              )}
            </div>
          </motion.div>
        ) : currentQuestion ? (
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-surface-container rounded-2xl p-8 shadow-lg border border-outline-variant/10"
          >
            <div className="mb-8">
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-6">
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
                          : showFeedback && option === currentQuestion.correct_answer
                          ? 'border-[#3DD68C] bg-[#3DD68C]/10'
                          : 'border-outline-variant/20 hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedAnswer === option
                            ? showFeedback
                              ? option === currentQuestion.correct_answer
                                ? 'border-[#3DD68C] bg-[#3DD68C]'
                                : 'border-error bg-error'
                              : 'border-primary bg-primary'
                            : 'border-outline-variant'
                        }`}>
                          {selectedAnswer === option && (
                            <span className="material-symbols-outlined text-white text-[16px]">
                              {showFeedback 
                                ? option === currentQuestion.correct_answer ? 'check' : 'close'
                                : 'radio_button_checked'
                              }
                            </span>
                          )}
                        </div>
                        <span className="font-body-md text-on-surface">{option}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {currentQuestion.question_type === 'true_false' && currentQuestion.options && (
                <div className="grid grid-cols-2 gap-4">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => !showFeedback && setSelectedAnswer(option)}
                      disabled={showFeedback}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        selectedAnswer === option
                          ? showFeedback
                            ? option === currentQuestion.correct_answer
                              ? 'border-[#3DD68C] bg-[#3DD68C]/10'
                              : 'border-error bg-error/10'
                            : 'border-primary bg-primary/10'
                          : showFeedback && option === currentQuestion.correct_answer
                          ? 'border-[#3DD68C] bg-[#3DD68C]/10'
                          : 'border-outline-variant/20 hover:border-primary/50'
                      }`}
                    >
                      <span className="font-headline-md">{option}</span>
                    </button>
                  ))}
                </div>
              )}

              {showFeedback && currentQuestion.explanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className={`mt-6 p-6 rounded-xl border-2 ${
                    selectedAnswer === currentQuestion.correct_answer
                      ? 'border-[#3DD68C]/20 bg-[#3DD68C]/10'
                      : 'border-error/20 bg-error/10'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`material-symbols-outlined text-[24px] ${
                      selectedAnswer === currentQuestion.correct_answer ? 'text-[#3DD68C]' : 'text-error'
                    }`}>
                      {selectedAnswer === currentQuestion.correct_answer ? 'check_circle' : 'info'}
                    </span>
                    <div>
                      <h3 className={`font-label-md uppercase tracking-wider mb-2 ${
                        selectedAnswer === currentQuestion.correct_answer ? 'text-[#3DD68C]' : 'text-error'
                      }`}>
                        {selectedAnswer === currentQuestion.correct_answer ? 'Correct!' : 'Explanation'}
                      </h3>
                      <p className="font-body-md text-on-surface">{currentQuestion.explanation}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="flex justify-end gap-4">
              {!showFeedback ? (
                <button
                  onClick={handleAnswerSubmit}
                  disabled={!selectedAnswer}
                  className="bg-primary text-on-primary px-8 py-4 rounded-xl font-label-md uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Submit Answer
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="bg-primary text-on-primary px-8 py-4 rounded-xl font-label-md uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  {currentQuestionIndex < practiceQuestions.length - 1 ? 'Next Question' : 'See Results'}
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="bg-surface-container rounded-2xl p-12 text-center">
            <p className="font-body-lg text-on-surface-variant">Loading practice questions...</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="page-shell">
      <Link to="/dashboard" className="back-link">
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Back to dashboard
      </Link>
      
      <header className="page-heading">
        <div className="flex flex-col">
          <span className="font-label-md text-label-md text-primary uppercase tracking-widest opacity-80 mb-stack-xs">Revision Plan</span>
          <h1 className="font-headline-xl text-3xl leading-tight sm:text-headline-xl text-on-background m-0 flex items-center gap-3">
            <span className="material-symbols-outlined text-[32px] text-primary">event_repeat</span>
            Targeted Learning
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">
            AI-driven revision queue based on your confusion signals and test performance.
          </p>
        </div>
      </header>

      <section className="bg-surface-container rounded-2xl p-6 shadow-md border border-outline-variant/10">
        <div className="flex items-center justify-between mb-stack-md border-b border-outline-variant/10 pb-4">
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Your Queue</h2>
          <span className="font-label-md text-label-md text-on-primary bg-primary px-3 py-1.5 rounded-full uppercase tracking-widest">
            {revisionPlan.length} Topics
          </span>
        </div>
        
        <motion.div 
          variants={staggerContainer(0.05)} 
          initial="hidden" 
          animate="visible" 
          className="flex flex-col gap-y-4 pt-4"
        >
          {revisionPlan.map((plan) => (
            <motion.div 
              variants={fadeUpChild} 
              key={plan.id} 
              className="group flex flex-col md:flex-row md:items-center justify-between p-6 bg-surface rounded-xl hover:bg-surface-bright transition-colors border border-outline-variant/10 hover:border-primary/50 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-top"></div>
              
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-full bg-surface-bright flex items-center justify-center group-hover:bg-primary/20 transition-colors shrink-0">
                  <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-[24px]">
                    menu_book
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-headline-md text-headline-md text-on-surface font-medium mb-1">
                    {plan.concepts.name}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className={`font-label-sm text-label-sm uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      plan.priority === 'High' 
                        ? 'bg-[rgba(232,64,64,0.15)] text-error border border-error/20' 
                        : plan.priority === 'Medium'
                        ? 'bg-[rgba(232,166,52,0.15)] text-[#E8A634] border border-[#E8A634]/20'
                        : 'bg-surface-bright text-on-surface-variant'
                    }`}>
                      {plan.priority} Priority
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">schedule</span> 
                      {plan.minutes} min
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 md:mt-0 flex items-center justify-end md:justify-start gap-3 pl-[72px] md:pl-0">
                <button
                  onClick={() => startPractice(plan)}
                  className="bg-surface-container-high hover:bg-[#3DD68C] text-on-surface hover:text-white px-5 py-3 rounded-xl font-label-md tracking-widest uppercase transition-colors flex items-center gap-2 border border-outline-variant/10 hover:border-[#3DD68C]"
                >
                  Practice
                  <span className="material-symbols-outlined text-[18px]">quiz</span>
                </button>
                <Link 
                  to={`/tutor?concept=${plan.concept_id}`} 
                  className="bg-surface-container-high hover:bg-primary text-on-surface hover:text-on-primary px-5 py-3 rounded-xl font-label-md tracking-widest uppercase transition-colors flex items-center gap-2 border border-outline-variant/10 hover:border-primary"
                >
                  AI Tutor
                  <span className="material-symbols-outlined text-[18px]">psychology</span>
                </Link>
                <button
                  onClick={() => handleCompleteRevision(plan.id)}
                  className="bg-surface-container-high hover:bg-surface-bright text-on-surface px-5 py-3 rounded-xl transition-colors border border-outline-variant/10"
                  title="Mark as complete"
                >
                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                </button>
              </div>
            </motion.div>
          ))}
          
          {revisionPlan.length === 0 && (
            <div className="p-12 text-center flex flex-col items-center">
              <span className="material-symbols-outlined text-[64px] text-outline mb-4 opacity-20">
                celebration
              </span>
              <span className="font-headline-lg text-headline-lg text-on-surface mb-2">
                You're All Caught Up!
              </span>
              <span className="font-body-md text-body-md text-on-surface-variant">
                Your revision queue is empty. Keep up the great work in your courses.
              </span>
            </div>
          )}
        </motion.div>
      </section>
    </div>
  );
}
