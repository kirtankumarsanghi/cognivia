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
      setRevisionPlan(revisionData || []);
    } catch (err: any) {
      console.error('[Revision] Failed to load revision data', err);
      showToast('Failed to load revision plan', 'error');
    } finally {
      setLoading(false);
    }
  };

  const generateSmartPlan = async () => {
    console.log('[Revision] Generating smart plan...');
    setGenerating(true);
    try {
      const result = await api.post('/revision/generate-smart-plan', {});
      console.log('[Revision] Generation result:', result);
      showToast(result.message || 'Smart revision plan generated!', 'success');
      await loadData(); // Reload the plan
    } catch (err: any) {
      console.error('[Revision] Failed to generate smart plan', err);
      showToast('Failed to generate plan. Try marking some concepts as confused first.', 'error');
    } finally {
      setGenerating(false);
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
      if (questions && questions.length > 0) {
        setPracticeQuestions(questions);
        setCurrentQuestionIndex(0);
        setPracticeResults({correct: 0, total: 0});
        setShowResults(false);
      } else {
        showToast('No practice questions available yet.', 'info');
        setPracticeMode(false);
      }
    } catch (err: any) {
      console.error('Failed to load practice questions', err);
      showToast('Failed to load practice questions', 'error');
      setPracticeMode(false);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!selectedAnswer) return;

    const currentQuestion = practiceQuestions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correct_answer;

    try {
      await api.post('/practice/attempt', {
        concept_id: currentConcept.concept_id,
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
      showToast('Revision completed! 🎉', 'success');
      await loadData();
    } catch (err) {
      console.error('Failed to complete revision', err);
      showToast('Failed to mark as complete', 'error');
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
                {currentConcept.concepts.name}
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
              <div className="mt-6 p-6 rounded-xl bg-surface-bright">
                <p className="text-on-surface">{currentQuestion.explanation}</p>
              </div>
            )}

            <div className="flex justify-end gap-4 mt-6">
              {!showFeedback ? (
                <button
                  onClick={handleAnswerSubmit}
                  disabled={!selectedAnswer}
                  className="bg-primary text-on-primary px-8 py-4 rounded-xl hover:opacity-90 disabled:opacity-50"
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="bg-primary text-on-primary px-8 py-4 rounded-xl hover:opacity-90"
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
              {revisionPlan.map((plan, index) => (
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
                        {plan.concepts.name}
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
                          {plan.minutes} min
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
                      to={`/tutor?concept=${plan.concept_id}`} 
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
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-16 text-center"
            >
              <span className="material-symbols-outlined text-[80px] text-[#3DD68C] mb-6 block">
                celebration
              </span>
              <h3 className="text-3xl text-on-surface mb-3 font-bold">
                You're All Caught Up!
              </h3>
              <p className="text-on-surface-variant text-lg mb-6">
                Your revision queue is empty. Generate a smart plan to find topics that need attention.
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
